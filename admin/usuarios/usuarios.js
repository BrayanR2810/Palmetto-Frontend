const API_URL = "http://localhost:4000/api/usuarios";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-crear-usuario");
  const listaUsuarios = document.getElementById("usuarios-lista-contenido");
  const btnSubmit = form.querySelector("button");
  const tituloFormulario = document.querySelector("#usuarios-form h2");

  let editandoId = null;

  function esAdmin() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    return usuario?.perfil === "Administrador";
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(API_URL);
      const usuarios = await res.json();

      listaUsuarios.innerHTML = "";

      usuarios.forEach(usuario => {
        const card = document.createElement("div");
        card.classList.add("usuario-card");

        card.innerHTML = `
          <div class="usuario-info"
               data-id="${usuario._id}"
               data-nombre="${usuario.nombre}"
               data-correo="${usuario.correo}"
               data-perfil="${usuario.perfil}">
            <strong>${usuario.nombre}</strong><br>
            ${usuario.correo}<br>
            ************<br>
            ${usuario.perfil}
          </div>
          <div class="usuario-acciones">
            <button class="btn-editar">Editar</button>
            <button class="btn-borrar">Borrar</button>
          </div>
        `;
        listaUsuarios.appendChild(card);
      });

      activarBotones();
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  }

  function activarBotones() {
    document.querySelectorAll(".btn-editar").forEach(btn => {
      const usuarioInfo = btn.closest(".usuario-card").querySelector(".usuario-info");

      btn.addEventListener("click", () => {
        if (esAdmin()) {
          const id = usuarioInfo.dataset.id;
          const nombre = usuarioInfo.dataset.nombre;
          const correo = usuarioInfo.dataset.correo;
          const perfil = usuarioInfo.dataset.perfil;

          form.nombre.value = nombre;
          form.correo.value = correo;
          form.contraseña.value = "";
          form.perfil.value = perfil;

          editandoId = id;
          tituloFormulario.textContent = "Editar Usuario";
          btnSubmit.textContent = "Actualizar";
        } else {
          alert("Solo los administradores pueden editar usuarios.");
        }
      });
    });

    document.querySelectorAll(".btn-borrar").forEach(btn => {
      if (!esAdmin()) {
        btn.style.display = "none";
        return;
      }

      btn.addEventListener("click", async (e) => {
        const id = e.target.closest(".usuario-card").querySelector(".usuario-info").dataset.id;
        if (confirm("¿Deseas eliminar este usuario?")) {
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          cargarUsuarios();
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoUsuario = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      contraseña: form.contraseña.value,
      perfil: form.perfil.value
    };

    if (!nuevoUsuario.nombre || !nuevoUsuario.correo || !nuevoUsuario.perfil) {
      alert("Todos los campos excepto la contraseña son obligatorios.");
      return;
    }

    try {
      let res, data;

      if (editandoId) {
        if (!esAdmin()) {
          alert("Solo los administradores pueden actualizar usuarios.");
          return;
        }

        if (!nuevoUsuario.contraseña) {
          delete nuevoUsuario.contraseña;
        }

        res = await fetch(`${API_URL}/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario)
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario)
        });
      }

      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la operación");

      alert(editandoId ? "Usuario actualizado" : "Usuario creado");

      form.reset();
      tituloFormulario.textContent = "Actualizar o Crear Usuario";
      btnSubmit.textContent = "Guardar";
      editandoId = null;
      cargarUsuarios();

    } catch (error) {
      console.error("Error al guardar usuario:", error.message);
      alert("Ocurrió un error al guardar el usuario.");
    }
  });

  cargarUsuarios();
});
