import {
  BarChart3,
  Flame,
  History,
  Home,
  Settings,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

import Logo from "./Logo";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Challenges",
    icon: Sparkles,
    path: "/challenge",
  },
  {
    label: "History",
    icon: History,
    path: "/history",
  },
  {
    label: "Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
  },
  {
    label: "Progress",
    icon: BarChart3,
    path: "/progress",
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

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
          flex w-[300px] flex-col
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
                    rounded-lg px-5
                    font-sans text-md
                    transition-all duration-200

                    ${
                      active
                        ? `
                          bg-forest
                          font-semibold
                          text-cream
                          shadow-sm
                          before:absolute
                          before:-left-1
                          before:top-0
                          before:h-full
                          before:w-2
                          before:rounded-l-full
                          before:bg-amber
                        `
                        : `
                          text-forest/70
                          hover:bg-forest/5
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
          <div className="mt-7 border-t border-forest/10 pt-5">
            <Link
              to="/settings"
              onClick={onClose}
              className={`
                flex h-[55px] items-center gap-4 rounded-xl px-4
                font-sans text-[16px]
                transition-all
                ${
                  location.pathname.startsWith("/settings")
                    ? "bg-olive font-semibold text-cream"
                    : "text-forest/70 hover:bg-forest/5 hover:text-forest"
                }
              `}
            >
              <Settings
                size={21}
                strokeWidth={1.8}
              />

              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-5 pb-5">

          {/* Streak */}
          <div className="rounded-xl border border-forest/20 px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full">
                <Flame
                  size={22}
                  strokeWidth={1.8}
                  className="text-rust"
                />
              </div>

              <div>
                <p className="font-sans text-sm font-bold text-forest">
                  7 day streak
                </p>

                <p className="mt-0.5 font-sans text-xs text-forest/50">
                  Keep it going
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-forest/10" />

          {/* User */}
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
                Suman Preet Singh
              </p>

              <p className="mt-0.5 truncate font-sans text-xs text-forest/50">
                @suman
              </p>
            </div>

            {/* More */}
            <button
              type="button"
              className="flex items-center gap-1 text-forest/40"
              aria-label="More options"
            >
              <span className="size-1.5 rounded-full bg-current" />
              <span className="size-1.5 rounded-full bg-current" />
              <span className="size-1.5 rounded-full bg-current" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}