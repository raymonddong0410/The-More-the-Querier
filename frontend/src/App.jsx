import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import AboutPage from './routes/AboutPage';
import HomePage from './routes/HomePage';
import DashboardPage from './routes/DashboardPage';
import Navbar from './components/Navbar';
import { isLoggedIn, logout } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Prevent flickering during login check

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const status = await isLoggedIn();
                setLoggedIn(status);
            } catch (error) {
                console.error('Error checking login status:', error);
                setLoggedIn(false); // Ensure loggedIn is false on error
            } finally {
                setLoading(false); // Stop loading state
            }
        }

        // Check login status on app load
        checkLoginStatus();
    }, []);

    // Logout handler for Navbar
    const handleLogout = async () => {
        try {
            await logout(); // Clear tokens and perform logout
            setLoggedIn(false); // Update state after logout
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) {
        // Show a loading state while checking login status
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar loggedIn={loggedIn} onLogout={handleLogout} />
            <Routes>
                    <Route path="/" element={<AuthRoutes onLogin={() => setLoggedIn(true)} loggedIn={loggedIn}/>} />
                    
                        <Route path="/about" element={<AboutPage />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute loggedIn={loggedIn}>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                         <Route
                            path="/home"
                            element={
                                <ProtectedRoute loggedIn={loggedIn}>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />
                {/* Fallback route */}
                <Route path="*" element={<div>404 - Page not found</div>} />
            </Routes>
        </>
    );
}

export default App;
