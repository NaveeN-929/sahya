use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::{ChatMessage, ChatRole, LlmProvider};

pub struct OllamaProvider {
    client: reqwest::Client,
    base_url: String,
    model: String,
}

impl OllamaProvider {
    pub fn from_env() -> Self {
        let base_url = std::env::var("OLLAMA_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:11434".to_string());
        let model = std::env::var("OLLAMA_MODEL").unwrap_or_else(|_| "llama3.2".to_string());
        Self {
            client: reqwest::Client::new(),
            base_url,
            model,
        }
    }
}

#[derive(Serialize)]
struct OllamaMessage {
    role: &'static str,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<OllamaMessage>,
    stream: bool,
}

#[derive(Deserialize)]
struct ChatResponse {
    message: ResponseMessage,
}

#[derive(Deserialize)]
struct ResponseMessage {
    content: String,
}

#[async_trait]
impl LlmProvider for OllamaProvider {
    async fn complete(&self, messages: &[ChatMessage]) -> anyhow::Result<String> {
        let request = ChatRequest {
            model: self.model.clone(),
            messages: messages
                .iter()
                .map(|m| OllamaMessage {
                    role: match m.role {
                        ChatRole::System => "system",
                        ChatRole::User => "user",
                        ChatRole::Assistant => "assistant",
                    },
                    content: m.content.clone(),
                })
                .collect(),
            stream: false,
        };

        let response = self
            .client
            .post(format!("{}/api/chat", self.base_url))
            .json(&request)
            .send()
            .await
            .map_err(|err| {
                anyhow::anyhow!(
                    "could not reach Ollama at {} (is `docker compose up -d` running and has \
                     the model been pulled?): {err}",
                    self.base_url
                )
            })?
            .error_for_status()
            .map_err(|err| anyhow::anyhow!("Ollama returned an error: {err}"))?
            .json::<ChatResponse>()
            .await
            .map_err(|err| anyhow::anyhow!("could not parse Ollama response: {err}"))?;

        Ok(response.message.content)
    }
}
