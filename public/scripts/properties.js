// properties.js - Debe permanecer igual, pero asegúrate de que esté en /scripts/
import { request, BASE_URL } from './utils.js';  // Asegúrate que la ruta es correcta
/**
 * Obtiene propiedades con filtros opcionales
 */
export async function getProperties(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  try {
    return await request(`/propiedades?${query}`);
  } catch (error) {
    console.error("Error al obtener propiedades:", error);
    return [];
  }
}

/**
 * Publica una nueva propiedad
 */
export async function createProperty(formData) {
  try {
    return await request('/propiedades', 'POST', formData);
  } catch (error) {
    console.error("Error al crear propiedad:", error);
    throw error;
  }
}

/**
 * Renderiza las propiedades en el DOM
 */
export function renderProperties(container, properties) {
  if (properties.length === 0) {
    container.innerHTML = '<p>No se encontraron propiedades</p>';
    return;
  }

  container.innerHTML = '';
  properties.forEach(prop => {
    const propElement = document.createElement('div');
    propElement.className = 'property-card';
    propElement.innerHTML = `
      <img src="${BASE_URL}${prop.imagen_url || '/img/placeholder.jpg'}" alt="${prop.titulo}">
      <div class="property-info">
        <h3>${prop.titulo}</h3>
        <p class="property-price">$${prop.precio.toLocaleString()}</p>
        <p class="property-location">${prop.ciudad}, ${prop.direccion}</p>
        <p class="property-type">${prop.tipo}</p>
        <a href="/properties/detail.html?id=${prop.id}" class="btn-detail">Ver detalles</a>
      </div>
    `;
    container.appendChild(propElement);
  });
}

function initPropertyMap() {
  const defaultLat = 19.4326;
  const defaultLng = -99.1332;
  
  const map = L.map('map').setView([defaultLat, defaultLng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  const marker = L.marker([defaultLat, defaultLng], { 
    draggable: true 
  }).addTo(map);

  // Actualizar campos ocultos al mover marcador
  marker.on('dragend', function(e) {
    const { lat, lng } = e.target.getLatLng();
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
  });

  // Permitir selección por click
  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    document.getElementById('lat').value = e.latlng.lat;
    document.getElementById('lng').value = e.latlng.lng;
  });
}

// Exportar al ámbito global
window.initPropertyMap = initPropertyMap;