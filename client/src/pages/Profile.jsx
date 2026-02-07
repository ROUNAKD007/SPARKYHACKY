import React from 'react';

const Profile = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Profile</h1>
            <p style={{ color: '#c5c5c5', marginTop: '0.75rem' }}>
                Profile page placeholder. Portfolio submissions are being saved and ready to display here next.
            </p>
            <button
                type="button"
                onClick={() => {
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                style={{
                    marginTop: '1rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    cursor: 'pointer'
                }}
            >
                Back to Home
            </button>
        </div>
    );
};

export default Profile;
