import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../utils/auth';
import './Navbar.css';

function Navbar({ loggedIn }) {
    const location = useLocation();

    // Don't render the navbar on the login page
    if (location.pathname === '/') {
        return null;
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <ul className="navbar-menu">
                    <li><Link to="/">Home</Link></li>
                    {loggedIn && (
                        <>
                            <li><Link to="/leagues">Leagues</Link></li>
                            <li><Link to="/draft">Draft</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            
                            
                        </>
                    )}
                </ul>
                {loggedIn && (
                   <div className="logout-container">
                   <Link to="/about" className="about-us-link">About Us</Link>
                   <button className="logout-button" onClick={handleLogout}>Logout</button>
               </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
