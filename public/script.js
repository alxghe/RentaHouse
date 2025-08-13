const API = "http://localhost:3000/api";
const BASE_URL = "http://localhost:3000";
let token = localStorage.getItem("token") || null;


// Referencias DOM
const tokenInfo = document.getElementById("tokenInfo");
const formProp = document.getElementById("form-prop");
const btnLogout = document.getElementById("btn-logout");
const formLogin = document.getElementById("form-login");

// ====== Guardar y actualizar token ======
function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("token", newToken);
    tokenInfo.textContent = "Token: " + newToken;
    tokenInfo.classList.remove("hidden");
    btnLogout.classList.remove("hidden");
  } else {
    localStorage.removeItem("token");
    tokenInfo.textContent = "";
    tokenInfo.classList.add("hidden");
    btnLogout.classList.add("hidden");
  }
}

// ====== Función genérica de peticiones ======
async function request(path, method = "GET", data = null) {
  const opts = { method, headers: {} };

  if (!(data instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    if (data) opts.body = JSON.stringify(data);
  } else {
    opts.body = data;
  }

  if (token) opts.headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      errorData.error ||
      `Error ${res.status}: ${res.statusText}`
    );
  }
  return await res.json();
}

// ====== Obtener ID de usuario desde el token ======
function getUserId() {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
}
// ====== REGISTRO ======
const formRegister = document.getElementById("form-register");

if (formRegister) {
  formRegister.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = this.nombre.value;
    const email = this.email.value;
    const password = this.password.value;

    try {
      const res = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        formRegister.reset();
      } else {
        alert(data.error || "Error al registrarse");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      alert("Error de conexión con el servidor");
    }
  });
}

// ====== LOGIN ======
if (formLogin) {
  formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;

    try {
      const res = await fetch(`${API}/users/login`, {    
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        alert("Sesión iniciada correctamente");
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      alert("Error de conexión con el servidor");
    }
  });
}

// ====== LOGOUT ======
btnLogout.addEventListener("click", () => {
  setToken(null);
  alert("Sesión cerrada");
});

// ====== Publicar Propiedad ======
formProp.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = formProp.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Publicando...";
    const formData = new FormData(formProp);

    const result = await request("/propiedades", "POST", formData);
    formProp.reset();
    document.getElementById('preview-container').innerHTML = '';
    cargarPropiedades();
    alert(`✅ Propiedad publicada con ID: ${result.id}`);
  } catch (err) {
    alert(`❌ ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// ====== Cargar Propiedades ======
async function cargarPropiedades() {
  const cont = document.getElementById("props");
  cont.innerHTML = "<p>Cargando propiedades...</p>";
  try {
    const lista = await request("/propiedades");
    cont.innerHTML = "";
    if (lista.length === 0) {
      cont.innerHTML = "<p>No hay propiedades disponibles</p>";
      return;
    }
    lista.forEach(p => {
      const imagesHTML = p.imagen_url
        ? `<img src="${BASE_URL}${p.imagen_url}" alt="${p.titulo}" class="property-img">`
        : "";
      cont.insertAdjacentHTML("beforeend", `
        <div class="card">
          <h3>${p.titulo}</h3>
          <p><strong>$${p.precio?.toLocaleString() || '0'}</strong> — ${p.tipo || 'Sin tipo'}</p>
          ${imagesHTML}
          <p>${p.descripcion || ""}</p>
          <small>${new Date(p.fecha_publicacion).toLocaleDateString()}</small>
        </div>
      `);
    });
  } catch (err) {
    cont.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// ====== Favoritos ======
document.getElementById("form-fav").addEventListener("submit", async e => {
  e.preventDefault();
  const usuario_id = getUserId();
  if (!usuario_id) return alert('Debes iniciar sesión para añadir favoritos');
  const propiedad_id = e.target.propiedad_id.value;
  await request("/favoritos", "POST", { propiedad_id, usuario_id });
  alert("Añadido a favoritos correctamente");
});

// ====== Reseñas ======
document.getElementById("form-resena").addEventListener("submit", async e => {
  e.preventDefault();
  const userId = getUserId();
  const data = {
    propiedad_id: e.target.propiedad_id.value,
    user_id: userId,
    comentario: e.target.comentario.value,
    calificacion: parseInt(e.target.puntuacion.value)
  };
  await request("/resenas", "POST", data);
  alert("Reseña publicada");
  e.target.reset();
});

// ====== Mensajes ======
document.getElementById("form-mensaje").addEventListener("submit", async e => {
  e.preventDefault();
  const emisorId = getUserId();
  const data = {
    emisor_id: emisorId,
    receptor_id: e.target.destinatario_id.value,
    contenido: e.target.contenido.value
  };
  await request("/mensajes", "POST", data);
  alert("Mensaje enviado");
  e.target.reset();
});
