document.addEventListener("DOMContentLoaded", async () => {
  const API_USUARIOS = "http://localhost:4000/api/usuarios";
  const API_PLATOS = "http://localhost:4000/api/platos";
  const API_PROMOS = "http://localhost:4000/api/promociones";

  // Función auxiliar para deducir género desde el nombre
  function generoDesdeNombre(nombre) {
    const nombreTrim = nombre.trim().toLowerCase();
    return nombreTrim.endsWith("a") ? "a" : "o"; // Bienvenid+a / Bienvenid+o
  }

  // Mostrar nombre del usuario logueado con saludo personalizado
  function mostrarNombreUsuario() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const nombre = payload.nombre || "Usuario";
      const perfil = payload.perfil || "Invitado";

      const letraGenero = generoDesdeNombre(nombre);
      const welcomeText = document.querySelector(".welcome");

      welcomeText.innerHTML = `Bienvenid@, <strong>${nombre}</strong> (${perfil})`;
    } catch (e) {
      console.error("Error al decodificar el token JWT:", e);
    }
  }

  // Obtener cantidad de documentos desde cada endpoint
  async function contar(apiUrl) {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (e) {
      console.error("Error al contar en", apiUrl, e);
      return 0;
    }
  }

  // Simular contador de visitas con localStorage
  function obtenerVisitas() {
    let visitas = parseInt(localStorage.getItem("visitas") || "0", 10);
    visitas++;
    localStorage.setItem("visitas", visitas);
    return visitas;
  }

  async function actualizarDashboard() {
    const platos = await contar(API_PLATOS);
    const promos = await contar(API_PROMOS);
    const usuarios = await contar(API_USUARIOS);
    const visitas = obtenerVisitas();

    const stats = document.querySelectorAll(".stat-number");
    if (stats.length >= 4) {
      stats[0].textContent = platos;
      stats[1].textContent = promos;
      stats[2].textContent = usuarios;
      stats[3].textContent = visitas;
    }
  }

  mostrarNombreUsuario();
  actualizarDashboard();
});
  