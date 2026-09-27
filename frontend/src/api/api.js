const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function getToken() {
  return localStorage.getItem("velamar_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.error || "Ha ocurrido un error.");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  signup: (payload) => request("/signup", { method: "POST", body: payload }),
  login: (payload) => request("/login", { method: "POST", body: payload }),

  // Users
  getMe: () => request("/users/me", { auth: true }),
  updateMe: (payload) => request("/users/me", { method: "PUT", body: payload, auth: true }),
  deleteMe: () => request("/users/me", { method: "DELETE", auth: true }),

  // Catalog
  getCategories: () => request("/categories"),
  getExcursions: (categoria) => request(`/excursions${categoria ? `?categoria=${categoria}` : ""}`),
  getExcursion: (id) => request(`/excursions/${id}`),
  createExcursion: (payload) => request("/excursions", { method: "POST", body: payload, auth: true }),
  updateExcursion: (id, payload) => request(`/excursions/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteExcursion: (id) => request(`/excursions/${id}`, { method: "DELETE", auth: true }),

  // Cart
  getCart: () => request("/cart", { auth: true }),
  addCartItem: (payload) => request("/cart/items", { method: "POST", body: payload, auth: true }),
  updateCartItem: (id, payload) => request(`/cart/items/${id}`, { method: "PUT", body: payload, auth: true }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: "DELETE", auth: true }),

  // Checkout
  checkout: () => request("/checkout", { method: "POST", auth: true }),
  confirmOrder: () => request("/orders/confirm", { method: "POST", auth: true }),
  getOrders: () => request("/orders", { auth: true }),

  // Admin
  getAdminReservations: () => request("/admin/reservations", { auth: true }),
};

export { getToken };
