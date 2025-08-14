import { request, BASE_URL } from './utils.js';

/**
 * Obtiene la lista de propiedades favoritas del usuario
 */
export async function getFavorites() {
  try {
    return await request('/favoritos');
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
}

/**
 * Añade una propiedad a favoritos
 * @param {number} propertyId - ID de la propiedad
 */
export async function addFavorite(propertyId) {
  try {
    const response = await request('/favoritos', 'POST', { propiedad_id: propertyId });
    return response;
  } catch (error) {
    console.error("Error al añadir favorito:", error);
    throw error;
  }
}

/**
 * Elimina una propiedad de favoritos
 * @param {number} favoriteId - ID del favorito
 */
export async function removeFavorite(favoriteId) {
  try {
    await request(`/favoritos/${favoriteId}`, 'DELETE');
    return true;
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return false;
  }
}

/**
 * Renderiza la lista de favoritos en el DOM
 * @param {HTMLElement} container - Contenedor donde se mostrarán los favoritos
 */
export async function renderFavorites(container) {
  container.innerHTML = '<p>Cargando favoritos...</p>';
  
  const favorites = await getFavorites();
  
  if (favorites.length === 0) {
    container.innerHTML = '<p>No tienes propiedades favoritas</p>';
    return;
  }

  container.innerHTML = '';
  favorites.forEach(fav => {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    card.innerHTML = `
      <img src="${BASE_URL}${fav.propiedad.imagen_url || '/img/placeholder.jpg'}" alt="${fav.propiedad.titulo}">
      <h3>${fav.propiedad.titulo}</h3>
      <p>${fav.propiedad.ciudad} - $${fav.propiedad.precio}</p>
      <button class="remove-favorite" data-id="${fav.id}">Eliminar</button>
      <a href="/properties/detail.html?id=${fav.propiedad.id}" class="btn-detail">Ver detalles</a>
    `;
    container.appendChild(card);
  });

  // Event listeners para botones de eliminar
  document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await removeFavorite(btn.dataset.id)) {
        btn.closest('.favorite-card').remove();
      }
    });
  });
}