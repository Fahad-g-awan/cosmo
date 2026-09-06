"use client";

import { useEffect, useCallback } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY!;

export const useRecaptchaV3 = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;

    const script = document.createElement("script");
    script.src = `${process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_URL}?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback((action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const waitForGrecaptcha = () => {
        if (typeof window === "undefined") {
          reject(new Error("reCAPTCHA not available"));
          return;
        }

        if (!window.grecaptcha) {
          setTimeout(waitForGrecaptcha, 100);
          return;
        }

        window.grecaptcha.ready(() => {
          window
            .grecaptcha!.execute(SITE_KEY, { action })
            .then(resolve)
            .catch(reject);
        });
      };

      waitForGrecaptcha();
    });
  }, []);

  return { executeRecaptcha };
};
