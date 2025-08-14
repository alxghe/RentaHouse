import { request } from './utils.js';

/**
 * Obtiene reseñas de una propiedad
 * @param {number} propertyId - ID de la propiedad
 */
export async function getPropertyReviews(propertyId) {
  try {
    return await request(`/resenas?propiedad_id=${propertyId}`);
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    return [];
  }
}

/**
 * Envía una nueva reseña
 * @param {object} reviewData - Datos de la reseña
 * @param {number} reviewData.propiedad_id - ID de la propiedad
 * @param {string} reviewData.comentario - Texto del comentario
 * @param {number} reviewData.calificacion - Puntuación (1-5)
 */
export async function submitReview(reviewData) {
  try {
    return await request('/resenas', 'POST', reviewData);
  } catch (error) {
    console.error("Error al enviar reseña:", error);
    throw error;
  }
}

/**
 * Renderiza las reseñas en el DOM
 * @param {HTMLElement} container - Contenedor donde se mostrarán las reseñas
 * @param {Array} reviews - Lista de reseñas
 */
export function renderReviews(container, reviews) {
  if (reviews.length === 0) {
    container.innerHTML = '<p>No hay reseñas todavía. ¡Sé el primero en opinar!</p>';
    return;
  }

  container.innerHTML = '';
  reviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-card';
    reviewElement.innerHTML = `
      <div class="review-header">
        <span class="review-author">${review.usuario.nombre}</span>
        <span class="review-rating">${'★'.repeat(review.calificacion)}</span>
      </div>
      <div class="review-date">${new Date(review.fecha).toLocaleDateString()}</div>
      <p class="review-content">${review.comentario}</p>
    `;
    container.appendChild(reviewElement);
  });
}