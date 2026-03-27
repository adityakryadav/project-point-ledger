import axios from 'axios';

// Central place to configure axios (base URL, headers, interceptors, etc).
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

