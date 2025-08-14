// Función para inicializar el mapa
function initPropertyMap() {
  const defaultLat = 19.4326;
  const defaultLng = -99.1332;

  // Verificar si Leaflet está cargado
  if (typeof L === 'undefined') {
    console.error('Leaflet no está cargado');
    return;
  }

  // Crear mapa
  const map = L.map('map').setView([defaultLat, defaultLng], 13);
  
  // Añadir capa de tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Añadir marcador
  const marker = L.marker([defaultLat, defaultLng], {
    draggable: true
  }).addTo(map);

  // Actualizar campos ocultos
  function updateCoords(lat, lng) {
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
  }

  // Eventos
  marker.on('dragend', function(e) {
    updateCoords(e.target.getLatLng().lat, e.target.getLatLng().lng);
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updateCoords(e.latlng.lat, e.latlng.lng);
  });

  // Valores iniciales
  updateCoords(defaultLat, defaultLng);
}

// Función para crear propiedad
async function createProperty(formData) {
  const token = localStorage.getItem('token') || '';
  
  const response = await fetch('http://localhost:3000/api/propiedades', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear propiedad');
  }

  return response.json();
}

// Exportar al ámbito global
window.initPropertyMap = initPropertyMap;
window.createProperty = createProperty;