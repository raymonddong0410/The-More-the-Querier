import React, { useState } from 'react';
import axios from 'axios';

const ProfileSettings = () => {
    const [profileSettings, setProfileSettings] = useState({
        favoriteSport: '',
        aboutMe: ''
    });

    const [saving, setSaving] = useState(false);

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
                        placeholder="Enter your favorite sport"
                    />
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={profileSettings.aboutMe}
                        onChange={handleChange}
                        placeholder="Tell us about yourself"
                    />
                </div>
                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
