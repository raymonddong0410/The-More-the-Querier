import React from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import ManageUsers from './ManageUsers';
import ManageLeagues from './ManageLeagues';
import ManagePlayers from './ManagePlayers';
import ManageMatches from './ManageMatches';

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
                    <li><Link to="/admin/manage-players">Manage Players</Link></li>
                    <li><Link to="/admin/manage-matches">Manage Matches</Link></li>
                </ul>
            </nav>
            <Routes>
                {/* Define the nested admin routes */}
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-leagues" element={<ManageLeagues />} />
                <Route path="manage-players" element={<ManagePlayers />} />
                <Route path="manage-matches" element={<ManageMatches />} />
            </Routes>
        </div>
    );
}

export default AdminRoutes;
