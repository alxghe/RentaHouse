const BASE_URL = "http://localhost:3000/api";
let token = localStorage.getItem("token") || null;

// Carga componentes HTML
function loadPartial(containerId, path) {
  return fetch(path)
    .then(response => response.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
    });
}

// Sistema de peticiones
function request(path, method = "GET", data = null) {
  const opts = { 
    method, 
    headers: {} 
  };

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data instanceof FormData) {
    opts.body = data;
  } else if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  return fetch(`${BASE_URL}${path}`, opts)
    .then(response => response.json());
}

// Exportar al ámbito global
window.utils = {
  loadPartial,
  request
};