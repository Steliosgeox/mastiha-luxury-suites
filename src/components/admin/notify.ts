"use client";

/* Device notifications for the host: Web Push through a service worker, plus a chime. */

export type PushState = "on" | "off" | "unsupported" | "blocked" | "missing" | "ios";

const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
// iOS only allows web push for apps added to the Home Screen.
const iosBrowserTab = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone;

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - base64.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

async function register() {
  const registration = await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" });
  await navigator.serviceWorker.ready;
  return registration;
}

export async function pushState(): Promise<PushState> {
  if (!supported()) return iosBrowserTab() ? "ios" : "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "off";
  const registration = await navigator.serviceWorker.getRegistration("/admin");
  return (await registration?.pushManager.getSubscription()) ? "on" : "off";
}

export async function enablePush(): Promise<PushState> {
  if (!supported()) return iosBrowserTab() ? "ios" : "unsupported";
  const { publicKey } = await fetch("/api/admin/push", { cache: "no-store" }).then(response => response.json()) as { publicKey: string | null };
  if (!publicKey) return "missing";
  if (await Notification.requestPermission() !== "granted") return "blocked";
  const registration = await register();
  const subscription = await registration.pushManager.getSubscription()
    ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
  const response = await fetch("/api/admin/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  return response.ok ? "on" : "off";
}

export async function disablePush(): Promise<PushState> {
  const registration = await navigator.serviceWorker.getRegistration("/admin");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await fetch("/api/admin/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
    await subscription.unsubscribe();
  }
  return "off";
}

let audio: AudioContext | null = null;
/** A soft two-note chime for new guest messages while the portal is open. */
export function chime() {
  try {
    audio ??= new AudioContext();
    const start = audio.currentTime;
    [880, 1318.5].forEach((frequency, index) => {
      const oscillator = audio!.createOscillator();
      const gain = audio!.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + index * .12);
      gain.gain.linearRampToValueAtTime(.12, start + index * .12 + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, start + index * .12 + .5);
      oscillator.connect(gain).connect(audio!.destination);
      oscillator.start(start + index * .12);
      oscillator.stop(start + index * .12 + .55);
    });
  } catch { /* audio unavailable */ }
}
