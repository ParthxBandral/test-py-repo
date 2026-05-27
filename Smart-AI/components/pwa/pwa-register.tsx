"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function() {
        navigator.serviceWorker.register("/service-worker.js").then(
          function(registration) {
            console.log("Service Worker registration successful");
          },
          function(err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
