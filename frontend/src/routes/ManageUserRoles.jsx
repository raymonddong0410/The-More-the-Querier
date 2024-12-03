import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUserRoles() {
    const [users, setUsers] = useState([]);
    const [roleChange, setRoleChange] = useState(false);

    useEffect(() => {
        setRoleChange(false);
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/admin/users'); // Fetch all users
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [roleChange]);

    const handleGrantRole = async (username, role) => {
        try {
            await axios.post('/admin/grant', { username, role });
            alert(`Granted ${role} privileges to ${username}`);
            setRoleChange(true);
        } catch (error) {
            console.error('Error granting privileges:', error);
            alert('Failed to grant privileges');
        }
    };

    const handleRevokeRole = async (username, role) => {
        try {
            await axios.post('/admin/revoke', { username, role });
            alert(`Revoked ${role} privileges from ${username}`);
            setRoleChange(true);
        } catch (error) {
            console.error('Error revoking privileges:', error);
            alert('Failed to revoke privileges');
        }
    };

    return (
        <div>
            <h2 className="text-white">Manage User Roles</h2>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userID}>
                            <td>{user.userID}</td>
                            <td>{user.username}</td>
                            <td>{user.isAdmin ? 'Admin' : 'Non-Admin'}</td>
                            <td>
                                {user.isAdmin ? (
                                    <button onClick={() => handleRevokeRole(user.username, 'admin')}>
                                        Revoke Admin
                                    </button>
                                ) : (
                                    <button onClick={() => handleGrantRole(user.username, 'admin')}>
                                        Grant Admin
                                    </button>
                                )}
                                {!user.isAdmin && (
                                    <button onClick={() => handleGrantRole(user.username, 'non-admin')}>
                                        Grant Non-Admin
                                    </button>
                                )}
                                {!user.isAdmin && (
                                    <button onClick={() => handleRevokeRole(user.username, 'non-admin')}>
                                        Revoke Non-Admin
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageUserRoles;
