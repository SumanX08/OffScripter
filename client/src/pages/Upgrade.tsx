
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BarChart3,
  Check,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuthenticatedApi } from "../hooks/useAuthApi";
import { useSubscription } from "../hooks/useSubscription";

interface SubscribeResponse {
  success: boolean;
  data: {
    subscriptionId: string;
    keyId: string;
  };
}

interface VerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
    status: string;
  };
}

const features = [
  {
    icon: Sparkles,
    title: "Detailed AI feedback",
    description:
      "Understand your strengths, mistakes, missing concepts, and how to improve.",
  },
  {
    icon: Target,
    title: "More daily topics",
    description:
      "Practice more technical topics and build a consistent speaking habit.",
  },
  {
    icon: BarChart3,
    title: "Advanced speaking analytics",
    description:
      "Track your progress and identify areas that need more practice.",
  },
  {
    icon: AudioLines,
    title: "Pronunciation analysis",
    description:
      "Get additional insights into how clearly you communicate.",
  },
];

export default function Upgrade() {
  const api = useAuthenticatedApi();
  const navigate = useNavigate();
  const { user } = useUser();
  const { subscription, loading, refresh } = useSubscription();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPro = subscription?.isPro === true;

  async function handleUpgrade() {
    if (checkoutLoading) return;

    setMessage(null);
    setSuccessMessage(null);
    setCheckoutLoading(true);

    try {
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Refresh the page and try again."
        );
      }

      // Ask the authenticated backend to create or reuse a subscription.
      const subscribeResponse =
        await api.post<SubscribeResponse>("/payments/subscribe");

      const { subscriptionId, keyId } = subscribeResponse.data.data;

      if (!subscriptionId || !keyId) {
        throw new Error("The server returned invalid subscription details.");
      }

      const checkout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "OffScripter",
        description: "OffScripter Pro — Monthly Subscription",
        prefill: {
          name: user?.fullName ?? user?.username ?? "",
          email: user?.primaryEmailAddress?.emailAddress ?? "",
        },
        notes: {
          product: "OffScripter Pro",
        },
        theme: {
          color: "#283618",
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          },
        },
        handler: async (paymentResponse) => {
          try {
            setMessage(null);

            // The backend verifies the Razorpay signature.
            await api.post<VerifyResponse>("/payments/verify", {
              subscriptionId:
                paymentResponse.razorpay_subscription_id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });

            // The webhook/provider status remains authoritative for Pro access.
            await refresh();

            setSuccessMessage(
              "Payment response verified. Your Pro status is being refreshed."
            );
          } catch {
            setMessage(
              "Checkout completed, but verification could not be confirmed. Please check your subscription status before trying again."
            );
          } finally {
            setCheckoutLoading(false);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setMessage(
          response.error?.description ??
            "Payment failed. Please try again."
        );
        setCheckoutLoading(false);
      });

      checkout.open();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    error?: { message?: string };
                  };
                };
              }
            ).response?.data?.error?.message
          : error instanceof Error
            ? error.message
            : null;

      setMessage(errorMessage ?? "Unable to start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-forest sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-olive transition hover:text-forest"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage bg-soft px-4 py-2 text-sm font-bold text-forest">
            <Sparkles size={16} />
            OffScripter Pro
          </div>

          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Turn practice into
            <span className="block text-rust">real progress.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-olive sm:text-lg">
            Go beyond speaking practice with detailed feedback and deeper
            insights into your technical communication.
          </p>
        </header>

        {message && (
          <div
            role="alert"
            className="mx-auto mb-5 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {message}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mx-auto mb-5 max-w-3xl rounded-xl border border-sage bg-mist p-4 text-sm text-forest"
          >
            {successMessage}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-sage bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-olive">
              Everything you need to improve
            </p>

            <div className="mt-7 space-y-7">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-forest">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold">{feature.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-olive">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-soft p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-olive" size={20} />
              <div>
                <p className="text-sm font-bold">Secure checkout</p>
                <p className="mt-1 text-sm leading-6 text-olive">
                  Payments are processed through Razorpay. Your subscription
                  status is checked by OffScripter's backend.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col rounded-3xl border-2 border-forest bg-[#f5f0df] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Pro Plan</h2>
              <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-cream">
                MONTHLY
              </span>
            </div>

            <div className="mt-7 flex items-baseline gap-2">
              <span className="font-serif text-5xl">₹299</span>
              <span className="text-sm text-olive">/ month</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-olive">
              For developers who want to explain technical concepts with
              confidence.
            </p>

            <div className="my-7 h-px bg-sage" />

            <ul className="flex-1 space-y-4">
              {[
                "Detailed AI feedback",
                "More daily topics",
                "Advanced speaking analytics",
                "Pronunciation analysis",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mist">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {loading ? (
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage px-5 py-3.5 font-bold text-forest"
                >
                  <LoaderCircle className="animate-spin" size={18} />
                  Checking plan...
                </button>
              ) : isPro ? (
                <div>
                  <div className="mb-3 rounded-xl bg-mist p-3 text-center text-sm font-bold text-forest">
                    <Check className="mr-2 inline" size={17} />
                    You're on Pro
                  </div>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 font-bold text-cream transition hover:bg-olive"
                  >
                    Go to dashboard
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 font-bold text-cream transition hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-olive">
                Monthly subscription. Review the recurring payment terms
                during checkout.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-olive">
          Questions about your plan?{" "}
          <Link
            to="/settings"
            className="font-bold underline underline-offset-4"
          >
            View account settings
          </Link>
        </p>
      </div>
    </main>
  );
}
