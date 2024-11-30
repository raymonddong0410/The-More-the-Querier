import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ loggedIn, children }) {
    if (!loggedIn) {
        // Redirect unauthenticated users to login
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;