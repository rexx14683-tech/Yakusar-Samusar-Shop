document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const auth = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
          }),
        });
        setSession(auth);
        window.location.href = auth.role === "ADMIN" ? "admin.html" : "menu.html";
      } catch (err) {
        showError("error", err.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const auth = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value,
          }),
        });
        setSession(auth);
        window.location.href = "menu.html";
      } catch (err) {
        showError("error", err.message);
      }
    });
  }
});
