import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Response interceptor for centralized error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Log error for debugging
    console.error("API Error:", {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    // Return a standardized error object
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

/**
 * Creates an authenticated axios request with automatic token injection
 * @param {Function} getToken - Clerk's getToken function
 * @param {string} method - HTTP method (get, post, patch, delete, etc.)
 * @param {string} url - API endpoint
 * @param {object} data - Request payload (optional)
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise} Axios response
 */
export const makeAuthenticatedRequest = async (
  getToken,
  method,
  url,
  data = null,
  config = {}
) => {
  const token = await getToken();

  const requestConfig = {
    ...config,
    headers: {
      Authorization: token,
      ...config.headers,
    },
    // withCredentials is already set in axiosClient config, no need to repeat
  };

  switch (method.toLowerCase()) {
    case "get":
      return axiosClient.get(url, requestConfig);
    case "post":
      return axiosClient.post(url, data, requestConfig);
    case "patch":
      return axiosClient.patch(url, data, requestConfig);
    case "put":
      return axiosClient.put(url, data, requestConfig);
    case "delete":
      return axiosClient.delete(url, requestConfig);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};

export default axiosClient;
