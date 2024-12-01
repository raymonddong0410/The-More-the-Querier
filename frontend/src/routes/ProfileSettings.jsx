import React, { useState } from 'react';
import axios from 'axios';
import './ProfileSettings.css';
const ProfileSettings = () => {
    const [profileSettings, setProfileSettings] = useState({
        favoriteSport: '',
        aboutMe: ''
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false); 
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileSettings({
            ...profileSettings,
            [name]: value
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            console.log('Submitting profile settings:', profileSettings);
            const response = await axios.put('/updateProfileSettings',profileSettings
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            console.log('Profile updated:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profileSettings">
            <h1>Profile Settings</h1>
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="favoriteSport">Favorite Sport</label>
                    <input
                        type="text"
                        id="favoriteSport"
                        name="favoriteSport"
                        value={profileSettings.favoriteSport}
                        onChange={handleChange}
                        placeholder="My favorite sport..."
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="aboutMe">About Me</label>
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={profileSettings.aboutMe}
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
        </div>
    );
}

export default ProfileSettings;
