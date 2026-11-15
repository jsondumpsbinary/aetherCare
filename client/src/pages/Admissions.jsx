import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  Bed,
  X,
  User,
  Calendar,
} from "lucide-react";
import { api } from "../services/api";

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [discharging, setDischarging] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    bedId: "",
    reason: "",
  });

  const location = useLocation();

  async function loadData() {
    setLoading(true);
    try {
      const [admissionsRes, patientsRes, bedsRes] = await Promise.all([
        api.getAdmissions(),
        api.getPatients(),
        api.getAvailableBeds(),
      ]);

      if (admissionsRes.success && admissionsRes.data) {
        setAdmissions(admissionsRes.data);
      }
      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data);
      }
      if (bedsRes.success && bedsRes.data) {
        setAvailableBeds(bedsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    if (location.state?.patientId || location.state?.bedId) {
      setFormData((prev) => ({
        ...prev,
        patientId: location.state.patientId ? String(location.state.patientId) : prev.patientId,
        bedId: location.state.bedId ? String(location.state.bedId) : prev.bedId,
      }));
      setShowModal(true);
    }
  }, [location.state]);

  async function handleAdmitPatient(e) {
    e.preventDefault();
    if (!formData.patientId || !formData.bedId) {
      setError("Please select both a patient and an available bed.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.createAdmission({
        patientId: Number(formData.patientId),
        bedId: Number(formData.bedId),
        reason: formData.reason.trim() || undefined,
      });

      if (res.success) {
        setShowModal(false);
        setFormData({ patientId: "", bedId: "", reason: "" });
        loadData();
      } else {
        setError(res.message || "Failed to admit patient.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDischarge() {
    if (!dischargeTarget) return;

    setDischarging(true);
    try {
      const res = await api.dischargeAdmission(dischargeTarget.id);
      if (res.success) {
        setDischargeTarget(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDischarging(false);
    }
  }

  const filteredAdmissions = admissions.filter((a) => {
    const matchesStatus =
      statusFilter === "ALL" || a.status === statusFilter;
    const matchesSearch =
      search === "" ||
      a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.bed?.bedNumber?.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = admissions.filter((a) => a.status === "ACTIVE").length;
  const dischargedCount = admissions.filter(
    (a) => a.status === "DISCHARGED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inpatient Admissions & Discharges
          </h1>
          <p className="text-sm text-slate-500">
            Manage bed allocations, patient hospital stays, and release records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Admit Patient</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Active Inpatients
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{activeCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Available Beds
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {availableBeds.length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Past Discharges
            </p>
            <p className="text-2xl font-bold text-slate-600 mt-1">
              {dischargedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <LogOut className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-4 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Admission Records
            </h2>
            <span className="ml-2 rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">
              {filteredAdmissions.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, bed, diagnosis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none w-56"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ACTIVE">Active Only</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="ALL">All Records</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <p className="text-sm">Loading admissions...</p>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileCheck2 className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">
                No admissions found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Admit a patient or adjust your filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Bed Allocation</th>
                  <th className="px-5 py-3">Admission Date</th>
                  <th className="px-5 py-3">Diagnosis / Notes</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.map((a) => {
                  const isActive = a.status === "ACTIVE";

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {a.patient?.name || `Patient #${a.patientId}`}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {a.patient?.phone || "No contact"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">
                            {a.bed?.bedNumber || `#${a.bedId}`}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({a.bed?.ward?.name || "Ward"})
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 uppercase">
                          {a.bed?.bedType || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <div>
                          {a.admissionDate
                            ? new Date(a.admissionDate).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {a.admissionDate
                            ? new Date(a.admissionDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                        {a.reason || "General inpatient care"}
                      </td>
                      <td className="px-5 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                            <Clock className="h-3 w-3" /> Admitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                            <CheckCircle2 className="h-3 w-3" /> Discharged
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isActive ? (
                          <button
                            onClick={() => setDischargeTarget(a)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                          >
                            <LogOut className="h-3 w-3" /> Discharge
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {a.dischargeDate
                              ? `Discharged ${new Date(
                                  a.dischargeDate
                                ).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}`
                              : "Completed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Admit Patient to Bed
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-md p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleAdmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Bed *
                </label>
                <select
                  value={formData.bedId}
                  onChange={(e) =>
                    setFormData({ ...formData, bedId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} - {b.ward?.name || "Ward"} ({b.bedType})
                    </option>
                  ))}
                </select>
                {availableBeds.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No available beds in the hospital. Please free or add a bed.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admission Diagnosis / Reason
                </label>
                <textarea
                  rows="3"
                  placeholder="Primary condition, symptoms, or admission notes..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableBeds.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Admitting..." : "Confirm Admission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {dischargeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-100 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Discharge Inpatient
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to discharge{" "}
              <strong className="text-slate-800">
                {dischargeTarget.patient?.name}
              </strong>
              ? This will mark the stay as complete and immediately release Bed{" "}
              <strong className="text-slate-800">
                {dischargeTarget.bed?.bedNumber}
              </strong>{" "}
              for new patients.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDischargeTarget(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDischarge}
                disabled={discharging}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {discharging ? "Discharging..." : "Confirm & Release Bed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
