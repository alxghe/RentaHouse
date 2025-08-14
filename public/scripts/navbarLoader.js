// Función para cargar la barra de navegación
function loadNavbar(containerId) {
  return fetch('../partials/navbar.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar la navbar');
      }
      return response.text();
    })
    .then(html => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
      } else {
        console.error(`Contenedor ${containerId} no encontrado`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Exportar al ámbito global
window.loadNavbar = loadNavbar;