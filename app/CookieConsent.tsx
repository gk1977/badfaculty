"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    right: 16px;
    bottom: 16px;
    z-index: 1000;
    width: 320px;
    max-width: calc(100vw - 32px);
    padding: 14px 16px 16px;
    background: #1f2430;
    color: #e7e9ee;
    border-top: 2px solid #b3151b;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    font-size: 13px;
    line-height: 1.5;
  }
  .bf-cookie-text { margin: 0 0 12px; }
  .bf-cookie-text strong { color: #ffffff; }
  .bf-cookie-text a { color: #f0a6a9; text-decoration: underline; }
  .bf-cookie-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .bf-cookie-btn {
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 14px;
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
    color: #e7e9ee;
    border-color: #6b7280;
  }
  .bf-cookie-decline:hover { border-color: #e7e9ee; }
  .bf-cookie-reopen {
    position: fixed;
    left: 12px;
    bottom: 12px;
    z-index: 900;
    font: inherit;
    font-size: 11px;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.9);
    color: #6b7280;
    cursor: pointer;
    opacity: 0.7;
  }
  .bf-cookie-reopen:hover { opacity: 1; border-color: #b3151b; color: #b3151b; }
  @media (max-width: 480px) {
    .bf-cookie-banner { right: 12px; left: 12px; bottom: 12px; width: auto; }
  }
      `}</style>
      {visible ? (
        <div
          className="bf-cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie notice"
        >
          <p className="bf-cookie-text">
            <strong>Cookies &amp; analytics.</strong> We use Microsoft Clarity to
            see how the site is used. It&apos;s on by default — you can decline
            anytime. <Link href="/privacy">Learn more</Link>.
          </p>
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
