const API_BASE = "http://localhost:5001/api";

function getAuthHeader() {
  const token = localStorage.getItem("aethercare_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  getProfile: () => request("/auth/me"),

  getPatients: (search) =>
    request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (patientData) =>
    request("/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
    }),
  updatePatient: (id, patientData) =>
    request(`/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patientData),
    }),

  getDepartments: () => request("/departments"),
  getDoctors: () => request("/doctors"),
  getOPDVisits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/opd-visits${query ? `?${query}` : ""}`);
  },
  createOPDVisit: (visitData) =>
    request("/opd-visits", {
      method: "POST",
      body: JSON.stringify(visitData),
    }),
  updateOPDStatus: (id, status) =>
    request(`/opd-visits/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getWards: () => request("/wards"),
  createWard: (wardData) =>
    request("/wards", {
      method: "POST",
      body: JSON.stringify(wardData),
    }),
  getBeds: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/beds${query ? `?${query}` : ""}`);
  },
  getAvailableBeds: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/beds/available${query ? `?${query}` : ""}`);
  },
  createBed: (bedData) =>
    request("/beds", {
      method: "POST",
      body: JSON.stringify(bedData),
    }),
  updateBed: (id, bedData) =>
    request(`/beds/${id}`, {
      method: "PATCH",
      body: JSON.stringify(bedData),
    }),

  getAdmissions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admissions${query ? `?${query}` : ""}`);
  },
  getActiveAdmissions: () => request("/admissions/active"),
  createAdmission: (admissionData) =>
    request("/admissions", {
      method: "POST",
      body: JSON.stringify(admissionData),
    }),
  dischargeAdmission: (id) =>
    request(`/admissions/${id}/discharge`, {
      method: "PATCH",
    }),

  getMedicines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/medicines${query ? `?${query}` : ""}`);
  },
  getLowStock: () => request("/inventory/low-stock"),
  createMedicine: (medicineData) =>
    request("/inventory/medicines", {
      method: "POST",
      body: JSON.stringify(medicineData),
    }),
  updateMedicine: (id, medicineData) =>
    request(`/inventory/medicines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(medicineData),
    }),
  restockMedicine: (id, data) =>
    request(`/inventory/medicines/${id}/restock`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  issueMedicine: (id, data) =>
    request(`/inventory/medicines/${id}/issue`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  adjustMedicineStock: (id, data) =>
    request(`/inventory/medicines/${id}/adjust`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStockMovements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/movements${query ? `?${query}` : ""}`);
  },
};
