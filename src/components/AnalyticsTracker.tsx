"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionIdRef = useRef<string>("");
  const currentPageViewIdRef = useRef<string | null>(null);
  const pageStartTimeRef = useRef<number>(0);

  // Get or create session ID
  const getOrCreateSessionId = (): string => {
    if (sessionIdRef.current) return sessionIdRef.current;

    // Try to get session ID from cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "session-id") {
        sessionIdRef.current = value;
        console.log("📊 Using existing session:", value);
        return value;
      }
    }

    // Create new session ID only if none exists
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    document.cookie = `session-id=${sessionId}; max-age=${30 * 24 * 60 * 60}; path=/; samesite=lax`;
    sessionIdRef.current = sessionId;
    console.log("📊 Created new session:", sessionId);
    return sessionId;
  };

  // Track page view
  const trackPageView = async () => {
    // Update duration of previous page view
    if (currentPageViewIdRef.current && pageStartTimeRef.current) {
      const duration = Date.now() - pageStartTimeRef.current;
      try {
        await fetch("/api/analytics/duration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageViewId: currentPageViewIdRef.current,
            duration,
          }),
        });
      } catch (error) {
        console.error("Failed to update page view duration:", error);
      }
    }

    try {
      // Get viewport information and additional device info for better fingerprinting
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Get additional device information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelDepth: (window.screen as any).pixelDepth || window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer,
          sessionId: getOrCreateSessionId(),
          userId: session?.user?.id ? parseInt(session.user.id) : undefined,
          viewport,
          deviceInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        currentPageViewIdRef.current = data.pageViewId;
        pageStartTimeRef.current = Date.now();
        console.log("📊 Page view tracked:", pathname);
      }
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  };

  // Track page view on pathname change
  useEffect(() => {
    trackPageView();
  }, [pathname]);

  // Track page visibility changes and unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        currentPageViewIdRef.current &&
        pageStartTimeRef.current
      ) {
        const duration = Date.now() - pageStartTimeRef.current;
        navigator.sendBeacon(
          "/api/analytics/duration",
          JSON.stringify({
            pageViewId: currentPageViewIdRef.current,
            duration,
          }),
        );
      }
    };

    const handleBeforeUnload = () => {
      if (currentPageViewIdRef.current && pageStartTimeRef.current) {
        const duration = Date.now() - pageStartTimeRef.current;
        navigator.sendBeacon(
          "/api/analytics/duration",
          JSON.stringify({
            pageViewId: currentPageViewIdRef.current,
            duration,
          }),
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // This component doesn't render anything
}
