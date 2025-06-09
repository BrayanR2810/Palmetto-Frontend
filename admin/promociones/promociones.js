document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:4000/api/promociones";
  const btnAgregar = document.getElementById("btnAgregarPromo");
  const inputArchivo = document.getElementById("promoFile");
  const carrusel = document.getElementById("carousel-promos");
  const dots = document.querySelector(".dots");

  let promociones = [];
  let slideActual = 0;
  let perfilUsuario = null;

  // Obtener perfil desde token
  function obtenerPerfilDesdeToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.perfil;
  }

  perfilUsuario = obtenerPerfilDesdeToken();

  function mostrarSlide(index) {
    const slides = document.querySelectorAll(".carousel-slide");
    const dotElems = document.querySelectorAll(".dot");
    slides.forEach(s => s.classList.remove("active"));
    dotElems.forEach(d => d.classList.remove("active"));
    if (slides[index]) {
      slides[index].classList.add("active");
      dotElems[index].classList.add("active");
    }
    slideActual = index;
  }

  function renderizarPromociones() {
    carrusel.innerHTML = "";
    dots.innerHTML = "";

    promociones.forEach((promo, i) => {
      const slide = document.createElement("div");
      slide.classList.add("carousel-slide");
      if (i === 0) slide.classList.add("active");

      slide.innerHTML = `
        <img src="data:image/jpeg;base64,${promo.imagen}" alt="Promo ${i}">
        ${perfilUsuario === "Administrador" ? `
          <div class="slide-acciones">
            <button class="btn-eliminar" data-id="${promo._id}">🗑️</button>
          </div>` : ""}
      `;

      carrusel.appendChild(slide);

      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => mostrarSlide(i));
      dots.appendChild(dot);
    });

    mostrarSlide(slideActual);
  }

  async function cargarPromociones() {
    try {
      const res = await fetch(API_URL);
      promociones = await res.json();
      renderizarPromociones();
    } catch (error) {
      console.error("Error al cargar promociones:", error);
    }
  }

  document.querySelector(".carousel-btn.prev")?.addEventListener("click", () => {
    slideActual = (slideActual - 1 + promociones.length) % promociones.length;
    mostrarSlide(slideActual);
  });

  document.querySelector(".carousel-btn.next")?.addEventListener("click", () => {
    slideActual = (slideActual + 1) % promociones.length;
    mostrarSlide(slideActual);
  });

  carrusel.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
      const id = e.target.dataset.id;
      const confirmar = confirm("¿Estás seguro de eliminar esta promoción?");
      if (!confirmar) return;

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          alert("Imagen eliminada correctamente");
          cargarPromociones();
        } else {
          alert(data.error || "Error al eliminar");
        }
      } catch (err) {
        alert("Error al conectar con el servidor");
      }
    }
  });

  btnAgregar?.addEventListener("click", async () => {
    const archivo = inputArchivo.files[0];
    if (!archivo) return alert("Selecciona una imagen");

    const formData = new FormData();
    formData.append("imagen", archivo);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert("Imagen agregada correctamente");
        inputArchivo.value = "";
        cargarPromociones();
      } else {
        alert(data.error || "Error al subir imagen");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  });

  cargarPromociones();
});
