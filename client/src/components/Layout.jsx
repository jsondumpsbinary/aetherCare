import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Users,
  CalendarClock,
  Bed,
  FileCheck2,
  Pill,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patients", label: "Patient Directory", icon: Users },
    { to: "/opd", label: "OPD Queue", icon: CalendarClock },
    { to: "/beds", label: "Bed Availability", icon: Bed },
    { to: "/admissions", label: "Admissions", icon: FileCheck2 },
    { to: "/inventory", label: "Medical Inventory", icon: Pill },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <aside className="w-64 flex flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900 tracking-tight">
              AetherCare
            </h1>
            <p className="text-xs font-medium text-slate-400">Hospital Operations</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.name || "Staff Member"}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-blue-600" />
                  <span className="capitalize">{user?.role?.toLowerCase() || "Staff"}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-slate-500">System Connected</span>
          </div>
          <div className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
