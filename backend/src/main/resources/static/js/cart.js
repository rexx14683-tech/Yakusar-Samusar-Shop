async function loadCart() {
  const container = document.getElementById("cart-items");
  const empty = document.getElementById("empty");
  const summary = document.getElementById("cart-summary");
  container.innerHTML = "";

  try {
    const cart = await apiFetch("/cart");

    if (cart.items.length === 0) {
      empty.classList.remove("hidden");
      summary.classList.add("hidden");
      return;
    }

    empty.classList.add("hidden");
    summary.classList.remove("hidden");
    document.getElementById("cart-total").textContent = formatMoney(cart.totalAmount);

    cart.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-4";
      row.innerHTML = `
        <div>
          <h3 class="font-semibold text-gray-800">${item.foodItemName}</h3>
          <p class="text-sm text-gray-500">${formatMoney(item.price)} each</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="quantity-input w-16 border border-gray-300 rounded-md px-2 py-1 text-center" />
          <span class="font-medium text-orange-600 w-20 text-right">${formatMoney(item.lineTotal)}</span>
          <button data-id="${item.id}" class="remove-btn text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
        </div>
      `;
      container.appendChild(row);
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", () => updateQuantity(input.dataset.id, input.value));
    });
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeItem(btn.dataset.id));
    });
  } catch (err) {
    showError("error", err.message);
  }
}

async function updateQuantity(itemId, quantity) {
  try {
    await apiFetch(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: Number(quantity) }),
    });
    loadCart();
  } catch (err) {
    showError("error", err.message);
  }
}

async function removeItem(itemId) {
  try {
    await apiFetch(`/cart/items/${itemId}`, { method: "DELETE" });
    loadCart();
  } catch (err) {
    showError("error", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  renderNav("cart");
  loadCart();

  document.getElementById("checkout-btn").addEventListener("click", async () => {
    try {
      await apiFetch("/orders", { method: "POST" });
      window.location.href = "orders.html";
    } catch (err) {
      showError("error", err.message);
    }
  });
});
