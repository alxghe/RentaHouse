// auth.js - Manejo completo de autenticación

// Función para guardar/eliminar el token
function setToken(token) {
  if (token) {
    localStorage.setItem('rentahouse_token', token);
    // Mostrar botón de logout y ocultar info de token si existe
    document.getElementById('btn-logout')?.classList.remove('hidden');
    document.getElementById('tokenInfo')?.classList.add('hidden');
  } else {
    localStorage.removeItem('rentahouse_token');
    document.getElementById('btn-logout')?.classList.add('hidden');
  }
}

// Función para obtener el token
function getToken() {
  return localStorage.getItem('rentahouse_token');
}

// Función para mostrar errores
function showError(message) {
  const errorElement = document.createElement('p');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Insertar después del formulario
  const form = document.getElementById('form-login');
  form.insertAdjacentElement('afterend', errorElement);
  
  // Eliminar después de 5 segundos
  setTimeout(() => errorElement.remove(), 5000);
}

// Función para manejar el login
async function handleLogin(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Evento cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si ya está autenticado
  if (getToken()) {
    window.location.href = '../index.html';
    return;
  }

  // Manejar el formulario de login
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const submitButton = loginForm.querySelector('button');
      const originalText = submitButton.textContent;

      // Mostrar estado de carga
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Iniciando sesión...';

      try {
        const token = await handleLogin(email, password);
        setToken(token);
        
        // Redirigir a index.html después de login exitoso
        window.location.href = '../index.html';
        
      } catch (error) {
        showError(error.message);
      } finally {
        // Restaurar el botón
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  // Manejar logout
  const logoutButton = document.getElementById('btn-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      setToken(null);
      window.location.href = 'login.html';
    });
  }
});