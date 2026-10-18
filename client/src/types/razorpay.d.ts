
export {};

declare global {
  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }

  interface RazorpayErrorResponse {
    error?: {
      description?: string;
      code?: string;
      reason?: string;
    };
  }

  interface RazorpayOptions {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    image?: string;
    prefill?: {
      name?: string;
      email?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
    handler: (response: RazorpaySuccessResponse) => void;
  }

  interface RazorpayInstance {
    open: () => void;
    on: (
      event: "payment.failed",
      callback: (response: RazorpayErrorResponse) => void
    ) => void;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
  }

  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
