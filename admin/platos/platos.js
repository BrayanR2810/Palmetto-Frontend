const API_URL = "http://localhost:4000/api/platos";

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  async function cargarPlatos() {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const platos = await res.json();

      document.querySelectorAll('.carousel-track').forEach(track => track.innerHTML = "");

      platos.forEach(plato => {
        const card = document.createElement("div");
        card.classList.add("card-admin");

        const botonesHTML = `
        <button class="editar">✏️ Editar</button>
        ${usuario.perfil === "Administrador" ? '<button class="borrar">🗑️ Borrar</button>' : ''}
      `;
      
        card.innerHTML = `
          <div class="img-container">
            <img src="${plato.imagen}" alt="${plato.nombre}">
            <div class="acciones">
              <button class="editar">✏️ Editar</button>
              <button class="borrar">🗑️ Borrar</button>
            </div>
          </div>
          <h4>${plato.nombre}</h4>
          <p>${plato.descripcion}</p>
          <span>$${plato.precioMax ? `${plato.precioMin} a $${plato.precioMax}` : plato.precioMin}</span>
        `;

        const categoria = plato.categoria?.toLowerCase() || "otros";
        const track = document.querySelector(`.carousel-track[data-categoria="${categoria}"]`);
        if (track) track.appendChild(card);

        // Editar
        card.querySelector(".editar").addEventListener("click", () => {
          localStorage.setItem("platoEditar", JSON.stringify({
            id: plato._id,
            nombre: plato.nombre,
            descripcion: plato.descripcion,
            precioMin: plato.precioMin,
            precioMax: plato.precioMax,
            imagenSrc: plato.imagen
          }));
          window.location.href = `editar.html?id=${plato._id}`;
        });

        // Borrar
        card.querySelector(".borrar").addEventListener("click", async () => {
          if (usuario.perfil !== "Administrador") {
            alert("No tienes permiso para borrar este plato.");
            return;
          }

          if (confirm("¿Deseas eliminar este plato?")) {
            const res = await fetch(`${API_URL}/${plato._id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
              alert("Plato eliminado correctamente");
              cargarPlatos();
            } else {
              alert("Error al eliminar el plato");
            }
          }
        });
      });
    } catch (err) {
      console.error("Error al cargar platos:", err);
    }
  }

  // Carrusel
  document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel-track');
    const btnPrev = container.querySelector('.prev');
    const btnNext = container.querySelector('.next');
    const scrollAmount = 270;

    btnPrev?.addEventListener("click", () => {
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    btnNext?.addEventListener("click", () => {
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  });

  // Botón Agregar
  document.querySelectorAll('.agregar').forEach(boton => {
    boton.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = 'agregar.html';
    });
  });

  // Agregar/Editar plato con imagen local
  const formulario = document.querySelector(".formulario");
  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = formulario.nombre.value.trim();
      const descripcion = formulario.descripcion.value.trim();
      const precioMin = parseFloat(formulario.precioMin?.value || formulario.precio?.value || 0);
      const precioMax = parseFloat(formulario.precioMax?.value || 0);
      const archivoImagen = formulario.imagen.files[0];

      if (!nombre || !descripcion || !archivoImagen) {
        alert("Completa todos los campos y selecciona una imagen.");
        return;
      }

const formData = new FormData();
formData.append("nombre", nombre);
formData.append("descripcion", descripcion);
formData.append("precioMin", precioMin);
if (!isNaN(precioMax) && precioMax > 0 && precioMax > precioMin) {
  formData.append("precioMax", precioMax);
}
formData.append("imagen", archivoImagen);
formData.append("categoria", formulario.categoria.value);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const metodo = id ? "PUT" : "POST";
const endpoint = id ? `${API_URL}/${id}` : API_URL;

try {
  const res = await fetch(endpoint, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (res.ok) {
    alert(id ? "Plato actualizado" : "Plato agregado");
    window.location.href = "platos.html";
  } else {
    const error = await res.json();
    console.log("ERROR DETALLADO:", error);
    alert(error?.error || "Error al guardar el plato.");
  }
} catch (err) {
  console.error("Error al guardar:", err);
}

    });
  }

  cargarPlatos();
});
