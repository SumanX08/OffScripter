import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import type { SubmitEvent } from "react";

import Button from "./Button";
import Logo from "./Logo";
import { useAuthenticatedApi } from "../../hooks/useAuthApi";
export default function Onboarding() {
  const api = useAuthenticatedApi();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event:SubmitEvent) => {
    event.preventDefault();

    console.log("Onboarding form submitted");

    setError("");

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (normalizedUsername.length > 20) {
      setError("Username must be at most 20 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      setError(
        "Username can only contain letters, numbers, and underscores."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Creating OffScripter profile...");
      console.log("Username:", normalizedUsername);

      const response = await api.post("/users/me", {
        username: normalizedUsername,
      });

      console.log("Profile created:", response.data);

      window.location.replace("/dashboard");

    } catch (error: unknown) {
      console.error("Failed to create profile:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              error?: {
                message?: string;
              };
            };
          };
        };

        if (axiosError.response?.status === 409) {
          setError("That username is already taken.");
          return;
        }

        if (axiosError.response?.data?.error?.message) {
          setError(axiosError.response.data.error.message);
          return;
        }
      }

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col">
        <Logo />

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="w-full">
            <div className="mb-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-rust">
                Welcome to OffScripter
              </p>

              <h1 className="text-4xl font-black tracking-tight text-forest md:text-5xl">
                Choose your username.
              </h1>

              <p className="mt-4 max-w-lg text-base leading-7 text-forest/60">
                This is how you'll appear on OffScripter.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-bold text-forest"
                >
                  Username
                </label>

                <div className="flex items-center border border-forest/20 bg-white focus-within:border-forest">
                  <span className="border-r border-forest/10 px-4 py-3.5 text-forest/40">
                    @
                  </span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                    placeholder="suman08"
                    maxLength={20}
                    autoComplete="username"
                    autoFocus
                    className="w-full bg-transparent px-4 py-3.5 text-forest outline-none placeholder:text-forest/30"
                  />
                </div>

                {error && (
                  <p className="mt-2 text-sm font-medium text-rust">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || username.trim().length < 3}
                className="w-full justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}