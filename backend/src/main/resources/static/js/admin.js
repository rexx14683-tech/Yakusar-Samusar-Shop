function switchTab(tab) {
  document.querySelectorAll(".tab-section").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`tab-${tab}`).classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("border-orange-600", isActive);
    btn.classList.toggle("text-orange-600", isActive);
    btn.classList.toggle("border-transparent", !isActive);
    btn.classList.toggle("text-gray-500", !isActive);
  });
}

// ---------------- Categories ----------------

let categoriesCache = [];

async function loadCategories() {
  try {
    categoriesCache = await apiFetch("/categories");
    renderCategoryList();
    renderCategoryOptions();
  } catch (err) {
    showError("error", err.message);
  }
}

function renderCategoryList() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";
  categoriesCache.forEach((c) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between px-4 py-3";
    row.innerHTML = `
      <span class="text-gray-800">${c.name}</span>
      <button data-id="${c.id}" class="delete-category text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
    `;
    list.appendChild(row);
  });

  document.querySelectorAll(".delete-category").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this category?")) return;
      try {
        await apiFetch(`/admin/categories/${btn.dataset.id}`, { method: "DELETE" });
        loadCategories();
      } catch (err) {
        showError("error", err.message);
      }
    });
  });
}

function renderCategoryOptions() {
  const select = document.getElementById("food-item-category");
  const current = select.value;
  select.innerHTML = '<option value="">No category</option>';
  categoriesCache.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
  select.value = current;
}

// ---------------- Food items ----------------

async function loadFoodItems() {
  const grid = document.getElementById("food-item-list");
  grid.innerHTML = "";
  try {
    const items = await apiFetch("/food-items");
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-sm overflow-hidden flex flex-col";
      card.innerHTML = `
        <img src="${foodImageSrc(item.imageUrl)}" alt="${item.name}" class="h-48 w-full object-cover" />
        <div class="p-3 flex flex-col flex-1">
          <h3 class="font-semibold text-gray-800">${item.name}</h3>
          <p class="text-sm text-gray-500">${item.categoryName || "Uncategorized"} · Stock: ${item.stockQuantity}</p>
          <span class="text-orange-600 font-bold mt-1">${formatMoney(item.price)}</span>
          <div class="flex gap-2 mt-3">
            <button data-id="${item.id}" class="edit-item flex-1 bg-orange-100 text-orange-700 rounded-md py-1.5 text-sm font-medium hover:bg-orange-200">Edit</button>
            <button data-id="${item.id}" class="delete-item flex-1 bg-red-100 text-red-700 rounded-md py-1.5 text-sm font-medium hover:bg-red-200">Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    document.querySelectorAll(".edit-item").forEach((btn) => {
      const item = items.find((i) => String(i.id) === btn.dataset.id);
      btn.addEventListener("click", () => populateFoodItemForm(item));
    });
    document.querySelectorAll(".delete-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this food item?")) return;
        try {
          await apiFetch(`/admin/food-items/${btn.dataset.id}`, { method: "DELETE" });
          loadFoodItems();
        } catch (err) {
          showError("error", err.message);
        }
      });
    });
  } catch (err) {
    showError("error", err.message);
  }
}

function populateFoodItemForm(item) {
  document.getElementById("food-item-id").value = item.id;
  document.getElementById("food-item-name").value = item.name;
  document.getElementById("food-item-category").value = item.categoryId || "";
  document.getElementById("food-item-price").value = item.price;
  document.getElementById("food-item-stock").value = item.stockQuantity;
  document.getElementById("food-item-description").value = item.description || "";
  document.getElementById("food-item-available").checked = item.available;
  document.getElementById("food-item-image").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetFoodItemForm() {
  document.getElementById("food-item-form").reset();
  document.getElementById("food-item-id").value = "";
  document.getElementById("food-item-available").checked = true;
}

// ---------------- Orders ----------------

async function loadOrders() {
  const list = document.getElementById("order-list");
  list.innerHTML = "";
  try {
    const orders = await apiFetch("/admin/orders");
    orders.forEach((order) => {
      const itemsHtml = order.items
        .map((i) => `<li class="text-sm text-gray-600">${i.quantity} × ${i.foodItemName}</li>`)
        .join("");

      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-sm p-4";
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800">Order #${order.id} — ${order.userName}</span>
          ${statusBadge(order.status)}
        </div>
        <ul class="mb-2">${itemsHtml}</ul>
        <div class="flex items-center justify-between border-t pt-2 mt-2">
          <span class="font-bold text-orange-600">${formatMoney(order.totalAmount)}</span>
          <select data-id="${order.id}" class="status-select border border-gray-300 rounded-md px-2 py-1 text-sm">
            ${["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
              .map((s) => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`)
              .join("")}
          </select>
        </div>
      `;
      list.appendChild(card);
    });

    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", async () => {
        try {
          await apiFetch(`/admin/orders/${select.dataset.id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status: select.value }),
          });
          loadOrders();
        } catch (err) {
          showError("error", err.message);
        }
      });
    });
  } catch (err) {
    showError("error", err.message);
  }
}

