import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageMatches() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('/admin/');
                setTeams(response.data);
            } catch (error) {
                console.error('Error fetching teams', error);
                alert('Failed to fetch teams');
            }
        };
    })
}

export default ManageMatches;