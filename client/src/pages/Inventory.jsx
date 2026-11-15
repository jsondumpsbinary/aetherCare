import { useState, useEffect } from "react";
import {
  Pill,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";
import { api } from "../services/api";

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [addForm, setAddForm] = useState({
    name: "",
    genericName: "",
    category: "General",
    batchNumber: "",
    expiryDate: "",
    currentStock: "100",
    lowStockThreshold: "20",
    unit: "tablets",
    unitPrice: "0",
  });

  const [restockForm, setRestockForm] = useState({
    quantity: "",
    batchNumber: "",
    expiryDate: "",
    reason: "Supplier delivery restock",
  });

  const [issueForm, setIssueForm] = useState({
    quantity: "",
    patientId: "",
    reason: "Doctor consultation treatment",
  });

  async function loadData() {
    setLoading(true);
    try {
      const [medsRes, patientsRes] = await Promise.all([
        api.getMedicines(),
        api.getPatients(),
      ]);

      if (medsRes.success && medsRes.data) {
        setMedicines(medsRes.data);
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
  }, []);

  async function handleAddMedicine(e) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.batchNumber.trim()) {
      setError("Medicine name and batch number are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.createMedicine({
        name: addForm.name.trim(),
        genericName: addForm.genericName.trim() || undefined,
        category: addForm.category.trim() || undefined,
        batchNumber: addForm.batchNumber.trim(),
        expiryDate: addForm.expiryDate || undefined,
        currentStock: Number(addForm.currentStock) || 0,
        lowStockThreshold: Number(addForm.lowStockThreshold) || 10,
        unit: addForm.unit.trim() || "units",
        unitPrice: Number(addForm.unitPrice) || 0,
      });

      if (res.success) {
        setShowAddModal(false);
        setAddForm({
          name: "",
          genericName: "",
          category: "General",
          batchNumber: "",
          expiryDate: "",
          currentStock: "100",
          lowStockThreshold: "20",
          unit: "tablets",
          unitPrice: "0",
        });
        loadData();
      } else {
        setError(res.message || "Failed to add medicine.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestock(e) {
    e.preventDefault();
    if (!selectedMedicine || !restockForm.quantity || Number(restockForm.quantity) <= 0) {
      setError("Please provide a valid quantity.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.restockMedicine(selectedMedicine.id, {
        quantity: Number(restockForm.quantity),
        batchNumber: restockForm.batchNumber.trim() || undefined,
        expiryDate: restockForm.expiryDate || undefined,
        reason: restockForm.reason.trim() || undefined,
      });

      if (res.success) {
        setShowRestockModal(false);
        setSelectedMedicine(null);
        setRestockForm({
          quantity: "",
          batchNumber: "",
          expiryDate: "",
          reason: "Supplier delivery restock",
        });
        loadData();
      } else {
        setError(res.message || "Failed to restock item.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!selectedMedicine || !issueForm.quantity || Number(issueForm.quantity) <= 0) {
      setError("Please provide a valid quantity.");
      return;
    }

    if (Number(issueForm.quantity) > selectedMedicine.currentStock) {
      setError(`Cannot issue more than available stock (${selectedMedicine.currentStock}).`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.issueMedicine(selectedMedicine.id, {
        quantity: Number(issueForm.quantity),
        patientId: issueForm.patientId ? Number(issueForm.patientId) : undefined,
        reason: issueForm.reason.trim() || undefined,
      });

      if (res.success) {
        setShowIssueModal(false);
        setSelectedMedicine(null);
        setIssueForm({
          quantity: "",
          patientId: "",
          reason: "Doctor consultation treatment",
        });
        loadData();
      } else {
        setError(res.message || "Failed to issue medicine.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  const categories = Array.from(
    new Set(medicines.map((m) => m.category).filter(Boolean))
  );

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      search === "" ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(search.toLowerCase()) ||
      m.batchNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || m.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || m.currentStock <= m.lowStockThreshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = medicines.filter(
    (m) => m.currentStock > 0 && m.currentStock <= m.lowStockThreshold
  ).length;
  const outOfStockCount = medicines.filter((m) => m.currentStock === 0).length;
  const healthyCount = medicines.filter(
    (m) => m.currentStock > m.lowStockThreshold
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy & Medical Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Track pharmaceutical stocks, monitor low-threshold alerts, and record treatment dispensations.
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
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Catalogue
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {medicines.length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Healthy Stock
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {healthyCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {lowStockCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Out of Stock
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {outOfStockCount}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-4 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Medicine Catalogue & Stock Levels
            </h2>
            <span className="ml-2 rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">
              {filteredMedicines.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search medicine, generic, batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none w-56"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors flex items-center gap-1 ${
                onlyLowStock
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Low Stock Only</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <p className="text-sm">Loading inventory items...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Pill className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">
                No medicines found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add medicine records or clear search filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Medicine & Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Batch & Expiry</th>
                  <th className="px-5 py-3">Current Stock</th>
                  <th className="px-5 py-3">Stock Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((m) => {
                  const isOut = m.currentStock === 0;
                  const isLow = !isOut && m.currentStock <= m.lowStockThreshold;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-500">
                          {m.genericName || "Standard formulation"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          {m.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <div>
                          <span className="font-mono text-slate-700 font-medium">
                            {m.batchNumber}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {m.expiryDate
                            ? `Exp: ${new Date(m.expiryDate).toLocaleDateString([], {
                                month: "short",
                                year: "numeric",
                              })}`
                            : "No expiry logged"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-slate-900">
                            {m.currentStock}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {m.unit}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Min threshold: {m.lowStockThreshold}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60">
                            <AlertCircle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedMedicine(m);
                              setError("");
                              setShowRestockModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            <span>Restock</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMedicine(m);
                              setError("");
                              setShowIssueModal(true);
                            }}
                            disabled={m.currentStock === 0}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-40"
                          >
                            <ArrowDownRight className="h-3 w-3 text-blue-600" />
                            <span>Issue</span>
                          </button>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Add Medicine to Catalogue
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medicine Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Generic Formula
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acetaminophen"
                    value={addForm.genericName}
                    onChange={(e) =>
                      setAddForm({ ...addForm, genericName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Analgesic, Antibiotic"
                    value={addForm.category}
                    onChange={(e) =>
                      setAddForm({ ...addForm, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-2026-A"
                    value={addForm.batchNumber}
                    onChange={(e) =>
                      setAddForm({ ...addForm, batchNumber: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.currentStock}
                    onChange={(e) =>
                      setAddForm({ ...addForm, currentStock: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.lowStockThreshold}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        lowStockThreshold: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Type
                  </label>
                  <input
                    type="text"
                    placeholder="tablets, vials, bottles"
                    value={addForm.unit}
                    onChange={(e) =>
                      setAddForm({ ...addForm, unit: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={addForm.expiryDate}
                    onChange={(e) =>
                      setAddForm({ ...addForm, expiryDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addForm.unitPrice}
                    onChange={(e) =>
                      setAddForm({ ...addForm, unitPrice: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRestockModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">
                  Restock {selectedMedicine.name}
                </h3>
              </div>
              <button
                onClick={() => setShowRestockModal(false)}
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

            <form onSubmit={handleRestock} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                <p className="text-slate-500">Current In Stock:</p>
                <p className="text-base font-bold text-slate-800">
                  {selectedMedicine.currentStock} {selectedMedicine.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Add ({selectedMedicine.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={restockForm.quantity}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, quantity: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Batch Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder={selectedMedicine.batchNumber}
                  value={restockForm.batchNumber}
                  onChange={(e) =>
                    setRestockForm({
                      ...restockForm,
                      batchNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={restockForm.expiryDate}
                  onChange={(e) =>
                    setRestockForm({
                      ...restockForm,
                      expiryDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Restock Reason / Source
                </label>
                <input
                  type="text"
                  value={restockForm.reason}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, reason: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Restocking..." : "Confirm Restock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIssueModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Issue {selectedMedicine.name}
                </h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
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

            <form onSubmit={handleIssue} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-500">Available to Dispense:</p>
                  <p className="text-base font-bold text-slate-800">
                    {selectedMedicine.currentStock} {selectedMedicine.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Batch:</p>
                  <p className="font-mono text-slate-700 font-medium">
                    {selectedMedicine.batchNumber}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Dispense ({selectedMedicine.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedMedicine.currentStock}
                  placeholder="e.g. 10"
                  value={issueForm.quantity}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, quantity: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Patient (Optional)
                </label>
                <select
                  value={issueForm.patientId}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, patientId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- General Hospital Use / Unassigned --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Treatment Reason / Prescription Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inpatient dosage, emergency triage"
                  value={issueForm.reason}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, reason: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Dispensing..." : "Dispense Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
