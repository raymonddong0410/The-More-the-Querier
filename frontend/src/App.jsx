import React from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import AuthPage from './AuthPage'

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
// axios.defaults.baseURL = 'http://localhost:3000/backend';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage />} />
            </Routes>
        </Router>
    );
}

export default App;
