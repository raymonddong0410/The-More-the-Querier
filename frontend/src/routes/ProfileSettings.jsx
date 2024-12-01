import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileSettings = () => {
    const [profileSettings, setProfileSettings] = useState({
        favoriteSport: '',
        aboutMe: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileSettings = async () => {
            try {
                const response = await axios.get('/profileSettings');
                setProfileSettings(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching profile settings');
                setLoading(false);
            }
        };

        fetchProfileSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            await axios.put('/profileSettings', profileSettings); // Update the profile settings
            alert('Profile settings saved successfully!');
        } catch (err) {
            alert('Error saving profile settings');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

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
                </div>
                <div className="form-group">
                    <label htmlFor="aboutMe">About Me</label>
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={profileSettings.aboutMe}
                        onChange={handleChange}
                        placeholder="Tell us about yourself"
                    />
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default ProfileSettings;
