// services/api.js - Updated with authentication support

import axios from 'axios';
import { getToken, removeToken } from './authUtils';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      removeToken();
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

// Error handler
const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(error.response.data.detail || 'An error occurred');
  } else if (error.request) {
    throw new Error('No response from server');
  } else {
    throw new Error('Request failed');
  }
};

// Games API
export const gamesApi = {
  getAll: async () => {
    try {
      return await api.get('/games');
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/games/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data) => {
    try {
      return await api.post('/games', data);
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/games/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
};

// Scheduled Games API
export const scheduledGamesApi = {
  getAll: async () => {
    try {
      return await api.get('/scheduled-games');
    } catch (error) {
      handleError(error);
    }
  },
  
  getActive: async () => {
    try {
      return await api.get('/scheduled-games/active');
    } catch (error) {
      handleError(error);
    }
  },
  
  getOpenRegistration: async () => {
    try {
      return await api.get('/scheduled-games/open-registration');
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/scheduled-games/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data) => {
    try {
      return await api.post('/scheduled-games', data);
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (id, data) => {
    try {
      return await api.patch(`/scheduled-games/${id}`, data);
    } catch (error) {
      handleError(error);
    }
  },
  
  toggleActivation: async (id) => {
    try {
      return await api.patch(`/scheduled-games/${id}/activate`);
    } catch (error) {
      handleError(error);
    }
  },
  
  toggleRegistration: async (id) => {
    try {
      return await api.patch(`/scheduled-games/${id}/registration`);
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/scheduled-games/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
};

// Team Registrations API
export const teamRegistrationsApi = {
  getByGameId: async (scheduledGameId) => {
    try {
      return await api.get(`/team-registrations/${scheduledGameId}`);
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data) => {
    try {
      return await api.post('/team-registrations', data);
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/team-registrations/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
};

// Individual Registrations API
export const individualRegistrationsApi = {
  getByGameId: async (scheduledGameId) => {
    try {
      return await api.get(`/individual-registrations/${scheduledGameId}`);
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data) => {
    try {
      return await api.post('/individual-registrations', data);
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/individual-registrations/${id}`);
    } catch (error) {
      handleError(error);
    }
  },
};

// Add to your existing api.js file

export const leagueApi = {
  create: (data) => axios.post(`${API_URL}/scheduled-games/league`, data),
  getMatches: (gameId) => axios.get(`${API_URL}/scheduled-games/league/${gameId}`),
  getMatchesByStage: (stage) => axios.get(`${API_URL}/scheduled-games/league/stage/${stage}`)
};

export const teamsApi = {
  ...teamRegistrationsApi, // Keep existing functions
  getAllForGame: (gameId) => axios.get(`${API_URL}/team-registrations/all/${gameId}`)
};

export default api;