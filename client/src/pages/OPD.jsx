import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  ArrowRight,
  RefreshCw,
  X,
  AlertCircle,
  Bed,
} from "lucide-react";
import { api } from "../services/api";

export default function OPD() {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    departmentId: "",
    doctorId: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  async function loadData() {
    setLoading(true);
    try {
      const [visitsRes, deptsRes, docsRes, patientsRes] = await Promise.all([
        api.getOPDVisits(),
        api.getDepartments(),
        api.getDoctors(),
        api.getPatients(),
      ]);

      if (visitsRes.success && visitsRes.data) {
        setVisits(visitsRes.data);
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data);
      }
      if (docsRes.success && docsRes.data) {
        setDoctors(docsRes.data);
      }
      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    if (location.state?.patientId) {
      setFormData((prev) => ({
        ...prev,
        patientId: String(location.state.patientId),
      }));
      setShowModal(true);
    }
  }, [location.state]);

  async function handleCreateVisit(e) {
    e.preventDefault();
    if (!formData.patientId || !formData.departmentId || !formData.doctorId) {
      setError("Please select patient, department, and doctor.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.createOPDVisit({
        patientId: Number(formData.patientId),
        departmentId: Number(formData.departmentId),
        doctorId: Number(formData.doctorId),
      });

      if (res.success) {
        setShowModal(false);
        setFormData({ patientId: "", departmentId: "", doctorId: "" });
        loadData();
      } else {
        setError(res.message || "Failed to create OPD visit.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(visitId, newStatus) {
    try {
      await api.updateOPDStatus(visitId, newStatus);
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const filteredDoctors = formData.departmentId
    ? doctors.filter((d) => d.departmentId === Number(formData.departmentId))
    : doctors;

  const filteredVisits = visits.filter((v) => {
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchesDept =
      deptFilter === "ALL" || v.departmentId === Number(deptFilter);
    return matchesStatus && matchesDept;
  });

  const waitingCount = visits.filter((v) => v.status === "WAITING").length;
  const inConsultCount = visits.filter(
    (v) => v.status === "IN_CONSULTATION"
  ).length;
  const completedCount = visits.filter((v) => v.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            OPD Queue Management
          </h1>
          <p className="text-sm text-slate-500">
            Monitor real-time patient consultations, queue tokens, and triage flow.
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
            <span>Register OPD Visit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              In Waiting Queue
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{waitingCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              In Consultation
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {inConsultCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Completed Today
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {completedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-4 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Daily Consultation Queue
            </h2>
            <span className="ml-2 rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">
              {filteredVisits.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_CONSULTATION">In Consultation</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <p className="text-sm">Loading OPD queue...</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CalendarClock className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No visits found</p>
              <p className="text-xs text-slate-400 mt-1">
                Register a new visit or adjust your queue filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Assigned Doctor</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          #{v.tokenNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div>
                          <p>{v.patient?.name || `Patient #${v.patientId}`}</p>
                          <p className="text-xs text-slate-400 font-normal">
                            {v.patient?.phone || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {v.department?.name || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {v.doctor?.name ? `Dr. ${v.doctor.name}` : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {v.visitDate
                          ? new Date(v.visitDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        {v.status === "WAITING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                            <Clock className="h-3 w-3" /> Waiting
                          </span>
                        )}
                        {v.status === "IN_CONSULTATION" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                            <UserCheck className="h-3 w-3" /> In Consultation
                          </span>
                        )}
                        {v.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        )}
                        {v.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60">
                            <XCircle className="h-3 w-3" /> Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === "WAITING" && (
                            <button
                              onClick={() =>
                                handleStatusChange(v.id, "IN_CONSULTATION")
                              }
                              className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              Call In
                            </button>
                          )}
                          {v.status === "IN_CONSULTATION" && (
                            <button
                              onClick={() =>
                                handleStatusChange(v.id, "COMPLETED")
                              }
                              className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {v.status === "IN_CONSULTATION" && (
                            <button
                              onClick={() =>
                                navigate("/admissions", {
                                  state: {
                                    patientId: v.patientId,
                                    patientName: v.patient?.name,
                                  },
                                })
                              }
                              className="rounded-md bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
                              title="Admit Patient to Bed"
                            >
                              <Bed className="h-3 w-3" /> Admit
                            </button>
                          )}
                          {v.status === "WAITING" && (
                            <button
                              onClick={() =>
                                handleStatusChange(v.id, "CANCELLED")
                              }
                              className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Cancel Visit"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
                <CalendarClock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  New OPD Consultation
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

            <form onSubmit={handleCreateVisit} className="space-y-4">
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
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departmentId: e.target.value,
                      doctorId: "",
                    })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor *
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
                  }
                  required
                  disabled={!formData.departmentId}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">-- Choose Doctor --</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name}
                    </option>
                  ))}
                </select>
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
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Generate Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
