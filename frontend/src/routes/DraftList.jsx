import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DraftList() {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        const fetchJoinedDrafts = async () => {
            try {
                const response = await axios.get('/draft/user/joined');
                setDrafts(response.data);
            } catch (error) {
                console.error('Error fetching joined drafts:', error);
            }
        };

        fetchJoinedDrafts();
    }, []);

    return (
        <div>
            <h1>Your Drafts</h1>
            <ul>
                {drafts.map((draft) => (
                    <li key={draft.draftID}>
                        <Link to={`/draft/${draft.draftID}`}>
                            {draft.sport} Draft - {draft.draftStatus}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DraftList;
