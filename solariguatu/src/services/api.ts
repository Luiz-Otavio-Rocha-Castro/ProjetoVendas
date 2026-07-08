import axios from 'axios';


export const api = axios.create({
  // Tenta usar a URL da variável de ambiente, se não achar (como rodando local), usa o localhost
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Garante que o objeto de headers existe e contorna restrições estritas de tipagem do TS
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de resposta para lidar com Token Expirado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o backend retornar 401 (Não Autorizado) ou 403 (Proibido), o token expirou ou é inválido
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Remove o token vencido
      localStorage.removeItem('token');
      sessionStorage.removeItem('solariguatu_auth');
      
      // Só redireciona se não estiver já na tela de login, para evitar loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);