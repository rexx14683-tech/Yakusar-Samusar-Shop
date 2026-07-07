const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function setSession(authResponse) {
  localStorage.setItem("token", authResponse.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    })
  );
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const user = getUser();
  if (!getToken() || !user || user.role !== "ADMIN") {
    window.location.href = "login.html";
  }
}

async function apiFetch(path, options = {}) {
  const headers = options.body instanceof FormData
    ? { ...options.headers }
    : { "Content-Type": "application/json", ...options.headers };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.message ? data.message : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove("hidden");
  }
}

function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%25' height='100%25' fill='%23fed7aa'/><text x='50%25' y='50%25' font-size='16' fill='%239a3412' text-anchor='middle' dy='.3em'>No Image</text></svg>";

function foodImageSrc(imageUrl) {
  if (!imageUrl) return PLACEHOLDER_IMAGE;
  return imageUrl;
}

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function statusBadge(status) {
  const cls = STATUS_STYLES[status] || "bg-gray-100 text-gray-800";
  return `<span class="text-xs font-medium px-2 py-1 rounded-full ${cls}">${status}</span>`;
}

function renderNav(active) {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const user = getUser();
  const link = (href, label, key) =>
    `<a href="${href}" class="px-3 py-2 rounded-md text-sm font-medium ${active === key ? "bg-orange-600 text-white" : "text-gray-700 hover:bg-orange-100"}">${label}</a>`;

  nav.innerHTML = `
    <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
      <a href="menu.html" class="text-xl font-bold text-orange-600">Yakuza Samusar</a>
      <div class="flex items-center gap-1">
        ${link("menu.html", "Menu", "menu")}
        ${user ? link("cart.html", "Cart", "cart") : ""}
        ${user ? link("orders.html", "Orders", "orders") : ""}
        ${user && user.role === "ADMIN" ? link("admin.html", "Admin", "admin") : ""}
        ${user
          ? `<button id="logout-btn" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-orange-100">Logout (${user.name})</button>`
          : link("login.html", "Login", "login")}
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "login.html";
    });
  }
}

// Site-wide credit footer, injected on every page that loads this script.
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.createElement("footer");
  footer.className = "text-center text-sm text-gray-400 py-6 mt-8";
  footer.innerHTML = 'Developed by <span class="font-semibold text-orange-500">Aoi Ashito</span>';
  document.body.appendChild(footer);
});
