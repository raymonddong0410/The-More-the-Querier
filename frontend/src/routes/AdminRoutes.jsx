import React from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import ManageUsers from './ManageUsers';
import ManageLeagues from './ManageLeagues';
import ManagePlayers from './ManagePlayers';
import ManageMatches from './ManageMatches';
import ManageUserRoles from '../routes/ManageUserRoles';


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
                    <li><Link to="/admin/manage-roles">Manage User Roles</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-leagues" element={<ManageLeagues />} />
                <Route path="manage-players" element={<ManagePlayers />} />
                <Route path="manage-matches" element={<ManageMatches />} />
                <Route path="manage-roles" element={<ManageUserRoles />} />
            </Routes>
        </div>
    );
}

export default AdminRoutes;
