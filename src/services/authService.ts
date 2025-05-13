import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086/v1';

export interface User {
  username: string;
  password: string;
}

export interface AuthResponse {
  userProfile: {
    name: string;
    lastLogin?: string;
  };
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle CORS preflight
api.interceptors.request.use((config) => {
  // Add X-Request-ID header
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

export const authService = {
  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/login', {
      username,
      password
    });
    return response.data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/login', {
      username,
      password
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  }
}; 