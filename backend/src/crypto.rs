//! Per-user envelope encryption (PRD §8.5, §10.4).
//!
//! Pattern: a single master key (env-provided) wraps a random 32-byte data-encryption key
//! (DEK) generated once per user at account creation; the wrapped DEK is stored on the
//! `users` row. Content (journal entries, incidents, AI messages) is encrypted with the
//! user's *unwrapped* DEK, never with the master key directly — so a leak of one user's
//! content never exposes another user's key material, and rotating the master key only
//! requires re-wrapping DEKs, not re-encrypting all content.
//!
//! The master key here comes from an environment variable, which is adequate for local
//! development and a small-team MVP but is not a substitute for a real KMS (AWS KMS,
//! GCP KMS, HashiCorp Vault) in production — rotate this onto a real KMS before handling
//! real user disclosures (see CLAUDE.md non-negotiable #5 and the `go-live-checklist` skill).

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use anyhow::{Context, anyhow};
use rand::Rng;

const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

#[derive(Clone)]
pub struct MasterKey(Vec<u8>);

impl MasterKey {
    /// Reads `SAHAY_MASTER_KEY` (base64-encoded 32 bytes) from the environment. Generates
    /// an ephemeral key with a loud warning if unset, so local dev still works — but data
    /// encrypted under an ephemeral key is unrecoverable after restart, which is correct
    /// behavior for a key that was never meant to be real.
    pub fn from_env() -> anyhow::Result<Self> {
        match std::env::var("SAHAY_MASTER_KEY") {
            Ok(value) => {
                let bytes =
                    base64::Engine::decode(&base64::engine::general_purpose::STANDARD, value)
                        .context("SAHAY_MASTER_KEY is not valid base64")?;
                if bytes.len() != KEY_LEN {
                    return Err(anyhow!(
                        "SAHAY_MASTER_KEY must decode to {KEY_LEN} bytes, got {}",
                        bytes.len()
                    ));
                }
                Ok(Self(bytes))
            }
            Err(_) => {
                tracing::warn!(
                    "SAHAY_MASTER_KEY not set — generating an ephemeral key for this process \
                     only. Encrypted content will be unreadable after restart. Set \
                     SAHAY_MASTER_KEY for any persistent environment."
                );
                let mut bytes = vec![0u8; KEY_LEN];
                rand::rng().fill_bytes(&mut bytes);
                Ok(Self(bytes))
            }
        }
    }

    fn cipher(&self) -> Aes256Gcm {
        let key = Key::<Aes256Gcm>::try_from(self.0.as_slice()).expect("master key is 32 bytes");
        Aes256Gcm::new(&key)
    }

    /// Generates a fresh per-user DEK and returns it wrapped (encrypted) under the master
    /// key, ready to store on the `users` row as `wrapped_dek`.
    pub fn generate_wrapped_dek(&self) -> anyhow::Result<Vec<u8>> {
        let mut dek = [0u8; KEY_LEN];
        rand::rng().fill_bytes(&mut dek);
        seal(&self.cipher(), &dek)
    }

    pub fn unwrap_dek(&self, wrapped_dek: &[u8]) -> anyhow::Result<UserKey> {
        let dek = open(&self.cipher(), wrapped_dek)?;
        let mut key = [0u8; KEY_LEN];
        key.copy_from_slice(&dek);
        Ok(UserKey(key))
    }
}

/// An unwrapped per-user data-encryption key. Lives only for the duration of a request —
/// never persisted, never logged.
pub struct UserKey([u8; KEY_LEN]);

impl UserKey {
    fn cipher(&self) -> Aes256Gcm {
        let key = Key::<Aes256Gcm>::try_from(self.0.as_slice()).expect("user key is 32 bytes");
        Aes256Gcm::new(&key)
    }

    pub fn encrypt(&self, plaintext: &str) -> anyhow::Result<Vec<u8>> {
        seal(&self.cipher(), plaintext.as_bytes())
    }

    pub fn decrypt(&self, blob: &[u8]) -> anyhow::Result<String> {
        let plaintext = open(&self.cipher(), blob)?;
        String::from_utf8(plaintext).context("decrypted content was not valid UTF-8")
    }
}

/// Encrypts `plaintext` and returns `nonce (12 bytes) || ciphertext`, suitable for storing
/// as a single `bytea` column.
fn seal(cipher: &Aes256Gcm, plaintext: &[u8]) -> anyhow::Result<Vec<u8>> {
    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from(nonce_bytes);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext)
        .map_err(|_| anyhow!("encryption failed"))?;
    let mut out = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    out.extend_from_slice(&nonce_bytes);
    out.extend_from_slice(&ciphertext);
    Ok(out)
}

fn open(cipher: &Aes256Gcm, blob: &[u8]) -> anyhow::Result<Vec<u8>> {
    if blob.len() < NONCE_LEN {
        return Err(anyhow!("ciphertext too short to contain a nonce"));
    }
    let (nonce_bytes, ciphertext) = blob.split_at(NONCE_LEN);
    let nonce = Nonce::try_from(nonce_bytes).expect("split_at guarantees NONCE_LEN bytes");
    cipher
        .decrypt(&nonce, ciphertext)
        .map_err(|_| anyhow!("decryption failed — wrong key or corrupted ciphertext"))
}
