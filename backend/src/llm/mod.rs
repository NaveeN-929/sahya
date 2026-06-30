//! LLM provider abstraction (PRD §9.7). Agent code calls `LlmProvider`, never a specific
//! provider's SDK/API shape directly — swapping the backing model (a different local model,
//! a hosted provider) is a config/implementation change here, not a rewrite of agent logic.

mod ollama;

pub use ollama::OllamaProvider;

use async_trait::async_trait;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ChatRole {
    System,
    User,
    Assistant,
}

pub struct ChatMessage {
    pub role: ChatRole,
    pub content: String,
}

#[async_trait]
pub trait LlmProvider: Send + Sync {
    async fn complete(&self, messages: &[ChatMessage]) -> anyhow::Result<String>;
}
