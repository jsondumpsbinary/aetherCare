import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bed,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  UserCheck,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { api } from "../services/api";

export default function Beds() {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    bedNumber: "",
    wardId: "",
    bedType: "GENERAL",
    status: "AVAILABLE",
  });

  const navigate = useNavigate();

  async function loadData() {
    setLoading(true);
    try {
      const [bedsRes, wardsRes] = await Promise.all([
        api.getBeds(),
        api.getWards(),
      ]);

      if (bedsRes.success && bedsRes.data) {
        setBeds(bedsRes.data);
      }
      if (wardsRes.success && wardsRes.data) {
        setWards(wardsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateBed(e) {
    e.preventDefault();
    if (!formData.bedNumber.trim() || !formData.wardId) {
      setError("Bed number and ward are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.createBed({
        bedNumber: formData.bedNumber.trim().toUpperCase(),
        wardId: Number(formData.wardId),
        bedType: formData.bedType,
        status: formData.status,
      });

      if (res.success) {
        setShowModal(false);
        setFormData({
          bedNumber: "",
          wardId: "",
          bedType: "GENERAL",
          status: "AVAILABLE",
        });
        loadData();
      } else {
        setError(res.message || "Failed to create bed.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(bedId, newStatus) {
    try {
      await api.updateBed(bedId, { status: newStatus });
      setBeds((prev) =>
        prev.map((b) => (b.id === bedId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const filteredBeds = beds.filter((b) => {
    const matchesWard =
      wardFilter === "ALL" || b.wardId === Number(wardFilter);
    const matchesType = typeFilter === "ALL" || b.bedType === typeFilter;
    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter;
    return matchesWard && matchesType && matchesStatus;
  });

  const totalCount = beds.length;
  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const maintenanceCount = beds.filter(
    (b) => b.status === "MAINTENANCE"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bed Availability & Management
          </h1>
          <p className="text-sm text-slate-500">
            Real-time occupancy status across all hospital wards and care units.
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
            <span>Add New Bed</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Beds
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Available
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {availableCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Occupied
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {occupiedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Maintenance
            </p>
            <p className="text-2xl font-bold text-slate-500 mt-1">
              {maintenanceCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-4 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Ward Bed Roster
            </h2>
            <span className="ml-2 rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">
              {filteredBeds.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Ward:</span>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Wards</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="GENERAL">General</option>
                <option value="ICU">ICU</option>
                <option value="PRIVATE">Private</option>
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
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <p className="text-sm">Loading hospital beds...</p>
            </div>
          ) : filteredBeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Bed className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No beds found</p>
              <p className="text-xs text-slate-400 mt-1">
                Add beds or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBeds.map((b) => {
                const isAvailable = b.status === "AVAILABLE";
                const isOccupied = b.status === "OCCUPIED";
                const isMaintenance = b.status === "MAINTENANCE";

                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isAvailable
                        ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300"
                        : isOccupied
                        ? "border-blue-200 bg-blue-50/20 hover:border-blue-300"
                        : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {b.ward?.name || "Ward"}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                          {b.bedNumber}
                        </h3>
                      </div>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {b.bedType}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {isAvailable && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      )}
                      {isOccupied && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                          <UserCheck className="h-3 w-3" /> Occupied
                        </span>
                      )}
                      {isMaintenance && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <Wrench className="h-3 w-3" /> Maintenance
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                      {isAvailable ? (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(b.id, "MAINTENANCE")
                            }
                            className="text-slate-500 hover:text-slate-700 font-medium"
                          >
                            Mark Maintenance
                          </button>
                          <button
                            onClick={() =>
                              navigate("/admissions", {
                                state: { bedId: b.id },
                              })
                            }
                            className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-800"
                          >
                            Admit <ArrowRight className="h-3 w-3" />
                          </button>
                        </>
                      ) : isOccupied ? (
                        <div className="w-full flex items-center justify-between text-slate-500">
                          <span>Patient In Residence</span>
                          <button
                            onClick={() => navigate("/admissions")}
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5"
                          >
                            View <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(b.id, "AVAILABLE")}
                          className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Mark as Ready / Available
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Add New Hospital Bed</h3>
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

            <form onSubmit={handleCreateBed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bed Identifier / Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICU-05, GEN-12"
                  value={formData.bedNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bedNumber: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward Location *
                </label>
                <select
                  value={formData.wardId}
                  onChange={(e) =>
                    setFormData({ ...formData, wardId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bed Type *
                </label>
                <select
                  value={formData.bedType}
                  onChange={(e) =>
                    setFormData({ ...formData, bedType: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="GENERAL">General</option>
                  <option value="ICU">ICU</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Maintenance</option>
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
                  {submitting ? "Adding..." : "Save Bed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
