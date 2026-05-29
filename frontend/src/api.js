import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust if necessary for production
  withCredentials: true, // ensure HttpOnly cookies are sent
});

export default api;
