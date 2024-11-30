import axios from 'axios';

// Set base URL for axios
// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';
axios.defaults.withCredentials = true; // Include cookies with requests

// Check if user is logged in
export async function isLoggedIn() {
    try {
        const response = await axios.get('/validate'); // Call the validate route
        return response.status === 200; // User is logged in
    } catch (error) {
        console.error('Validation error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            // Try to refresh the token if it expired
            try {
                await axios.post('/refresh');
                return true; // Successfully refreshed
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                return false; // Refresh failed
            }
        }
        return false; // Not logged in
    }
}

// Logout user
export async function logout() {
    try {
        await axios.post('/logout'); // Clear cookies on the backend
    } catch (error) {
        console.error('Error during logout:', error);
    }
    window.location.href = '/'; // Redirect to login page
}

// // Axios interceptor for automatic token refresh
// axios.interceptors.response.use(
//     (response) => response, // Pass through successful responses
//     async (error) => {
//         if (error.response?.status === 401 && !error.config.__isRetry) {
//             error.config.__isRetry = true; // Prevent infinite loops
//             try {
//                 await axios.post('/refresh'); // Refresh token
//                 return axios(error.config); // Retry the original request
//             } catch (refreshError) {
//                 console.error('Token refresh failed:', refreshError);
//                 logout(); // Force logout on failure
//             }
//         }
//         return Promise.reject(error);
//     }
// );
