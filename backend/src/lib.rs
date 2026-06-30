//! Library crate root — exists so `src/bin/create_admin.rs` can share `admin_auth` (and the
//! rest of the application) with `main.rs` without duplicating code. `main.rs` is a thin
//! binary that just calls into this crate.

pub mod admin_auth;
pub mod auth;
pub mod config;
pub mod crisis;
pub mod crypto;
pub mod dsr;
pub mod llm;
pub mod routes;
