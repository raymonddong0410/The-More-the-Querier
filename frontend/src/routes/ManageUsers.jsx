import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
        fetchUsers();
    }, []);

    const handleBanUser = async (userID) => {
        try {
            await axios.post('/admin/banUser', { userID });
            setUsers(users.filter(user => user.userID !== userID));
        } catch (error) {
            console.error('Error banning user:', error);
        }
    };

    return (
        <div>
            <h2>Manage Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user.userID}>
                        {user.username} - {user.isAdmin ? 'Admin' : 'User'}
                        {!user.isAdmin && (
                            <button onClick={() => handleBanUser(user.userID)}>Ban</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ManageUsers;
