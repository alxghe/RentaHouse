const API = "http://localhost:3000/api";
const BASE_URL = "http://localhost:3000";
let token = localStorage.getItem("token") || null;

// Primero obtener todas las referencias DOM
const tokenInfo = document.getElementById("tokenInfo");
const formProp = document.getElementById("form-prop"); // ✅ Ahora está definido
const btnLogout = document.getElementById("btn-logout");

/* ========== Helpers Mejorados ========== */
async function request(path, method = "GET", data = null) {
  const opts = { method, headers: {} };

  if (!(data instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    if (data) opts.body = JSON.stringify(data);
  } else {
    opts.body = data;
  }

  if (token) opts.headers.Authorization = `Bearer ${token}`;

  try {
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
  } catch (err) {
    console.error("Error en la petición:", {
      path,
      method,
      error: err.message
    });
    throw err;
  }
}

/* ========== Publicar Propiedad (Versión Mejorada) ========== */
formProp.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = formProp.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Publicando...";
    
    // 1. Crear FormData con nombre de campo correcto
    const formData = new FormData(formProp);
    console.log("Datos a enviar:", {
      titulo: formData.get('titulo'),
      imagenes: formData.getAll('imagenes') // o 'imagen' según tu backend
    });

    // 2. Hacer la petición con timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${API}/propiedades`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);

    // 3. Manejar respuesta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error del servidor:", {
        status: response.status,
        data: errorData
      });
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    const result = await response.json();
    console.log("Respuesta exitosa:", result);
    
    formProp.reset();
    document.getElementById('preview-container').innerHTML = '';
    cargarPropiedades();
    alert(`✅ Propiedad publicada con ID: ${result.id}`);

  } catch (err) {
    console.error("Error completo:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    let errorMessage = "Error al publicar propiedad";
    if (err.name === "AbortError") {
      errorMessage = "La petición tardó demasiado (más de 15 segundos)";
    } else if (err.message.includes("500")) {
      errorMessage = "Error interno del servidor (revisa la consola del servidor)";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(`❌ ${errorMessage}`);
    
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

/* ========== Cargar Propiedades (Versión Mejorada) ========== */
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
    console.error("Error al cargar propiedades:", err);
    cont.innerHTML = `<p class="error">Error al cargar propiedades: ${err.message}</p>`;
  }
}