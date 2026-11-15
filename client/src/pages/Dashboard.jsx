import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bed,
  FileCheck2,
  CalendarClock,
  Pill,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { api } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    admissions: 0,
    opdWaiting: 0,
    availableBeds: 0,
    totalBeds: 0,
    lowStock: 0,
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [opdQueue, setOpdQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [patientsRes, admissionsRes, opdRes, bedsRes, lowStockRes] =
        await Promise.all([
          api.getPatients().catch(() => ({ data: [] })),
          api.getActiveAdmissions().catch(() => ({ data: [] })),
          api.getOPDVisits().catch(() => ({ data: [] })),
          api.getBeds().catch(() => ({ data: [] })),
          api.getLowStock().catch(() => ({ data: [] })),
        ]);

      const allBeds = bedsRes.data || [];
      const availableBeds = allBeds.filter((b) => b.status === "AVAILABLE").length;
      const opdVisits = opdRes.data || [];
      const waitingVisits = opdVisits.filter((v) => v.status === "WAITING");

      setStats({
        patients: patientsRes.data ? patientsRes.data.length : 0,
        admissions: admissionsRes.data ? admissionsRes.data.length : 0,
        opdWaiting: waitingVisits.length,
        availableBeds,
        totalBeds: allBeds.length,
        lowStock: lowStockRes.data ? lowStockRes.data.length : 0,
      });

      setRecentAdmissions(admissionsRes.data ? admissionsRes.data.slice(0, 5) : []);
      setOpdQueue(opdVisits.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospital Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operational dashboard for patient flow and resources.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Low-stock warning banner if any */}
      {stats.lowStock > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Low-Stock Alert</p>
              <p className="text-xs text-amber-700">
                {stats.lowStock} medicine{stats.lowStock > 1 ? "s are" : " is"} currently at or below their restock threshold.
              </p>
            </div>
          </div>
          <Link
            to="/inventory"
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
          >
            <span>Review Stock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Patients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Patients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {stats.patients}
          </p>
          <Link
            to="/patients"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            <span>Open directory</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 2: OPD Waiting */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              OPD Queue (Waiting)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {stats.opdWaiting}
          </p>
          <Link
            to="/opd"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
          >
            <span>Manage queue</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Bed Availability */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bed Availability
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Bed className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats.availableBeds}
            </span>
            <span className="text-xs font-medium text-slate-400">
              / {stats.totalBeds} total
            </span>
          </div>
          <Link
            to="/beds"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800"
          >
            <span>View bed layout</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 4: Active Admissions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Inpatients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {stats.admissions}
          </p>
          <Link
            to="/admissions"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>View admissions</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Core Workflows & Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to="/patients"
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group"
          >
            <PlusCircle className="h-5 w-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold text-slate-800">1. Register Patient</span>
          </Link>
          <Link
            to="/opd"
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition text-center group"
          >
            <CalendarClock className="h-5 w-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold text-slate-800">2. OPD Token</span>
          </Link>
          <Link
            to="/beds"
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-center group"
          >
            <Bed className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold text-slate-800">3. Check Beds</span>
          </Link>
          <Link
            to="/admissions"
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-center group"
          >
            <FileCheck2 className="h-5 w-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold text-slate-800">4. Admit Inpatient</span>
          </Link>
          <Link
            to="/inventory"
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition text-center group"
          >
            <Pill className="h-5 w-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold text-slate-800">5. Issue Medicine</span>
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Active Admissions & OPD Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Admissions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Current Inpatients</h3>
            <Link
              to="/admissions"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No active inpatient admissions.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAdmissions.map((adm) => (
                <div key={adm.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {adm.patient?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Bed: <span className="font-medium text-slate-700">{adm.bed?.bedNumber}</span> ({adm.bed?.ward?.name})
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    Admitted
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OPD Queue Snapshot */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Live OPD Queue</h3>
            <Link
              to="/opd"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Open queue
            </Link>
          </div>

          {opdQueue.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No OPD visits registered today.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {opdQueue.map((visit) => (
                <div key={visit.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 mr-2">
                      {visit.tokenNumber}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {visit.patient?.name}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {visit.doctor?.name} • {visit.department?.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      visit.status === "WAITING"
                        ? "bg-amber-50 text-amber-700"
                        : visit.status === "IN_CONSULTATION"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {visit.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
