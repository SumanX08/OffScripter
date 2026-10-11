
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Crown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type SubscriptionStatus = {
  isPro: boolean;
  status?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtCycleEnd?: boolean;
};

const features = [
  "Detailed AI feedback",
  "More daily topics",
  "Advanced speaking analytics",
  "Pronunciation analysis",
];

export default function Upgrade() {
  const api = useAuthenticatedApi();

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [statusError, setStatusError] = useState(false);

  const refreshStatus = useCallback(async () => {
    setCheckingStatus(true);
    setStatusError(false);

    try {
      const response = await api.get("/payments/status");
      setSubscription(response.data.data);
    } catch {
      setStatusError(true);
    } finally {
      setCheckingStatus(false);
    }
  }, [api]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleSubscribe() {
    if (!window.Razorpay) {
      setMessage("Checkout could not load. Refresh and try again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/payments/subscribe");
      const { subscriptionId, keyId } = response.data.data;

      const checkout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "OffScripter",
        description: "OffScripter Pro — monthly subscription",
        theme: { color: "#283618" },

        handler: async (checkoutResponse) => {
          try {
            await api.post("/payments/verify", {
              subscriptionId:
                checkoutResponse.razorpay_subscription_id,
              paymentId: checkoutResponse.razorpay_payment_id,
              signature: checkoutResponse.razorpay_signature,
            });

            await refreshStatus();

            // A checkout callback alone does not prove Pro access.
            // The backend status endpoint is the source of truth.
            const statusResponse = await api.get("/payments/status");
            const currentStatus = statusResponse.data.data as SubscriptionStatus;

            setSubscription(currentStatus);

            if (currentStatus.isPro) {
              window.location.assign("/dashboard");
            } else {
              setMessage(
                "Checkout was submitted. Your subscription is not active yet. Please wait a moment and check your status before trying again."
              );
            }
          } catch {
            setMessage(
              "We couldn't confirm your subscription yet. Please refresh your status before trying again."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.open();
    } catch (error) {
      console.error("Unable to start subscription:", error);
      setMessage("Unable to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-cream px-4 py-8 text-forest sm:px-7 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-forest/60 transition hover:text-forest"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <header className="mb-9 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-mist">
            <Sparkles size={26} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-olive">
            Invest in your communication
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            Find your voice.
            <br />
            <span className="text-olive">Own the conversation.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-forest/60 sm:text-base">
            Go beyond basic practice with detailed insights into how you
            research, think, and explain technical concepts.
          </p>
        </header>

        {checkingStatus ? (
          <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-forest/10 bg-[#FFFDF5] p-10 text-sm text-forest/60">
            <LoaderCircle size={20} className="animate-spin" />
            Checking your subscription...
          </div>
        ) : statusError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-rust/20 bg-[#FFFDF5] p-7 text-center">
            <p className="font-semibold">Couldn't verify your plan</p>
            <p className="mt-2 text-sm leading-6 text-forest/60">
              For your protection, checkout is disabled until your current
              subscription status can be confirmed.
            </p>
            <button
              type="button"
              onClick={() => void refreshStatus()}
              className="mt-5 rounded-lg bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-olive"
            >
              Check again
            </button>
          </div>
        ) : subscription?.isPro ? (
          /* Already subscribed */
          <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-forest/15 bg-[#FFFDF5] shadow-sm">
            <div className="bg-forest px-6 py-8 text-cream sm:px-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-xl bg-amber text-forest">
                    <Crown size={25} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">
                      You're on Pro!
                    </h2>
                    <p className="mt-1 text-sm text-cream/65">
                      Your next level starts here.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-forest">
                  <CheckCircle2 size={15} />
                  Active
                </span>
              </div>

              <div className="mt-7">
                <span className="font-serif text-4xl font-bold">₹299</span>
                <span className="ml-2 text-sm text-cream/60">/ month</span>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              <h3 className="font-semibold">Your Pro benefits</h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mist">
                      <Check size={15} />
                    </div>
                    <span className="text-sm leading-6 text-forest/80">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {periodEnd && (
                <div className="mt-7 rounded-xl border border-forest/10 bg-cream p-4">
                  <p className="text-xs text-forest/55">
                    {subscription.cancelAtCycleEnd
                      ? "Pro access ends on"
                      : "Current billing period ends"}
                  </p>
                  <p className="mt-1 font-semibold">{periodEnd}</p>
                  {subscription.cancelAtCycleEnd && (
                    <p className="mt-2 text-sm leading-5 text-forest/65">
                      Your subscription is set to end at the end of this
                      billing period. You can continue using Pro until then.
                    </p>
                  )}
                </div>
              )}

              <Link
                to="/dashboard"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-5 py-4 text-sm font-bold text-cream transition hover:bg-olive"
              >
                Go to dashboard
                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-forest/45">
                <ShieldCheck size={14} />
                Your subscription status is verified by OffScripter.
              </p>
            </div>
          </section>
        ) : (
          /* Free user */
          <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-forest/15 bg-[#FFFDF5] shadow-sm">
            <div className="bg-forest px-6 py-8 text-cream sm:px-9">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-amber text-forest">
                  <Crown size={25} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    OffScripter Pro
                  </h2>
                  <p className="mt-1 text-sm text-cream/65">
                    For serious speaking improvement
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <span className="font-serif text-5xl font-bold">₹299</span>
                <span className="ml-2 text-sm text-cream/60">/ month</span>
              </div>
              <p className="mt-3 text-sm text-cream/65">
                One subscription. More ways to improve.
              </p>
            </div>

            <div className="p-6 sm:p-9">
              <p className="text-sm leading-6 text-forest/60">
                Everything you need to build deeper technical understanding
                and communicate your ideas with confidence.
              </p>

              <div className="mt-6 space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="grid size-6 shrink-0 place-items-center rounded-full bg-mist">
                      <Check size={15} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-5 py-4 font-bold text-cream transition hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade to Pro
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {message && (
                <div
                  role="status"
                  className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm leading-6 text-forest/80"
                >
                  {message}
                  <button
                    type="button"
                    onClick={() => void refreshStatus()}
                    className="ml-1 font-bold underline underline-offset-2"
                  >
                    Check status
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-forest/45">
                Recurring monthly subscription. Payment and subscription
                activation are confirmed by the backend.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
