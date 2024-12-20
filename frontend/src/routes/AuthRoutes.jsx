import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';

function AuthRoutes({ onLogin, loggedIn }) {
    const [showRegister, setShowRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');

    if (loggedIn) {
        // Redirect logged-in users to the homepage
        return <Navigate to="/home" />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/login', { username, password });
            console.log('Login successful');
            const userResponse = await axios.get('/validate'); // Fetch updated user data
            onLogin({
                loggedIn: true,
                isAdmin: userResponse.data.user.isAdmin, // Pass isAdmin
            });
        } catch (error) {
            console.error('Login error:', error);
        }
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/register', { username, password, fullname, email });
            console.log('Registration successful');
            const userResponse = await axios.get('/validate'); // Fetch updated user data
            onLogin({
                loggedIn: true,
                isAdmin: userResponse.data.user.isAdmin, // Pass isAdmin
            });
        } catch (error) {
            console.error('Registration error:', error);
        }
    };
    

    return (
        <div className="AuthRoutes">
            {showRegister ? (
                <form onSubmit={handleRegister}>
                    <h2 className="text-white">Register</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Fullname"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Register</button>
                    <button type="button" onClick={() => setShowRegister(false)}>
                        Back to Login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <h2 className="league-header">Welcome to The More the Querier Fantasy Sports!</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    <button type="button" onClick={() => setShowRegister(true)}>
                        Create an Account
                    </button>
                </form>
            )}
        </div>
    );
}

export default AuthRoutes;
