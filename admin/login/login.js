const formLogin = document.getElementById("form-login");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = formLogin.correo.value.trim().toLowerCase();
  const contraseña = formLogin.contraseña.value;

  if (!correo || !contraseña) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const res = await fetch("https://palmetto-cocina-y-cafe.onrender.com/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contraseña })
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar token y datos de usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      alert("Bienvenido, " + data.usuario.nombre);
      window.location.href = "../Dashboard/dashboard.html";
    } else {
      alert(data.mensaje || "Correo o contraseña incorrectos");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error de conexión con el servidor.");
  }
});
