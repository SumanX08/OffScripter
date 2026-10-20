
import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "../ui/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
  <div className="flex h-screen overflow-hidden bg-[#FCF9EC] text-[#263911]">
  <Sidebar
    open={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
  />

  <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
    {/* Mobile Header */}
    <div className="flex shrink-0 items-center justify-between border-b border-[#263911]/10 px-5 py-4 lg:hidden">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="rounded-lg p-2 text-[#263911] transition hover:bg-[#263911]/5"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <span className="font-serif text-lg font-bold">
        OffScripter
      </span>

      <div className="w-9" />
    </div>

    {/* Scrollable page content */}
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Outlet />
    </div>
  </main>
</div>
  );
}
