// Typed client for Sahay's backend (PRD §11). Every call here is the *only* path the
// frontend uses to reach the API — components never construct fetch() calls directly, so
// auth headers and error handling stay consistent in one place (CLAUDE.md "API surface").

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const TOKEN_STORAGE_KEY = "sahay_session_token";
const HANDLE_STORAGE_KEY = "sahay_pseudonymous_handle";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredHandle(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(HANDLE_STORAGE_KEY);
}

function setStoredHandle(handle: string) {
  window.localStorage.setItem(HANDLE_STORAGE_KEY, handle);
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(HANDLE_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, text || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Creates a new anonymous session if one isn't already stored. Safe to call on every
 * page load — a no-op once a token exists (PRD §13.1: silent, no form, no email/phone). */
export async function ensureSession(): Promise<{ pseudonymous_handle: string }> {
  const existing = getStoredHandle();
  if (getToken() && existing) return { pseudonymous_handle: existing };

  const session = await apiFetch<{ session_token: string; pseudonymous_handle: string }>(
    "/api/v1/auth/anonymous-session",
    { method: "POST" },
  );
  setToken(session.session_token);
  setStoredHandle(session.pseudonymous_handle);
  return { pseudonymous_handle: session.pseudonymous_handle };
}

export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
  clearSession();
}

// ---------------------------------------------------------------------------
// Crisis resources (FR-4.3) — always fetchable, no auth required.
// ---------------------------------------------------------------------------
export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  resource_type: string;
  availability: string;
}
export function crisisResources(): Promise<CrisisResource[]> {
  return apiFetch("/api/v1/directory/crisis-resources");
}

// ---------------------------------------------------------------------------
// AI Companion (FR-1)
// ---------------------------------------------------------------------------
export interface ConverseResponse {
  conversation_id: string;
  response: string;
  safety_interrupt: { resources: CrisisResource[] } | null;
  citations: string[];
}
export function converse(body: {
  conversation_id?: string | null;
  message: string;
  agent_type?: string;
}): Promise<ConverseResponse> {
  return apiFetch("/api/v1/agent/converse", { method: "POST", body: JSON.stringify(body) });
}

export interface ConversationSummary {
  id: string;
  agent_type: string;
  created_at: string;
}
export function listConversations(): Promise<ConversationSummary[]> {
  return apiFetch("/api/v1/agent/conversations");
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
export function getConversation(id: string): Promise<AgentMessage[]> {
  return apiFetch(`/api/v1/agent/conversations/${id}`);
}

export function deleteConversation(id: string): Promise<void> {
  return apiFetch(`/api/v1/agent/conversations/${id}`, { method: "DELETE" });
}

export function checkin(body: { mood_score: number; note?: string }): Promise<void> {
  return apiFetch("/api/v1/agent/checkin", { method: "POST", body: JSON.stringify(body) });
}

// ---------------------------------------------------------------------------
// Journal (FR-3.1)
// ---------------------------------------------------------------------------
export interface JournalEntry {
  id: string;
  content: string;
  mood_score: number | null;
  entry_type: string;
  created_at: string;
  updated_at: string;
}
export function listJournalEntries(): Promise<JournalEntry[]> {
  return apiFetch("/api/v1/journal/entries");
}
export function createJournalEntry(body: {
  content: string;
  mood_score?: number;
}): Promise<JournalEntry> {
  return apiFetch("/api/v1/journal/entries", { method: "POST", body: JSON.stringify(body) });
}
export function deleteJournalEntry(id: string): Promise<void> {
  return apiFetch(`/api/v1/journal/entries/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Knowledge Platform (FR-2)
// ---------------------------------------------------------------------------
export interface ArticleSummary {
  id: string;
  title: string;
  content_category: string;
  source_citation: string;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
}
export interface ArticleDetail extends ArticleSummary {
  content: string;
}
export function listArticles(params?: { category?: string; q?: string }): Promise<ArticleSummary[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString();
  return apiFetch(`/api/v1/knowledge/articles${qs ? `?${qs}` : ""}`);
}
export function getArticle(id: string): Promise<ArticleDetail> {
  return apiFetch(`/api/v1/knowledge/articles/${id}`);
}

// ---------------------------------------------------------------------------
// Resource Directory (FR-4)
// ---------------------------------------------------------------------------
export interface ProfessionalSummary {
  id: string;
  name: string;
  category: string;
  credentials_verified: boolean;
  verification_method: string | null;
  specializations: string[];
  location: string | null;
  languages: string[];
  platform_review_status: string;
}
export function searchProfessionals(params?: {
  category?: string;
  location?: string;
  language?: string;
  specialization?: string;
}): Promise<ProfessionalSummary[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.location) search.set("location", params.location);
  if (params?.language) search.set("language", params.language);
  if (params?.specialization) search.set("specialization", params.specialization);
  const qs = search.toString();
  return apiFetch(`/api/v1/directory/search${qs ? `?${qs}` : ""}`);
}

// ---------------------------------------------------------------------------
// Account & privacy (FR-5)
// ---------------------------------------------------------------------------
export interface ConsentRecord {
  id: string;
  consent_type: string;
  granted_at: string;
  revoked_at: string | null;
  policy_version_at_consent: string;
}
export function listConsents(): Promise<ConsentRecord[]> {
  return apiFetch("/api/v1/auth/consents");
}
export function grantConsent(body: { consent_type: string; policy_version: string }): Promise<ConsentRecord> {
  return apiFetch("/api/v1/auth/consents", { method: "POST", body: JSON.stringify(body) });
}
export function revokeConsent(id: string): Promise<void> {
  return apiFetch(`/api/v1/auth/consents/${id}/revoke`, { method: "POST" });
}
export function exportAccount(): Promise<unknown> {
  return apiFetch("/api/v1/account/export");
}
export async function deleteAccount(): Promise<void> {
  await apiFetch("/api/v1/account", { method: "DELETE" });
  clearSession();
}
