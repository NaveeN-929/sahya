// Hands a first message typed on the landing page off to /chat without putting raw
// disclosure content in the URL (PRD §2.3 — anonymity/data-minimization is load-bearing
// here, not cosmetic). sessionStorage clears when the tab closes.
const KEY = "sahay_pending_message";

export function setPendingMessage(message: string) {
  window.sessionStorage.setItem(KEY, message);
}

export function takePendingMessage(): string | null {
  const message = window.sessionStorage.getItem(KEY);
  if (message !== null) window.sessionStorage.removeItem(KEY);
  return message;
}
