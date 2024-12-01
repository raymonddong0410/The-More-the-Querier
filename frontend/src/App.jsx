import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import AboutPage from './routes/AboutPage';
import HomePage from './routes/HomePage';
import TeamPage from './routes/TeamPage';
import PlayerPage from './routes/PlayerPage';
import DashboardPage from './routes/DashboardPage';
import AdminRoutes from './routes/AdminRoutes';
import Navbar from './components/Navbar/Navbar';
import { isLoggedIn, logout } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';
import LeagueList from './routes/LeagueList';
import LeagueDetails from './routes/LeagueDetails';

function App() {
    const [authState, setAuthState] = useState({
        loggedIn: false,
        isAdmin: false,
        loading: true, // Prevent flickering during login check
    });

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const status = await isLoggedIn();
                setAuthState({ ...status, loading: false });
            } catch (error) {
                console.error('Error checking login status:', error);
                setAuthState({ loggedIn: false, isAdmin: false, loading: false });
            }
        }

        // Check login status on app load
        checkLoginStatus();
    }, []);

    // Logout handler for Navbar
    const handleLogout = async () => {
        try {
            await logout(); // Clear tokens and perform logout
            setAuthState({ loggedIn: false, isAdmin: false, loading: false });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (authState.loading) {
        // Show a loading state while checking login status
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar loggedIn={authState.loggedIn} isAdmin={authState.isAdmin} onLogout={handleLogout} />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<AuthRoutes onLogin={() => setAuthState({ ...authState, loggedIn: true })} />} />
                <Route path="/about" element={<AboutPage />} />

                {/* User-Specific Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/team/:teamID"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <TeamPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/:playerID"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <PlayerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/league"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <LeagueList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/league/:id"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <LeagueDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Admin-Specific Routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute loggedIn={authState.loggedIn}>
                            <AdminRoutes isAdmin={authState.isAdmin} />
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
