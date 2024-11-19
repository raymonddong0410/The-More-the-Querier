import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

function App() {
    const [count, setCount] = useState(0);
    const [showRegister, setShowRegister] = useState(false); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/register', { username, password });
            console.log(response.data); // Handle successful registration (e.g., show a success message)
        } catch (error) {
            console.error(error); // Handle registration error (e.g., display error message)
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', { username, password });
            console.log(response.data); // Handle successful login (e.g., store token, redirect)
        } catch (error) {
            console.error(error); // Handle login error (e.g., display error message)
        }
    };

    return (
        <div className="App">
            <h1>Vite + React</h1>

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

            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </div>
        </div>
    );
}

export default App;