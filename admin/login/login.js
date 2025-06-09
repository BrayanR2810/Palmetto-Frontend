const API_LOGIN = "https://palmetto-cocina-y-cafe.onrender.com/api/usuarios/login";

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const correo = document.getElementById("correo").value;
      const contraseña = document.getElementById("contraseña").value;

      try {
        const res = await fetch(API_LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ correo, contraseña })
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.mensaje || "Error al iniciar sesión.");
          return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        // Redirigir al dashboard
        window.location.href = "../dashboard/dashboard.html";
      } catch (err) {
        alert("Error de conexión con el servidor.");
        console.error(err);
      }
    });
  }
});

