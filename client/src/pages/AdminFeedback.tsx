
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  Lightbulb,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type FeedbackType = "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL";
type FeedbackStatus = "OPEN" | "REVIEWING" | "RESOLVED";

type Feedback = {
  id: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  pageUrl: string | null;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};

const statusStyles: Record<FeedbackStatus, string> = {
  OPEN: "bg-[#faedcd] text-[#bc6c25]",
  REVIEWING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-[#e9edc9] text-[#606c38]",
};

const typeLabels: Record<FeedbackType, string> = {
  BUG_REPORT: "Bug report",
  FEATURE_REQUEST: "Feature request",
  GENERAL: "General",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function FeedbackTypeIcon({ type }: { type: FeedbackType }) {
  if (type === "BUG_REPORT") return <Bug size={17} />;
  if (type === "FEATURE_REQUEST") return <Lightbulb size={17} />;
  return <MessageCircle size={17} />;
}

export default function AdminFeedback() {
  const api = useAuthenticatedApi();

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchFeedback = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await api.get("/feedback/admin");

      setFeedback(response.data.data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch feedback:", err);

      if (err.response?.status === 403) {
        setError("You don't have permission to access this page.");
      } else {
        setError(
          err.response?.data?.error?.message ||
          "Unable to load feedback. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const counts = useMemo(() => ({
    total: feedback.length,
    open: feedback.filter((item) => item.status === "OPEN").length,
    reviewing: feedback.filter((item) => item.status === "REVIEWING").length,
    resolved: feedback.filter((item) => item.status === "RESOLVED").length,
  }), [feedback]);

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const matchesStatus =
        filterStatus === "ALL" || item.status === filterStatus;

      const matchesType =
        filterType === "ALL" || item.type === filterType;

      return matchesStatus && matchesType;
    });
  }, [feedback, filterStatus, filterType]);

  const selectedFeedback = feedback.find(
    (item) => item.id === selectedId
  );

  const handleSelect = (item: Feedback) => {
    setSelectedId(item.id);
    setAdminResponse(item.adminResponse ?? "");
    setSuccess("");
  };

  const handleUpdate = async (status: FeedbackStatus) => {
    if (!selectedFeedback) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/feedback/admin/${selectedFeedback.id}`,
        {
          status,
          adminResponse: adminResponse.trim(),
        }
      );

      const updated = response.data.data as Feedback;

      setFeedback((previous) =>
        previous.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSuccess("Feedback updated successfully.");
    } catch (err: any) {
      console.error("Failed to update feedback:", err);
      setError(
        err.response?.data?.error?.message ||
        "Unable to update feedback."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-3 text-[#606c38]">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm font-medium">
            Loading feedback...
          </span>
        </div>
      </div>
    );
  }

  if (error && feedback.length === 0) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-6">
        <div className="text-center">
          <ShieldAlert className="mx-auto text-[#bc6c25]" size={42} />
          <h1 className="mt-5 font-serif text-3xl text-[#283618]">
            Access unavailable
          </h1>
          <p className="mt-3 text-sm text-[#606c38]">{error}</p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#283618] px-5 py-3 text-sm font-semibold text-[#F8F1DC]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#FCF9EC] px-5 py-8 text-[#283618] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#bc6c25]">
              <Inbox size={15} />
              Admin workspace
            </div>

            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
              Feedback inbox
            </h1>

            <p className="mt-2 text-sm text-[#606c38]">
              Listen to your users. Make OffScripter better.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchFeedback(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#283618]/15 px-4 py-3 text-sm font-semibold transition hover:bg-[#283618]/5 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total feedback", value: counts.total, icon: Inbox },
            { label: "Open", value: counts.open, icon: Clock3 },
            { label: "Reviewing", value: counts.reviewing, icon: Filter },
            { label: "Resolved", value: counts.resolved, icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#283618]/10 bg-white/50 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#606c38]">
                    {stat.label}
                  </p>
                  <Icon size={18} className="text-[#bc6c25]" />
                </div>

                <p className="mt-3 font-serif text-3xl">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Filter size={16} />
            Filters
          </span>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-[#283618]/15 bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#bc6c25]"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-[#283618]/15 bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#bc6c25]"
          >
            <option value="ALL">All types</option>
            <option value="BUG_REPORT">Bug reports</option>
            <option value="FEATURE_REQUEST">Feature requests</option>
            <option value="GENERAL">General</option>
          </select>

          <span className="ml-auto text-xs text-[#606c38]/70">
            {filteredFeedback.length} result(s)
          </span>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Feedback list */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#283618]/20 px-5 py-16 text-center">
                <Inbox className="mx-auto text-[#606c38]/50" size={34} />
                <p className="mt-4 font-serif text-xl">
                  Nothing here yet
                </p>
                <p className="mt-2 text-sm text-[#606c38]">
                  No feedback matches your filters.
                </p>
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    selectedId === item.id
                      ? "border-[#bc6c25] bg-[#faedcd]/50 shadow-sm"
                      : "border-[#283618]/10 bg-white/50 hover:border-[#bc6c25]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FeedbackTypeIcon type={item.type} />
                      <span className="text-xs font-bold uppercase tracking-wide text-[#606c38]">
                        {typeLabels[item.type]}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6">
                    {item.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#606c38]/70">
                    <span>{item.user?.username || item.user?.email}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="h-fit rounded-2xl border border-[#283618]/10 bg-white/50 p-5 sm:p-6 lg:sticky lg:top-6">
            {!selectedFeedback ? (
              <div className="py-12 text-center">
                <MessageCircle
                  className="mx-auto text-[#606c38]/40"
                  size={36}
                />
                <h2 className="mt-4 font-serif text-xl">
                  Select a submission
                </h2>
                <p className="mt-2 text-sm text-[#606c38]">
                  Choose feedback from the inbox to view its details.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#bc6c25]">
                    Submission details
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(null);
                      setSuccess("");
                    }}
                    className="text-xs text-[#606c38] hover:text-[#283618]"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
                  <FeedbackTypeIcon type={selectedFeedback.type} />
                  {typeLabels[selectedFeedback.type]}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
                  {selectedFeedback.message}
                </p>

                <div className="my-5 border-t border-[#283618]/10" />

                <p className="text-xs font-bold uppercase tracking-wider text-[#606c38]">
                  Submitted by
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {selectedFeedback.user?.username || "User"}
                </p>
                <p className="mt-1 break-all text-xs text-[#606c38]">
                  {selectedFeedback.user?.email}
                </p>

                <p className="mt-4 text-xs text-[#606c38]">
                  {formatDate(selectedFeedback.createdAt)}
                </p>

                {selectedFeedback.pageUrl && (
                  <a
                    href={selectedFeedback.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 break-all text-xs font-semibold text-[#bc6c25] hover:underline"
                  >
                    View reported page
                    <ExternalLink size={13} />
                  </a>
                )}

                <div className="my-5 border-t border-[#283618]/10" />

                <label
                  htmlFor="admin-response"
                  className="text-sm font-semibold"
                >
                  Admin response (optional)
                </label>

                <textarea
                  id="admin-response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                  maxLength={3000}
                  placeholder="Add an internal note or response..."
                  className="mt-2 w-full resize-y rounded-xl border border-[#283618]/15 bg-[#FCF9EC] p-3 text-sm outline-none focus:border-[#bc6c25]"
                />

                <p className="mt-1 text-right text-[10px] text-[#606c38]/60">
                  {adminResponse.length}/3000
                </p>

                {selectedFeedback.adminResponse && (
                  <p className="mt-2 text-xs text-[#606c38]">
                    Previously saved response is loaded above.
                  </p>
                )}

                {success && (
                  <p role="status" className="mt-3 text-xs font-semibold text-[#606c38]">
                    {success}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={saving || selectedFeedback.status === "REVIEWING"}
                    onClick={() => void handleUpdate("REVIEWING")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#283618]/15 px-4 py-3 text-sm font-semibold transition hover:bg-[#283618]/5 disabled:opacity-40"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Mark as reviewing
                  </button>

                  <button
                    type="button"
                    disabled={saving || selectedFeedback.status === "RESOLVED"}
                    onClick={() => void handleUpdate("RESOLVED")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#283618] px-4 py-3 text-sm font-semibold text-[#F8F1DC] transition hover:bg-[#3b4d25] disabled:opacity-40"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Mark as resolved
                  </button>

                  <button
                    type="button"
                    disabled={saving || selectedFeedback.status === "OPEN"}
                    onClick={() => void handleUpdate("OPEN")}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[#bc6c25] hover:bg-[#faedcd]/60 disabled:opacity-40"
                  >
                    Reopen feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
