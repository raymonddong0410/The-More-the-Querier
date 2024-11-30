import React, { useState } from 'react';
import axios from 'axios';

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';

export default function AuthPage() {
    const [showRegister, setShowRegister] = useState(false); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/register', { username, password });
            console.log('Registration successful:', response.data); // Handle successful registration
        } catch (error) {
            console.error('Registration error:', error); // Handle registration error
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', { username, password });
            console.log('Login successful:', response.data); // Handle successful login
        } catch (error) {
            console.error('Login error:', error); // Handle login error
        }
    };

    return (
        <div className="App">
            <h1>My Application</h1>

            {showRegister ? (
                <form onSubmit={handleRegister}>
                    <h2>Register</h2>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Register</button>
                    <button type="button" onClick={() => setShowRegister(false)}>
                        Already have an account? Login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Login</button>
                    <button type="button" onClick={() => setShowRegister(true)}>
                        Create an account
                    </button>
                </form>
            )}
        </div>
    );
}