import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileSettings.css';

const ProfileSettings = () => {
    const [profileSettings, setProfileSettings] = useState({
        favoriteSport: '',
        aboutMe: ''
    });

    const [tempSettings, setTempSettings] = useState({
        favoriteSport: '',
        aboutMe: ''
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    useEffect(() => {
        const fetchProfileSettings = async () => {
            try {
                const response = await axios.get('/profileSettings');
                const { favoriteSport, aboutMe } = response.data; 
                setProfileSettings({
                    favoriteSport: favoriteSport || '', 
                    aboutMe: aboutMe || ''              
                });
            } catch (error) {
                console.error('Error fetching profile settings:', error);
            }
        };

        fetchProfileSettings();
    }, []);  

    useEffect(() => {
        setTempSettings({
            favoriteSport: profileSettings.favoriteSport,
            aboutMe: profileSettings.aboutMe
        });
    }, [profileSettings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempSettings({
            ...tempSettings,
            [name]: value 
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            console.log('Submitting profile settings:', tempSettings);
            const response = await axios.put('/updateProfileSettings', tempSettings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            console.log('Profile updated:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAccountDeletion = async () => {
        try {
            await axios.delete('/deleteAccount');
            // Redirect to login or home page after successful deletion
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account. Please try again.');
        }
    };

    return (
        <div className="profileSettings">
            <h1>Profile Settings</h1>

            <div className="current-settings">
                <h2 className="league-header">Current Settings</h2>
                <p><strong>Favorite Sport:</strong> {profileSettings.favoriteSport || 'Not set'}</p>
                <p><strong>About Me:</strong> {profileSettings.aboutMe || 'Not set'}</p>
            </div>
            
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label className="text-white" htmlFor="favoriteSport">Favorite Sport</label>
                    <input
                        type="text"
                        id="favoriteSport"
                        name="favoriteSport"
                        value={tempSettings.favoriteSport} 
                        onChange={handleChange}
                        placeholder="My favorite sport..."
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label  className="text-white"  htmlFor="aboutMe">About Me</label>
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={tempSettings.aboutMe} 
                        onChange={handleChange}
                        placeholder="Some things about me..."
                        className="form-input"
                    />
                </div>
                <button type="submit" disabled={saving} className="form-button">
                    {saving ? 'Saving...' : 'Save'}
                </button>
                {saved && <div className="successMessage">Profile settings saved successfully!</div>}
            </form>

            <div className="account-deletion-section">
                <h2 className="text-white">Account Deletion</h2>
                <button 
                    onClick={() => setDeleteModalOpen(true)} 
                    className="delete-account-button"
                >
                    Delete Account
                </button>

                {deleteModalOpen && (
                    <div className="delete-modal">
                        <div className="delete-modal-content">
                            <h3>Delete Account</h3>
                            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                            <p>Please type "DELETE" to confirm:</p>
                            <input 
                                type="text" 
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="delete-confirmation-input"
                            />
                            <div className="delete-modal-buttons">
                                <p></p>
                                <button 
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                                <p></p>
                                <button 
                                    onClick={handleAccountDeletion}
                                    disabled={deleteConfirmation !== 'DELETE'}
                                    className="confirm-delete-button"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;
