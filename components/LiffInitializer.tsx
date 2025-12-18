"use client";

import { useEffect } from "react";

/**
 * Initializes LIFF early in the app lifecycle so that any page can safely
 * call liff APIs. This also redirects to LINE login when not authenticated.
 */
export default function LiffInitializer() {
  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      console.warn("Missing NEXT_PUBLIC_LIFF_ID; skipping LIFF init");
      return;
    }

    let cancelled = false;

    const initLiff = async () => {
      try {
        const { default: liff } = await import("@line/liff");

        try {
          await liff.init({ liffId });
        } catch (err: any) {
          // Ignore duplicate init attempts; surface other errors.
          if (!err?.message?.toLowerCase?.().includes("already")) {
            throw err;
          }
        }

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        if (!cancelled) {
          console.log("[LINE] LIFF initialized and logged in");
        }
      } catch (error) {
        console.error("LIFF init failed", error);
      }
    };

    void initLiff();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
