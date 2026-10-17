
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  LoaderCircle,

  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type SubscriptionStatus = {
  isPro: boolean;
  status?: string | null;
  currentPeriodEnd?: string | null;
  currentPeriodStart?: string | null;
  cancelAtCycleEnd?: boolean;
};

export default function Settings() {
  const { user, isLoaded } = useUser();
  const api = useAuthenticatedApi();

  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");

  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    setUsername(user?.username || "");
  }, [isLoaded, user?.username]);

  const loadSubscription = useCallback(async () => {
    setCheckingSubscription(true);
    setSubscriptionError("");

    try {
      const response = await api.get("/payments/status");
      setSubscription(response.data.data);
    } catch {
      setSubscriptionError("Unable to load your subscription details.");
    } finally {
      setCheckingSubscription(false);
    }
  }, [api]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const handleSaveUsername = async () => {
    const normalized = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setUsernameError(
        "Use 3–20 characters: lowercase letters, numbers, or underscores."
      );
      return;
    }

    if (normalized === user?.username) {
      setEditingUsername(false);
      setUsernameError("");
      return;
    }

    setSavingUsername(true);
    setUsernameError("");
    setUsernameMessage("");

    try {
      // Your backend must validate uniqueness and sync the profile.
      await api.patch("/users/me", { username: normalized });

      // Refresh Clerk's user data so the displayed username stays current.
      await user?.reload();
      setUsername(user?.username || normalized);
      setUsernameMessage("Username updated successfully.");
      setEditingUsername(false);
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      if (status === 409 || code === "USERNAME_TAKEN") {
        setUsernameError("That username is already taken.");
      } else {
        setUsernameError(
          error?.response?.data?.message ||
            "Couldn't update your username. Please try again."
        );
      }
    } finally {
      setSavingUsername(false);
    }
  };

  const formattedDate = (date?: string | null) => {
    if (!date) return null;

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const remainingDays = (date?: string | null) => {
    if (!date) return null;

    const end = new Date(date).getTime();
    if (Number.isNaN(end)) return null;

    return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
  };

  const periodEnd = formattedDate(subscription?.currentPeriodEnd);
  const daysLeft = remainingDays(subscription?.currentPeriodEnd);

  const displayName =
    user?.fullName || user?.firstName || "Your account";
  const email =
    user?.primaryEmailAddress?.emailAddress || "No email available";

  return (
    <main className="min-h-full bg-cream px-4 py-8 text-forest sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-olive">
            Your workspace
          </p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 text-sm leading-6 text-forest/60 sm:text-base">
            Manage your profile and subscription.
          </p>
        </header>

        <div className="space-y-6">
          {/* Account settings */}
          <section className="rounded-2xl border border-forest/10 bg-[#FFFDF5] p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-mist">
                <UserRound size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Account information</h2>
                <p className="mt-1 text-sm text-forest/55">
                  Your profile and account details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoaded && user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="size-14 rounded-full border-2 border-amber/50 object-cover"
                />
              ) : (
                <div className="grid size-14 place-items-center rounded-full bg-mist">
                  <UserRound size={24} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{displayName}</p>
                <p className="mt-1 truncate text-sm text-forest/55">
                  {email}
                </p>
              </div>

              <ShieldCheck size={20} className="shrink-0 text-olive" />
            </div>

            <div className="mt-6 border-t border-forest/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="username"
                  className="text-sm font-semibold"
                >
                  Username
                </label>

                {!editingUsername && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(user?.username || "");
                      setUsernameError("");
                      setUsernameMessage("");
                      setEditingUsername(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-olive transition hover:bg-mist"
                  >
                    <Pencil size={15} />
                    Edit username
                  </button>
                )}
              </div>

              {editingUsername ? (
                <div className="mt-3">
                  <div className="flex items-center rounded-xl border border-forest/20 bg-white px-3 focus-within:border-olive focus-within:ring-2 focus-within:ring-olive/15">
                    <span className="text-sm text-forest/40">@</span>
                    <input
                      id="username"
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                        setUsernameError("");
                        setUsernameMessage("");
                      }}
                      maxLength={20}
                      autoComplete="username"
                      placeholder="your_username"
                      className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-forest/50">
                    3–20 characters. Use letters, numbers, and underscores.
                  </p>

                  {usernameError && (
                    <p role="alert" className="mt-2 text-sm text-red-700">
                      {usernameError}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingUsername}
                      onClick={() => void handleSaveUsername()}
                      className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-cream hover:bg-olive disabled:opacity-60"
                    >
                      {savingUsername && (
                        <LoaderCircle size={16} className="animate-spin" />
                      )}
                      Save changes
                    </button>

                    <button
                      type="button"
                      disabled={savingUsername}
                      onClick={() => {
                        setUsername(user?.username || "");
                        setUsernameError("");
                        setEditingUsername(false);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-forest/65 hover:bg-forest/5"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
                  <span className="text-forest/40">@</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {user?.username || "No username set"}
                  </span>
                  <CheckCircle2 size={17} className="text-olive" />
                </div>
              )}

              {usernameMessage && !editingUsername && (
                <p role="status" className="mt-3 text-sm text-olive">
                  {usernameMessage}
                </p>
              )}
            </div>
          </section>

          {/* Subscription validity */}
          <section className="overflow-hidden rounded-2xl border border-forest/10 bg-[#FFFDF5] shadow-sm">
            <div className="flex items-center gap-3 p-5 sm:p-7">
              <div className="grid size-11 place-items-center rounded-xl bg-soft">
                <Crown size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Your subscription</h2>
                <p className="mt-1 text-sm text-forest/55">
                  Plan, billing period, and validity
                </p>
              </div>
            </div>

            <div className="mx-5 mb-5 rounded-xl border border-forest/10 bg-cream p-5 sm:mx-7 sm:mb-7 sm:p-6">
              {checkingSubscription ? (
                <div className="flex items-center gap-2 py-4 text-sm text-forest/60">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading subscription...
                </div>
              ) : subscriptionError ? (
                <div>
                  <p className="text-sm text-rust">{subscriptionError}</p>
                  <button
                    type="button"
                    onClick={() => void loadSubscription()}
                    className="mt-3 text-sm font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl font-bold">
                        {subscription?.isPro ? "OffScripter Pro" : "Free plan"}
                      </p>
                      <p className="mt-1 text-sm text-forest/55">
                        {subscription?.isPro
                          ? "Premium features unlocked"
                          : "Upgrade whenever you're ready"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        subscription?.isPro
                          ? "bg-mist text-forest"
                          : "bg-forest/5 text-forest/60"
                      }`}
                    >
                      {subscription?.isPro ? "● Active" : "Free"}
                    </span>
                  </div>

                  <div className="my-5 border-t border-forest/10" />

                  {subscription?.isPro ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-forest/10 bg-[#FFFDF5] p-4">
                        <div className="flex items-center gap-2 text-xs text-forest/55">
                          <CalendarDays size={15} />
                          {subscription.cancelAtCycleEnd
                            ? "Access valid until"
                            : "Current period ends"}
                        </div>
                        <p className="mt-2 text-lg font-bold">
                          {periodEnd || "Date unavailable"}
                        </p>
                        {daysLeft !== null && (
                          <p className="mt-1 text-xs text-forest/55">
                            {daysLeft === 0
                              ? "Ends today or has ended"
                              : `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-forest/10 bg-[#FFFDF5] p-4">
                        <p className="text-xs text-forest/55">
                          Subscription price
                        </p>
                        <p className="mt-2 text-lg font-bold">
                          ₹299
                          <span className="ml-1 text-sm font-normal text-forest/55">
                            / month
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-forest/55">
                          Monthly billing
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-forest/60">
                      You're currently on the Free plan. Upgrade to unlock
                      detailed AI feedback, more daily topics, advanced
                      analytics, and pronunciation analysis.
                    </p>
                  )}

                  {subscription?.isPro && subscription.cancelAtCycleEnd && (
                    <p className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm leading-6">
                      Your subscription is scheduled to end on{" "}
                      {periodEnd || "the end of the current billing period"}.
                      Your Pro access should remain available until then.
                    </p>
                  )}

                  <Link
                    to="/upgrade"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-3 text-sm font-semibold text-cream transition hover:bg-olive"
                  >
                    {subscription?.isPro ? "View Pro plan" : "Explore Pro"}
                    <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
