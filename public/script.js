const API = "/api";
let token = localStorage.getItem("token") || null;

/* ========== Helpers ========== */
async function request(path, method = "GET", data = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (data) opts.body = JSON.stringify(data);
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json();
}

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

/* ========== Registro ========== */
document.getElementById("form-register").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await request("/users/register", "POST", data);
    alert("Registro exitoso ✔");
    e.target.reset();
  } catch (err) { alert("Error: " + err.message); }
});

/* ========== Login ========== */
const tokenInfo = document.getElementById("tokenInfo");
const formProp  = document.getElementById("form-prop");
const btnLogout = document.getElementById("btn-logout");

function onLoginSuccess() {
  tokenInfo.textContent = "Token activo (guardado en localStorage)";
  show(tokenInfo); show(formProp); show(btnLogout);
  cargarPropiedades();
}

if (token) onLoginSuccess(); // token ya persistía

document.getElementById("form-login").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const res = await request("/users/login", "POST", data);
    token = res.token;
    localStorage.setItem("token", token);
    alert("Login correcto ✔");
    onLoginSuccess();
    e.target.reset();
  } catch (err) { alert("Error: " + err.message); }
});

/* ========== Logout ========== */
btnLogout.addEventListener("click", () => {
  token = null;
  localStorage.removeItem("token");
  hide(tokenInfo); hide(formProp); hide(btnLogout);
  alert("Sesión cerrada");
});

/* ========== Publicar propiedad ========== */
formProp.addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  // backend completará usuario_id, estado_disponibilidad y fecha_publicacion
  try {
    await request("/propiedades", "POST", data);
    alert("Propiedad publicada ✔");
    e.target.reset();
    cargarPropiedades();
  } catch (err) { alert("Error: " + err.message); }
});

/* ========== Listar propiedades ========== */
async function cargarPropiedades() {
  try {
    const lista = await request("/propiedades");
    const cont = document.getElementById("props");
    cont.innerHTML = "";
    lista.forEach(p => {
      cont.insertAdjacentHTML(
        "beforeend",
        `<div class="card">
           <h3>${p.titulo}</h3>
           <p><strong>$${p.precio}</strong> — ${p.tipo}</p>
           <p>${p.descripcion || ""}</p>
         </div>`
      );
    });
  } catch (err) { console.error(err); }
}
cargarPropiedades();
