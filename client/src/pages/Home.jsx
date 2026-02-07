import React from 'react';
import HeaderBar from '../components/layout/HeaderBar';
import CloudinaryGallery from '../components/CloudinaryGallery';

const Home = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff' }}>
            <HeaderBar />
            <CloudinaryGallery />
        </div>
    );
};

export default Home;
