export function isLoggedIn() {
    // Example: Check localStorage for a token
    return localStorage.getItem('authToken') !== null;
}

export function logout() {
    localStorage.removeItem('authToken');
}
