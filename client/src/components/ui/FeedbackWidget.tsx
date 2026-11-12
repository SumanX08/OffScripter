
import { useState, type FormEvent } from "react";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuthenticatedApi } from "../../hooks/useAuthApi";

type FeedbackType = "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL";

const feedbackTypes = [
  {
    value: "BUG_REPORT" as const,
    label: "Bug report",
    description: "Something isn't working",
    icon: Bug,
  },
  {
    value: "FEATURE_REQUEST" as const,
    label: "Feature idea",
    description: "Suggest an improvement",
    icon: Lightbulb,
  },
  {
    value: "GENERAL" as const,
    label: "General",
    description: "Share your thoughts",
    icon: MessageCircle,
  },
];

export default function FeedbackWidget() {
  const api = useAuthenticatedApi();

  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("BUG_REPORT");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/feedback", {
        type,
        message: message.trim(),
        pageUrl: window.location.href,
      });

      setSubmitted(true);
      setMessage("");
    } catch (err: any) {
      console.error("Feedback submission failed:", err);

      setError(
        err.response?.data?.error?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;

    setIsOpen(false);
    setSubmitted(false);
    setError("");
  };

  return (
    <>
      {/* Floating feedback button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#283618] px-5 py-3 text-sm font-semibold text-[#F8F1DC] shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[#3b4d25]"
        aria-label="Send feedback"
      >
        <MessageSquare size={17} />
        <span>Feedback</span>
      </button>

      {/* Feedback modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b2412]/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-[#283618]/10 bg-[#FCF9EC] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="absolute right-5 top-5 rounded-full p-2 text-[#606c38] transition hover:bg-[#283618]/10 disabled:opacity-50"
              aria-label="Close feedback"
            >
              <X size={19} />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9edc9]">
                  <CheckCircle2 size={32} className="text-[#606c38]" />
                </div>

                <h2 className="font-serif text-3xl text-[#283618]">
                  Thank you!
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#606c38]">
                  Your feedback has been received. It helps us make
                  OffScripter better.
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-7 rounded-xl bg-[#283618] px-7 py-3 text-sm font-semibold text-[#F8F1DC] transition hover:bg-[#3b4d25]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bc6c25]">
                    Your voice matters
                  </span>

                  <h2 className="mt-2 font-serif text-3xl text-[#283618]">
                    Help us get better.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#606c38]">
                    Found a bug or have an idea? We'd love to hear it.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <label className="mb-3 block text-sm font-semibold text-[#283618]">
                    What would you like to share?
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {feedbackTypes.map((item) => {
                      const Icon = item.icon;
                      const selected = type === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setType(item.value)}
                          className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                            selected
                              ? "border-[#bc6c25] bg-[#faedcd] text-[#283618]"
                              : "border-[#283618]/15 bg-white/40 text-[#606c38] hover:border-[#bc6c25]/50"
                          }`}
                        >
                          <Icon size={20} />
                          <span className="mt-2 text-xs font-semibold">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="feedback-message"
                      className="mb-2 block text-sm font-semibold text-[#283618]"
                    >
                      Tell us more
                    </label>

                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setError("");
                      }}
                      placeholder="Describe your feedback..."
                      rows={5}
                      maxLength={3000}
                      required
                      className="w-full resize-none rounded-xl border border-[#283618]/15 bg-white/60 p-4 text-sm text-[#283618] outline-none transition placeholder:text-[#606c38]/50 focus:border-[#bc6c25] focus:ring-2 focus:ring-[#bc6c25]/10"
                    />

                    <div className="mt-2 flex justify-between text-xs text-[#606c38]/70">
                      <span>Minimum 10 characters</span>
                      <span>{message.length}/3000</span>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || message.trim().length < 10}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#bc6c25] px-5 py-4 text-sm font-bold text-white shadow-[3px_4px_0_#dda15e] transition hover:bg-[#a95d1e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send feedback
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
