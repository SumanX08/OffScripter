
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Flame,
  History,
  Home,
  Settings,
  Sparkles,
  Trophy,
  X,
  Crown,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { UserButton, useClerk, useUser } from "@clerk/clerk-react";
import { useStreak } from "../../hooks/useStreak";

import Logo from "./Logo";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navigation = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Challenges", icon: Sparkles, path: "/challenge" },
  { label: "History", icon: History, path: "/history" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { label: "Progress", icon: BarChart3, path: "/progress" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const { streak, loading: streakLoading } = useStreak();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    onClose();
    await signOut({ redirectUrl: "/" });
  };

  const displayName =
    user?.fullName || user?.firstName || "Your account";

  const username = user?.username
    ? `@${user.username}`
    : user?.primaryEmailAddress?.emailAddress || "";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-forest/20 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[300px] flex-col
          border-r border-forest/10
          bg-cream
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[86px] items-center justify-between px-6">
          <Logo />

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg text-forest/60 hover:bg-forest/5 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 pt-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname === item.path ||
                (item.path !== "/dashboard" &&
                  location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group relative flex h-10 items-center gap-4
                    rounded-lg px-5 font-sans text-md
                    transition-all duration-200
                    ${
                      active
                        ? `
                          bg-forest font-semibold text-cream shadow-sm
                          before:absolute before:-left-1 before:top-0
                          before:h-full before:w-2 before:rounded-l-full
                          before:bg-amber
                        `
                        : `
                          text-forest/70 hover:bg-forest/5
                          hover:text-forest
                        `
                    }
                  `}
                >
                  <Icon
                    size={21}
                    strokeWidth={active ? 2 : 1.8}
                    className={
                      active
                        ? "text-cream"
                        : "text-forest/55 group-hover:text-forest"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Settings */}
         
        </nav>

        {/* Bottom section */}
        <div className="px-5 pb-5">
          {/* Streak */}
          
{/* Streak */}
<Link
  to="/progress"
  onClick={onClose}
  className="block rounded-xl border border-forest/20 px-4 py-4 transition-colors hover:bg-forest/5"
  aria-label={`Current practice streak: ${
    streak?.currentStreak ?? 0
  } days. View progress.`}
>
  <div className="flex items-center gap-4">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full">
      <Flame
        size={22}
        strokeWidth={1.8}
        className="text-rust"
      />
    </div>

    <div className="min-w-0">
      <p className="font-sans text-sm font-bold text-forest">
        {streakLoading
          ? "Loading streak..."
          : `${streak?.currentStreak ?? 0} day${
              streak?.currentStreak === 1 ? "" : "s"
            } streak`}
      </p>

      <p className="mt-0.5 font-sans text-xs text-forest/50">
        {streakLoading
          ? "Checking your progress"
          : streak?.practicedToday
            ? "You've practised today!"
            : "Complete a challenge to keep it going"}
      </p>
    </div>
  </div>
</Link>


          <div className="my-4 border-t border-forest/10" />

          {/* User profile and dropdown */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-11",
                  },
                }}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-bold text-forest">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate font-sans text-xs text-forest/50">
                  {username}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`
                  flex size-9 shrink-0 items-center justify-center gap-1
                  rounded-lg text-forest/40 transition-colors
                  hover:bg-forest/5 hover:text-forest
                  ${menuOpen ? "bg-forest/5 text-forest" : ""}
                `}
              >
                <span className="size-1.5 rounded-full bg-current" />
                <span className="size-1.5 rounded-full bg-current" />
                <span className="size-1.5 rounded-full bg-current" />
              </button>
            </div>

            {/* Dropdown */}
            {menuOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="
                  absolute bottom-full right-0 z-[60] mb-3
                  w-full min-w-[240px] overflow-hidden
                  rounded-xl border border-forest/10
                  bg-cream p-2 shadow-xl
                  animate-in fade-in slide-in-from-bottom-2 duration-150
                "
              >
                <div className="px-3 py-2">
                  <p className="truncate font-sans text-sm font-semibold text-forest">
                    {displayName}
                  </p>
                  <p className="truncate font-sans text-xs text-forest/50">
                    {user?.primaryEmailAddress?.emailAddress || username}
                  </p>
                </div>

                <div className="my-1 border-t border-forest/10" />

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onClose();
                  }}
                  className="
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    font-sans text-sm text-forest/80
                    transition-colors hover:bg-forest/5 hover:text-forest
                  "
                >
                  <Settings size={18} strokeWidth={1.8} />
                  <span className="flex-1">Settings</span>
                  <ChevronRight size={15} className="text-forest/30" />
                </Link>

                <Link
                  to="/upgrade"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onClose();
                  }}
                  className="
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    font-sans text-sm font-medium text-rust
                    transition-colors hover:bg-amber/15
                  "
                >
                  <Crown size={18} strokeWidth={1.8} />
                  <span className="flex-1">Upgrade Plan</span>
                  <ChevronRight size={15} className="opacity-50" />
                </Link>

                <div className="my-1 border-t border-forest/10" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="
                    flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                    font-sans text-sm text-red-700
                    transition-colors hover:bg-red-50
                  "
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
