import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Flame,
  Menu,
  Star,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import Button from "../components/ui/Button";
import { useAuthenticatedApi } from "../hooks/useAuthApi";
type UserProfile = {
  username: string;
};





export default function Dashboard() {
  const { user } = useUser();
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [spinning] = useState(false);
  const [error] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/users/me");

        setProfile(response.data.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [api]);

  const handleSpin = async () => {
    

      navigate(`/challenge`);
    
  };

  const displayName =
    profile?.username ||
    user?.firstName ||
    user?.username ||
    "there";

  return (
    <div className="flex min-h-screen bg-[#FCF9EC] text-forest">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="flex items-center border-b border-forest/10 px-5 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="grid size-10 place-items-center rounded-lg border border-forest/10"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="ml-4">
            <span className="font-serif text-xl font-bold">
              OffScripter
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-295 px-5 py-10 md:px-8 lg:px-12 lg:py-14">
          {/* Header */}
          <header className="mb-6">

            <h1 className="font-serif text-4xl tracking-tight text-forest ">
              Good evening, {displayName}.
            </h1>
          </header>

          {/* Stats */}
          <section
            aria-label="Your statistics"
            className="mb-8 grid gap-4 md:grid-cols-3"
          >
            <StatCard
              icon={<Star size={19} />}
              value="0"
              label="Total Points"
            />

            <StatCard
              icon={<Flame size={19} />}
              value="0"
              label="Day Streak"
            />

            <StatCard
              icon={<CheckCircle2 size={19} />}
              value="0"
              label="Challenges Done"
            />
          </section>

          {/* Challenge */}
          <section className="mb-8 overflow-hidden rounded-2xl bg-forest">
            <div className="p-7  flex justify-between">
              <div>
                 <p className="mb-5 text-xs font- uppercase tracking-[0.18em] text-cream">
                Today's challenge
              </p>

              <h2 className="max-w-3xl font-serif text-3xl font-bold leading-[1.08] text-cream md:text-4xl ">
                Spin for a topic
              </h2>
              </div>
             

             

              <div className="mt-8">
                <Button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="bg-rust text-white hover:bg-rust/90"
                >
                  {spinning ? "Finding a topic..." : "Spin for a Topic"}

                  {!spinning && <ArrowRight size={17} />}
                </Button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-300">
                  {error}
                </p>
              )}
            </div>
          </section>

          {/* Bottom cards */}
          <section className="grid gap-5 lg:grid-cols-2">
            <ProgressCard />

            <RecentChallenges />
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  change,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  change?: string;
}) {
  return (
    <div className="border border-forest/10 bg-cream p-6">
      <div className="flex items-center gap-5">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/50 text-forest">
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold text-forest/60">
            {label}
          </p>

          <div className="mt-1 flex items-baseline gap-3">
            <p className="font-serif text-4xl font-bold leading-none text-forest">
              {value}
            </p>

            {change && (
              <span className="font-sans text-xs font-semibold text-olive">
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCard() {
  return (
    <div className="rounded-2xl border border-forest/10 bg-[#FFFDF4] p-7">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">
          Your progress
        </h2>

        <button className="text-sm font-semibold text-rust">
          Details →
        </button>
      </div>

      <div className="flex items-center gap-5">
        <div className="grid size-16 place-items-center rounded-full bg-[#E4EBCD]">
          <BarChart3 size={25} />
        </div>

        <div>
          <p className="text-2xl font-bold">0%</p>
          <p className="text-sm text-forest/50">
            Complete your first challenge
          </p>
        </div>
      </div>
    </div>
  );
}

function RecentChallenges() {
  return (
    <div className="rounded-2xl border border-forest/10 bg-[#FFFDF4] p-7">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">
          Recent
        </h2>

        <button className="text-sm font-semibold text-rust">
          All →
        </button>
      </div>

      <div className="flex min-h-30 items-center justify-center">
        <p className="text-sm text-forest/40">
          No challenges yet. Start your first one.
        </p>
      </div>
    </div>
  );
}