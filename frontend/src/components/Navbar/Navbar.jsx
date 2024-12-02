import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../utils/auth'; // Adjust path as needed
import './Navbar.css'; // Keep styling if required

function Navbar({ loggedIn, isAdmin, onLogout }) {
    const location = useLocation();

    // Don't render the navbar on the login page
    if (location.pathname === '/') {
        return null;
    }

    const handleLogout = () => {
        if (onLogout) {
            onLogout(); // Call the parent logout handler
        }
        logout(); // Perform logout
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <ul className="navbar-menu">
                    <li><Link to="/">Home</Link></li>
                    {loggedIn && (
                        <>
                            <li><Link to="/league">Leagues</Link></li>
                            <li><Link to="/draft">Draft</Link></li>
                            <li><Link to="/profileSettings">Profile Settings</Link></li>
                            {/* Only render Admin Panel if isAdmin is true */}

                            {Boolean(isAdmin) && (
                            <li><Link to="/admin">Admin Panel</Link></li>
                        )}

                        </>
                    )}
                </ul>
                {loggedIn && (
                    <div className="logout-container">
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
