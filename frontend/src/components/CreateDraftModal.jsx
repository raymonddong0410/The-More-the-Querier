import React, { useState } from 'react';
import axios from 'axios';

function CreateDraftModal({ leagueID, onClose, onDraftCreated }) {
    const [draftDate, setDraftDate] = useState('');
    const [draftOrder, setDraftOrder] = useState('S'); // Default to 'Snake' order
    const [sport, setSport] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!draftDate || !sport || !['S', 'R'].includes(draftOrder)) {
            setError('Please fill out all fields correctly.');
            return;
        }

        try {
            const response = await axios.post(`/draft/create`, {
                leagueID,
                draftDate,
                draftOrder,
                sport,
            });
            alert(response.data.message);
            onDraftCreated(); // Refresh the drafts list in parent component
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error creating draft:', error);
            setError(
                error.response && error.response.data ? 
    (error.response.data.error || error.response.data.error) : 
    null ||
                'An error occurred while creating the draft.'
            );
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Draft</h2>
                <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => {
                        setDraftDate(e.target.value);
                        setError(''); // Clear errors on input change
                    }}
                />
                <select
                    value={draftOrder}
                    onChange={(e) => {
                        setDraftOrder(e.target.value);
                        setError(''); // Clear errors on input change
                    }}
                >
                    <option value="S">Snake Order</option>
                    <option value="R">Round Robin Order</option>
                </select>
                <input
                    type="text"
                    placeholder="Sport (e.g., Football, Basketball)"
                    value={sport}
                    onChange={(e) => {
                        setSport(e.target.value);
                        setError(''); // Clear errors on input change
                    }}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button onClick={handleSubmit}>Create Draft</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateDraftModal;
