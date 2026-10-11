
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  LoaderCircle,
  Mail,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type SubscriptionStatus = {
  isPro: boolean;
  status?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtCycleEnd?: boolean;
};

export default function Settings() {
  const { user, isLoaded } = useUser();
  const api = useAuthenticatedApi();

  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      try {
        const response = await api.get("/payments/status");

        if (!cancelled) {
          setSubscription(response.data.data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load subscription details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [api]);

  const name = user?.fullName || user?.firstName || "Your account";
  const email = user?.primaryEmailAddress?.emailAddress || "No email available";
  const username = user?.username ? `@${user.username}` : "OffScripter member";

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <main className="min-h-full bg-cream px-4 py-8 text-forest sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-olive">
            Your workspace
          </p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-forest/60 sm:text-base">
            Manage your account and subscription in one place.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <section className="rounded-2xl border border-forest/10 bg-[#FFFDF5] p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-mist">
                <UserRound size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Account information</h2>
                <p className="mt-1 text-sm text-forest/55">
                  Your personal account details
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {isLoaded && (
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                  className="size-16 rounded-full border-2 border-amber/50 object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">
                  {isLoaded ? name : "Loading profile..."}
                </p>
                <p className="mt-1 text-sm text-forest/55">{username}</p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full bg-mist px-3 py-2 text-xs font-semibold text-forest sm:self-center">
                <ShieldCheck size={15} />
                Clerk account
              </div>
            </div>

            <div className="mt-6 border-t border-forest/10 pt-5">
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-olive" />
                <div className="min-w-0">
                  <p className="text-xs text-forest/50">Email address</p>
                  <p className="mt-1 break-all text-sm font-medium">
                    {isLoaded ? email : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section className="overflow-hidden rounded-2xl border border-forest/10 bg-[#FFFDF5] shadow-sm">
            <div className="flex items-center gap-3 p-5 sm:p-7">
              <div className="grid size-11 place-items-center rounded-xl bg-soft">
                <SettingsIcon size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Subscription</h2>
                <p className="mt-1 text-sm text-forest/55">
                  Manage your OffScripter plan
                </p>
              </div>
            </div>

            <div className="mx-5 mb-5 rounded-xl border border-forest/10 bg-cream p-5 sm:mx-7 sm:mb-7 sm:p-6">
              {loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-forest/60">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading subscription...
                </div>
              ) : error ? (
                <div>
                  <p className="text-sm text-rust">{error}</p>
                  <p className="mt-2 text-xs text-forest/55">
                    Your subscription status could not be confirmed.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-xl bg-forest text-amber">
                        <Crown size={23} />
                      </div>
                      <div>
                        <p className="font-bold">
                          OffScripter {subscription?.isPro ? "Pro" : "Free"}
                        </p>
                        <p className="mt-1 text-sm text-forest/55">
                          {subscription?.isPro
                            ? "Premium features unlocked"
                            : "Your speaking practice plan"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        subscription?.isPro
                          ? "bg-mist text-forest"
                          : "bg-forest/5 text-forest/65"
                      }`}
                    >
                      {subscription?.isPro ? "● Active" : "Free plan"}
                    </span>
                  </div>

                  <div className="my-5 border-t border-forest/10" />

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="font-serif text-3xl font-bold">
                        {subscription?.isPro ? "₹299" : "₹0"}
                        <span className="ml-1 font-sans text-sm font-normal text-forest/50">
                          / month
                        </span>
                      </p>

                      {subscription?.isPro && periodEnd && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-forest/60">
                          <CalendarDays size={15} />
                          {subscription.cancelAtCycleEnd
                            ? `Access ends on ${periodEnd}`
                            : `Current period ends ${periodEnd}`}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/upgrade"
                      className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-3 text-sm font-semibold text-cream transition hover:bg-olive"
                    >
                      {subscription?.isPro
                        ? "View plan"
                        : "Explore Pro"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {subscription?.isPro && subscription.cancelAtCycleEnd && (
                    <p className="mt-4 rounded-lg bg-amber/15 p-3 text-sm leading-5 text-forest">
                      Your subscription is scheduled to end at the end of the
                      current billing period.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Pro benefits */}
          <section className="rounded-2xl border border-forest/10 bg-[#FFFDF5] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-soft">
                <Zap size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Improve your speaking</h2>
                <p className="mt-1 text-sm text-forest/55">
                  Make every practice session count.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-forest/75">
              {[
                "Detailed AI feedback",
                "More daily topics",
                "Advanced speaking analytics",
                "Pronunciation analysis",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={17} className="shrink-0 text-olive" />
                  {feature}
                </li>
              ))}
            </ul>

            {!loading && !error && !subscription?.isPro && (
              <Link
                to="/upgrade"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-rust hover:text-forest"
              >
                Upgrade to Pro <ArrowRight size={16} />
              </Link>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