// ---------------- Users ----------------

async function loadUsers() {
  const list = document.getElementById("user-list");
  list.innerHTML = "";
  try {
    const users = await apiFetch("/admin/users");
    users.forEach((u) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between px-4 py-3";
      row.innerHTML = `
        <div>
          <span class="text-gray-800 font-medium">${u.name}</span>
          <span class="text-sm text-gray-500 ml-2">${u.email} · ${u.role}</span>
        </div>
        <button data-id="${u.id}" data-active="${u.active}" class="toggle-user text-sm font-medium ${u.active ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-700"}">
          ${u.active ? "Deactivate" : "Activate"}
        </button>
      `;
      list.appendChild(row);
    });

    document.querySelectorAll(".toggle-user").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await apiFetch(`/admin/users/${btn.dataset.id}/status`, {
            method: "PUT",
            body: JSON.stringify({ active: btn.dataset.active !== "true" }),
          });
          loadUsers();
        } catch (err) {
          showError("error", err.message);
        }
      });
    });
  } catch (err) {
    showError("error", err.message);
  }
}

// ---------------- Init ----------------

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  renderNav("admin");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
      if (btn.dataset.tab === "food-items") loadFoodItems();
      if (btn.dataset.tab === "orders") loadOrders();
      if (btn.dataset.tab === "users") loadUsers();
    });
  });

  loadCategories();

  document.getElementById("category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: document.getElementById("category-name").value }),
      });
      document.getElementById("category-name").value = "";
      loadCategories();
    } catch (err) {
      showError("error", err.message);
    }
  });

  document.getElementById("food-item-reset").addEventListener("click", resetFoodItemForm);

  document.getElementById("food-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("food-item-id").value;

    const formData = new FormData();
    formData.append("name", document.getElementById("food-item-name").value);
    formData.append("description", document.getElementById("food-item-description").value);
    formData.append("price", document.getElementById("food-item-price").value);
    formData.append("stockQuantity", document.getElementById("food-item-stock").value);
    formData.append("available", document.getElementById("food-item-available").checked);
    const categoryId = document.getElementById("food-item-category").value;
    if (categoryId) formData.append("categoryId", categoryId);

    const imageFile = document.getElementById("food-item-image").files[0];
    if (imageFile) formData.append("image", imageFile);

    try {
      if (id) {
        await apiFetch(`/admin/food-items/${id}`, { method: "PUT", body: formData });
      } else {
        if (!imageFile) {
          showError("error", "Please select an image for the new food item");
          return;
        }
        await apiFetch("/admin/food-items", { method: "POST", body: formData });
      }
      resetFoodItemForm();
      loadFoodItems();
    } catch (err) {
      showError("error", err.message);
    }
  });
});
