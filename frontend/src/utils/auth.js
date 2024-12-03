import axios from 'axios';

// Set base URL for axios
// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';
axios.defaults.withCredentials = true;

export async function isLoggedIn() {
    try {
        const response = await axios.get('/validate');
        if (response.status === 200) {
            return {
                loggedIn: true,
                isAdmin: response.data.user.isAdmin, // Include isAdmin
            };
        }
    } catch (error) {
        console.error('Validation error:', 
            (error.response && error.response.data) || error.message
        );
        if (error.response && error.response.status === 401) {
            try {
                await axios.post('/refresh');
                return true; // Successfully refreshed
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
            }
        }
        return { loggedIn: false, isAdmin: false };
    }
    return { loggedIn: false, isAdmin: false };
}

export async function logout() {
    try {
        await axios.post('/logout');
    } catch (error) {
        console.error('Error during logout:', error);
    }
    window.location.href = '/';
}
