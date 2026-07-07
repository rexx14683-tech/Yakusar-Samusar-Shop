async function loadOrders() {
  const list = document.getElementById("orders-list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";

  try {
    const orders = await apiFetch("/orders");

    if (orders.length === 0) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    orders.forEach((order) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-sm p-4";
      const itemsHtml = order.items
        .map((i) => `<li class="flex justify-between text-sm text-gray-600"><span>${i.quantity} × ${i.foodItemName}</span><span>${formatMoney(i.price * i.quantity)}</span></li>`)
        .join("");

      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800">Order #${order.id}</span>
          ${statusBadge(order.status)}
        </div>
        <ul class="space-y-1 mb-2">${itemsHtml}</ul>
        <div class="flex items-center justify-between border-t pt-2 mt-2">
          <span class="text-xs text-gray-400">${new Date(order.createdAt).toLocaleString()}</span>
          <span class="font-bold text-orange-600">${formatMoney(order.totalAmount)}</span>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    showError("error", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  renderNav("orders");
  loadOrders();
});
