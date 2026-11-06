"use client";

import { useEffect } from "react";

/**
 * Phòng thủ chống lại các lỗi do Chrome Extension của trình duyệt gây ra
 * Ví dụ: TypeError: Cannot read properties of undefined (reading 'M_ID') tại 200.js:1:761
 * Giúp Next.js không bị crash toàn màn hình ("Application error: a client-side exception has occurred")
 */
export function ExtensionErrorGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "";
      const stack = reason?.stack || "";

      if (
        message.includes("M_ID") ||
        stack.includes("200.js") ||
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://")
      ) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message || "";
      const filename = event.filename || "";

      if (
        message.includes("M_ID") ||
        filename.includes("200.js") ||
        filename.includes("chrome-extension://") ||
        filename.includes("moz-extension://")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return <>{children}</>;
}
