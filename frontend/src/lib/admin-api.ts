// Typed client for Sahay's admin API (`/api/v1/admin/...`). Deliberately a separate file
// from `lib/api.ts` — admin sessions use a different token (`sahay_admin_token`) and must
// never be confused with or leak into the end-user session token (see `admin_auth.rs`).

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const ADMIN_TOKEN_STORAGE_KEY = "sahay_admin_token";
const ADMIN_NAME_STORAGE_KEY = "sahay_admin_display_name";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function getStoredAdminName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_NAME_STORAGE_KEY);
}

function setStoredAdminName(name: string) {
  window.localStorage.setItem(ADMIN_NAME_STORAGE_KEY, name);
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_NAME_STORAGE_KEY);
}

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new AdminApiError(response.status, text || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function adminLogin(email: string, password: string): Promise<{ display_name: string }> {
  const result = await adminFetch<{ session_token: string; display_name: string }>(
    "/api/v1/admin/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
  setAdminToken(result.session_token);
  setStoredAdminName(result.display_name);
  return { display_name: result.display_name };
}

export async function adminLogout(): Promise<void> {
  await adminFetch("/api/v1/admin/auth/logout", { method: "POST" });
  clearAdminSession();
}

// ---------------------------------------------------------------------------
// Knowledge review
// ---------------------------------------------------------------------------
export interface AdminArticle {
  id: string;
  title: string;
  content: string;
  content_category: string;
  source_citation: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}
export function listAdminArticles(): Promise<AdminArticle[]> {
  return adminFetch("/api/v1/admin/knowledge/articles");
}
export function createAdminArticle(body: {
  title: string;
  content: string;
  content_category: string;
  source_citation: string;
}): Promise<{ id: string }> {
  return adminFetch("/api/v1/admin/knowledge/articles", { method: "POST", body: JSON.stringify(body) });
}
export function updateAdminArticle(
  id: string,
  body: { title: string; content: string; content_category: string; source_citation: string },
): Promise<void> {
  return adminFetch(`/api/v1/admin/knowledge/articles/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function deleteAdminArticle(id: string): Promise<void> {
  return adminFetch(`/api/v1/admin/knowledge/articles/${id}`, { method: "DELETE" });
}
export function approveAdminArticle(id: string): Promise<void> {
  return adminFetch(`/api/v1/admin/knowledge/articles/${id}/approve`, { method: "POST" });
}
export function unpublishAdminArticle(id: string): Promise<void> {
  return adminFetch(`/api/v1/admin/knowledge/articles/${id}/unpublish`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Professional vetting
// ---------------------------------------------------------------------------
export interface AdminProfessional {
  id: string;
  name: string;
  category: string;
  credentials_verified: boolean;
  verification_method: string | null;
  verified_at: string | null;
  specializations: string[];
  location: string | null;
  languages: string[];
  fee_structure: string | null;
  contact_info: Record<string, unknown>;
  platform_review_status: string;
}
export interface ProfessionalUpsertBody {
  name: string;
  category: string;
  specializations: string[];
  location?: string;
  languages: string[];
  fee_structure?: string;
  contact_info: Record<string, unknown>;
}
export function listAdminProfessionals(status?: string): Promise<AdminProfessional[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return adminFetch(`/api/v1/admin/professionals${qs}`);
}
export function createAdminProfessional(body: ProfessionalUpsertBody): Promise<{ id: string }> {
  return adminFetch("/api/v1/admin/professionals", { method: "POST", body: JSON.stringify(body) });
}
export function updateAdminProfessional(id: string, body: ProfessionalUpsertBody): Promise<void> {
  return adminFetch(`/api/v1/admin/professionals/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function verifyAdminProfessional(id: string, verification_method: string): Promise<void> {
  return adminFetch(`/api/v1/admin/professionals/${id}/verify`, {
    method: "POST",
    body: JSON.stringify({ verification_method }),
  });
}
export function rejectAdminProfessional(id: string): Promise<void> {
  return adminFetch(`/api/v1/admin/professionals/${id}/reject`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Crisis monitoring (aggregate/categorical only — never per-user)
// ---------------------------------------------------------------------------
export interface CrisisSummary {
  since: string;
  until: string;
  total_events: number;
  resolved_events: number;
  by_category: { category: string; event_count: number }[];
  by_action_taken: { user_action_taken: string; event_count: number }[];
  by_day: { day: string; event_count: number }[];
}
export function getCrisisSummary(params?: { since?: string; until?: string }): Promise<CrisisSummary> {
  const search = new URLSearchParams();
  if (params?.since) search.set("since", params.since);
  if (params?.until) search.set("until", params.until);
  const qs = search.toString();
  return adminFetch(`/api/v1/admin/crisis/summary${qs ? `?${qs}` : ""}`);
}

// ---------------------------------------------------------------------------
// Data-subject requests (break-glass — always logged, reason required)
// ---------------------------------------------------------------------------
export interface UserLookupResult {
  id: string;
  pseudonymous_handle: string;
  created_at: string;
  journal_entry_count: number;
  conversation_count: number;
}
export function lookupAdminUser(handle: string): Promise<UserLookupResult> {
  return adminFetch(`/api/v1/admin/users/lookup?handle=${encodeURIComponent(handle)}`);
}
export function exportAdminUser(id: string, reason: string): Promise<unknown> {
  return adminFetch(`/api/v1/admin/users/${id}/export`, { method: "POST", body: JSON.stringify({ reason }) });
}
export function deleteAdminUser(id: string, reason: string): Promise<void> {
  return adminFetch(`/api/v1/admin/users/${id}/delete`, { method: "POST", body: JSON.stringify({ reason }) });
}

// ---------------------------------------------------------------------------
// Audit log (read-only)
// ---------------------------------------------------------------------------
export interface AuditLogEntry {
  id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  reason: string | null;
  created_at: string;
}
export function listAuditLog(params?: { limit?: number; offset?: number }): Promise<AuditLogEntry[]> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return adminFetch(`/api/v1/admin/audit-log${qs ? `?${qs}` : ""}`);
}
