import posthog from "posthog-js";

posthog.init(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN,
  {
    api_host: "https://us.i.posthog.com",
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
  }
);

export default posthog;