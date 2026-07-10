"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bf-cookie-consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

function applyClarityConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  if (typeof window.clarity === "function") {
    window.clarity("consent", granted);
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    if (stored === "declined") {
      applyClarityConsent(false);
      setVisible(false);
    } else if (stored === "accepted") {
      applyClarityConsent(true);
      setVisible(false);
    } else {
      // Opt-out model: tracking is on by default until the user declines.
      applyClarityConsent(true);
      setVisible(true);
    }
    setReady(true);
  }, []);

  function persist(choice: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore storage errors */
    }
  }

  function accept() {
    persist("accepted");
    applyClarityConsent(true);
    setVisible(false);
  }

  function decline() {
    persist("declined");
    applyClarityConsent(false);
    setVisible(false);
  }

  function reopen() {
    setVisible(true);
  }

  if (!ready) return null;

  if (!visible) {
    return (
      <button
        type="button"
        onClick={reopen}
        className="bf-cookie-reopen"
        aria-label="Open cookie settings"
      >
        Cookie settings
      </button>
    );
  }

  return (
    <div className="bf-cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <div className="bf-cookie-text">
        <strong>We use cookies.</strong> BadFaculty.com uses cookies and analytics
        (Microsoft Clarity) to understand how the site is used and improve it. Analytics
        is on by default. You can decline at any time.
      </div>
      <div className="bf-cookie-actions">
        <button type="button" className="bf-cookie-btn bf-cookie-decline" onClick={decline}>
          Decline
        </button>
        <button type="button" className="bf-cookie-btn bf-cookie-accept" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
