async function loadCategories() {
  const select = document.getElementById("category-filter");
  try {
    const categories = await apiFetch("/categories");
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch (err) {
    // categories are optional for browsing; ignore failure here
  }
}

function buildQuery() {
  const params = new URLSearchParams();
  const keyword = document.getElementById("search").value.trim();
  const categoryId = document.getElementById("category-filter").value;
  const minPrice = document.getElementById("min-price").value;
  const maxPrice = document.getElementById("max-price").value;

  if (keyword) params.set("keyword", keyword);
  if (categoryId) params.set("categoryId", categoryId);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function loadFoodItems() {
  const grid = document.getElementById("food-grid");
  const empty = document.getElementById("empty");
  grid.innerHTML = "";
  empty.classList.add("hidden");

  try {
    const items = await apiFetch(`/food-items${buildQuery()}`);

    if (items.length === 0) {
      empty.classList.remove("hidden");
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-sm overflow-hidden flex flex-col";
      card.innerHTML = `
        <img src="${foodImageSrc(item.imageUrl)}" alt="${item.name}" class="h-56 w-full object-cover" />
        <div class="p-4 flex flex-col flex-1">
          <h3 class="font-semibold text-lg text-gray-800">${item.name}</h3>
          <p class="text-sm text-gray-500 flex-1 mt-1">${item.description || ""}</p>
          <div class="flex items-center justify-between mt-3">
            <span class="text-orange-600 font-bold">${formatMoney(item.price)}</span>
            <span class="text-xs ${item.available && item.stockQuantity > 0 ? "text-green-600" : "text-red-500"}">
              ${item.available && item.stockQuantity > 0 ? "In stock" : "Unavailable"}
            </span>
          </div>
          <button data-id="${item.id}" class="add-to-cart mt-3 w-full bg-orange-600 text-white rounded-md py-2 font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed" ${item.available && item.stockQuantity > 0 ? "" : "disabled"}>
            Add to cart
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
  } catch (err) {
    showError("error", err.message);
  }
}

async function addToCart(foodItemId) {
  if (!getToken()) {
    window.location.href = "login.html";
    return;
  }
  try {
    await apiFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ foodItemId: Number(foodItemId), quantity: 1 }),
    });
    alert("Added to cart!");
  } catch (err) {
    showError("error", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav("menu");
  loadCategories();
  loadFoodItems();
  document.getElementById("filter-btn").addEventListener("click", loadFoodItems);
});
