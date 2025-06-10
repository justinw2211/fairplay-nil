import axios from 'axios';

// Create a configured instance of axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sends the FMV calculation payload to the backend.
 * @param {object} payload - The complete form data.
 * @returns {Promise} - The axios promise for the request.
 */
export const calculateFmv = (payload) => {
  return apiClient.post('/api/fmv/calculate', payload);
};

// You can add other API functions here later, like:
// export const submitFmv = (payload) => apiClient.post('/api/fmv/submit', payload);
