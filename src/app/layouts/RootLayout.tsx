import { Outlet, Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { DataProvider } from "../utils/DataContext";

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Network View", path: "/network" },
    { label: "Disruptions", path: "/disruptions" },
    { label: "Impact Analysis", path: "/impact" },
    { label: "Strategies", path: "/strategies" },
    { label: "War Game", path: "/wargame" },
    { label: "ERP Integration", path: "/erp" },
  ];

  return (
    <DataProvider>
      <div className="flex h-screen bg-[var(--bg)] text-[var(--ink)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-[var(--card-bg)] text-[var(--ink)] transition-all duration-300 flex flex-col`}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h1 className={`font-bold ${sidebarOpen ? "text-xl" : "text-xs text-center"}`}>
              {sidebarOpen ? "Supply Chain AI" : "SC"}
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  location.pathname === item.path
                    ? "bg-[var(--accent)] text-[var(--ink)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--surface)]"
                }`}
              >
                <span className={`${sidebarOpen ? "" : "text-lg"}`}>•</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-[var(--card-bg)] shadow-sm border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[var(--surface)] rounded-md"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              AI Supply Chain Simulation Platform
            </h2>
            <div className="w-10" />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
