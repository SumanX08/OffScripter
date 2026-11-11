import posthog from "posthog-js";

export const analytics = {
  signup: () => {
    posthog.capture("signup_completed");
  },

  topicSpin: (category: string) => {
    posthog.capture("topic_spun", { category });
  },

  sessionStarted: (topicId: string) => {
    posthog.capture("speaking_session_started", {
      topic_id: topicId,
    });
  },

  sessionCompleted: (duration: number) => {
    posthog.capture("speaking_session_completed", {
      duration_seconds: duration,
    });
  },

  feedbackSubmitted: () => {
    posthog.capture("feedback_submitted");
  },

  checkoutStarted: (plan: string) => {
    posthog.capture("checkout_started", { plan });
  },
};