// Funciones específicas de mensajes
export async function sendMessage(receiverId, content) {
  return await request('/mensajes', 'POST', {
    receptor_id: receiverId,
    contenido: content
  });
}

export async function getConversations() {
  return await request('/mensajes/conversaciones');
}

export async function getMessages(userId) {
  return await request(`/mensajes?user_id=${userId}`);
}