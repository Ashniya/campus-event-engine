import axios from 'axios';

const api = axios.create({
  // Dynamically use the current domain/IP so it works both on localhost and AWS
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `http://${window.location.hostname}:5000/api`,
  withCredentials: true, // ensure HttpOnly cookies are sent
});

export default api;
