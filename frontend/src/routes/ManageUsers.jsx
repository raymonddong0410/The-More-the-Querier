import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [banChange, setBanChange] = useState(false)

    useEffect(() => {
        setBanChange(false);
        async function fetchUsers() {
            try {
                const response = await axios.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
        fetchUsers();
    }, [banChange]);

    const handleBanUser = async (userID) => {
        try {
            await axios.post('/admin/banUser', { userID });
            setBanChange(true);
            // setUsers(users.filter(user => user.userID !== userID));
        } catch (error) {
            console.error('Error banning user:', error);
        }
    };

    const handleUnbanUser = async (userID) => {
        try {
            await axios.post('/admin/unbanUser', {userID});
            setBanChange(true);
        } catch (error) {
            console.error('Error unbanning user:', error);
        }
    }

    return (
        <div>
            <h2>Manage Users</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h3>Unbanned Users</h3>
                <ul>
                    {users
                        .filter(user => !user.isBanned && !user.isAdmin) // Only unbanned, non-admin users
                        .map(user => (
                            <li key={user.userID}>
                                {user.username} - Active
                                <button onClick={() => handleBanUser(user.userID)}>Ban</button>
                            </li>
                        ))}
                </ul>
            </div>

            <div style={{ flex: 1 }}>
                <h3>Banned Users</h3>
                <ul>
                    {users
                        .filter(user => user.isBanned && !user.isAdmin) // Only banned, non-admin users
                        .map(user => (
                            <li key={user.userID}>
                                {user.username} - Banned
                                <button onClick={() => handleUnbanUser(user.userID)}>Unban</button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
        </div>
    );
}

export default ManageUsers;
