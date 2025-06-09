// ===== MÓDULO INICIO =====
const btnLogin = document.querySelector('.btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    window.location.href = "admin/login/login.html";
  });
}

// ===== MÓDULO MENÚ PÚBLICO =====
async function cargarMenuPublico() {
  const API_URL = "http://localhost:4000/api/platos";

  try {
    const res = await fetch(API_URL);
    const platos = await res.json();

    const categorias = {
      desayunos: document.querySelector('.carousel-track[data-categoria="desayunos"]'),
      'platos fuertes': document.querySelector('.carousel-track[data-categoria="platos fuertes"]'),
      bebidas: document.querySelector('.carousel-track[data-categoria="bebidas"]')
    };

    Object.values(categorias).forEach(track => {
      if (track) track.innerHTML = "";
    });

    platos.forEach(plato => {
      const categoria = plato.categoria?.toLowerCase();
      const track = categorias[categoria];
      if (!track) return;

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${plato.imagen}" alt="${plato.nombre}">
        <h4>${plato.nombre}</h4>
        <p>${plato.descripcion}</p>
        <span>$${plato.precioMax ? `${plato.precioMin} a $${plato.precioMax}` : plato.precioMin}</span>
      `;
      track.appendChild(card);
    });

    document.querySelectorAll('.categoria').forEach(categoria => {
      const container = categoria.querySelector('.carousel-container');
      const track = container.querySelector('.carousel-track');
      const prev = container.querySelector('.prev');
      const next = container.querySelector('.next');

      const card = track.querySelector('.card');
      if (!card) return;

      const cardWidth = card.offsetWidth + 16;
      prev?.addEventListener("click", () => {
        track.scrollBy({ left: -cardWidth, behavior: "smooth" });
      });

      next?.addEventListener("click", () => {
        track.scrollBy({ left: cardWidth, behavior: "smooth" });
      });
    });

  } catch (error) {
    console.error("Error cargando menú público:", error);
  }
}

// ===== MÓDULO PROMOCIONES PÚBLICO =====
async function cargarPromocionesPublicas() {
  const container = document.getElementById('carousel-promos-publico');
  const slidesContainer = container.querySelector('.carousel-slides');
  const dotsContainer = document.getElementById('promo-dots-publico');

  if (!container || !dotsContainer || !slidesContainer) return;

  try {
    const res = await fetch('http://localhost:4000/api/promociones');
    const promociones = await res.json();

    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    let currentIndex = 0;

    promociones.forEach((promo, i) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      if (i === 0) slide.classList.add('active');
      slide.innerHTML = `<img src="data:image/jpeg;base64,${promo.imagen}" alt="Promoción ${i + 1}">`;
      slidesContainer.appendChild(slide);

      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showSlide(i));
      dotsContainer.appendChild(dot);
    });

    const slides = slidesContainer.querySelectorAll('.carousel-slide');
    const dots = dotsContainer.querySelectorAll('.dot');

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
      });
      currentIndex = index;
    }

    container.querySelector('.prev')?.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(newIndex);
    });

    container.querySelector('.next')?.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % slides.length;
      showSlide(newIndex);
    });

  } catch (err) {
    console.error("Error al cargar promociones públicas", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarMenuPublico();
  cargarPromocionesPublicas();
});

