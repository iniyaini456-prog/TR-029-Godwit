import { Outlet, Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-700">
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
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
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
  );
}
