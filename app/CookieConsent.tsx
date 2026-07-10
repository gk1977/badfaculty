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

  return (
    <>
      <style>{`
  .bf-cookie-banner {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    background: #1f2430;
    color: #f5f5f5;
    border-top: 3px solid #b3151b;
    font-size: 14px;
    line-height: 1.45;
  }
  .bf-cookie-text { max-width: 760px; }
  .bf-cookie-text strong { color: #ffffff; }
  .bf-cookie-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }
  .bf-cookie-btn {
    font: inherit;
    font-weight: 600;
    padding: 9px 18px;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
  }
  .bf-cookie-accept {
    background: #b3151b;
    color: #ffffff;
    border-color: #b3151b;
  }
  .bf-cookie-accept:hover { background: #93070c; }
  .bf-cookie-decline {
    background: transparent;
    color: #f5f5f5;
    border-color: #6b7280;
  }
  .bf-cookie-decline:hover { border-color: #f5f5f5; }
  .bf-cookie-reopen {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 900;
    font: inherit;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #1f2430;
    cursor: pointer;
  }
  .bf-cookie-reopen:hover { border-color: #b3151b; color: #b3151b; }
  @media (max-width: 620px) {
    .bf-cookie-banner { flex-direction: column; align-items: stretch; }
    .bf-cookie-actions { justify-content: flex-end; }
  }
      `}</style>
      {visible ? (
        <div
          className="bf-cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie notice"
        >
          <div className="bf-cookie-text">
            <strong>We use cookies.</strong> BadFaculty.com uses cookies and
            analytics (Microsoft Clarity) to understand how the site is used and
            improve it. Analytics is on by default. You can decline at any time.
          </div>
          <div className="bf-cookie-actions">
            <button
              type="button"
              className="bf-cookie-btn bf-cookie-decline"
              onClick={decline}
            >
              Decline
            </button>
            <button
              type="button"
              className="bf-cookie-btn bf-cookie-accept"
              onClick={accept}
            >
              Accept
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={reopen}
          className="bf-cookie-reopen"
          aria-label="Open cookie settings"
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
