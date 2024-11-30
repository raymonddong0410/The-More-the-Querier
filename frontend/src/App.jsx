import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import AboutPage from './routes/AboutPage';
import DashboardPage from './routes/DashboardPage';
import Navbar from './components/Navbar';
import { isLoggedIn } from './utils/auth';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user is logged in
        setLoggedIn(isLoggedIn());
    }, []);

    return (
        <Router>
            <Navbar loggedIn={loggedIn} />
            <Routes>
                <Route path="/" element={<AuthRoutes onLogin={() => setLoggedIn(true)} />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
