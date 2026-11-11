import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Wrap your existing App component


import { PostHogProvider } from "@posthog/react";


import "./index.css";
import "./styles/globals.css";
import "./styles/landing.css"

import App from "./App.tsx";

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
};

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
       <PostHogProvider
      apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN}
      options={options}
    >
      <App />
      </PostHogProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ClerkProvider>
);