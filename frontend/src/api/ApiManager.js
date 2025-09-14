import axios, { HttpStatusCode } from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS',
  },
});

// Function to handle response
function handleResponse(response) {
  return {
    data: response.data,
    status: response.status,
  };
}

// Function to handle error
async function handleError(error) {
  const originalRequest = error.config;

  if (error.response?.status === HttpStatusCode.Unauthorized) {
    if (originalRequest.url.includes('/auth')) {
      console.log('Auth request failed: Logging out user.');
      localStorage.removeItem('token');
      localStorage.removeItem('rf_token');
      // Handle logout, e.g., redirect to login
      window.location.href = '/login'; // Adjust as needed
      return Promise.reject(error);
    } else {
      // For other 401 errors, reject the error
      return Promise.reject(error);
    }
  }

  // If not an Unauthorized error, reject the error
  return Promise.reject(error);
}

// API POST request
export const apiPost = async ({ path, requestBody, headers = {} }) => {
  const token = localStorage.getItem('token');

  return http
    .post(path, requestBody, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers, // Override or add custom headers
      },
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};

// API GET request
export const apiGet = async ({ path, headers = {} }) => {
  const token = localStorage.getItem('token');

  return http
    .get(path, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers,
      },
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};

// API PATCH request
export const apiPatch = async ({ path, requestBody, headers = {} }) => {
  const token = localStorage.getItem('token');

  return http
    .patch(path, requestBody, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers,
      },
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};

// API PUT request
export const apiPut = async ({ path, requestBody, headers = {} }) => {
  const token = localStorage.getItem('token');

  return http
    .put(path, requestBody, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers,
      },
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};

// API DELETE request
export const apiDelete = async ({ path, requestBody, headers = {} }) => {
  const token = localStorage.getItem('token');

  return http
    .delete(path, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers,
      },
      data: requestBody, // Axios supports sending a body with DELETE
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};

// Image upload POST method
export const uploadImage = async (formData) => {
  const token = localStorage.getItem('token');

  return http
    .post('/upload/image', formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data', // Let axios set it
      },
    })
    .then((response) => handleResponse(response))
    .catch((err) => handleError(err));
};