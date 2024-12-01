import React from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import ManageUsers from './ManageUsers';
import ManageLeagues from './ManageLeagues';

function AdminRoutes({ isAdmin }) {
    if (!isAdmin) {
        // Redirect non-admin users to the dashboard
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <h1>Admin Panel</h1>
            <nav>
                <ul>
                    <li><Link to="/admin/manage-users">Manage Users</Link></li>
                    <li><Link to="/admin/manage-leagues">Manage Leagues</Link></li>
                </ul>
            </nav>
            <Routes>
                {/* Define the nested admin routes */}
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-leagues" element={<ManageLeagues />} />
            </Routes>
        </div>
    );
}

export default AdminRoutes;
