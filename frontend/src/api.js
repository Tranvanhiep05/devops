const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "shop_auth_token";
const ROLE_KEY = "shop_auth_role";
const USERNAME_KEY = "shop_auth_username";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function setSession({ token, role, username }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (username, password) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handle),
  register: (username, password) =>
    fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handle),

  getProducts: () => fetch(`${API_URL}/api/products`).then(handle),
  getProduct: (id) => fetch(`${API_URL}/api/products/${id}`).then(handle),
  createProduct: (data) =>
    fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),
  updateProduct: (id, data) =>
    fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),
  deleteProduct: (id) =>
    fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(handle),

  createOrder: (data) =>
    fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),
  getOrders: () =>
    fetch(`${API_URL}/api/orders`, { headers: { ...authHeaders() } }).then(handle),
  updateOrderStatus: (id, status) =>
    fetch(`${API_URL}/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    }).then(handle),
};

export { API_URL };
