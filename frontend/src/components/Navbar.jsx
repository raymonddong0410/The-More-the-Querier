import React from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../utils/auth';

function Navbar({ loggedIn }) {
    const handleLogout = () => {
        logout();
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                {loggedIn ? (
                    <>
                        {/* Links for logged-in users */}
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                ) : (
                    <>
                        {/* Links for logged-out users */}
                        <li><Link to="/">Login</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;