import React, { useState, useMemo } from 'react';
import styles from './HeaderBar.module.css';
import { UI_TEXT } from '../../config/uiText';

const Logo = () => {
    const [imgError, setImgError] = useState(false);

    // Construct URL safely
    const logoUrl = useMemo(() => {
        try {
            return new URL('../../assets/logo.png', import.meta.url).href;
        } catch (e) {
            console.warn("Logo URL construction failed", e);
            return '';
        }
    }, []);

    if (imgError || !logoUrl) {
        return <span className={styles.brandText}>{UI_TEXT.brandPlaceholder}</span>;
    }

    return (
        <img
            src={logoUrl}
            alt="Logo"
            className={styles.logoImage}
            onError={() => setImgError(true)}
        />
    );
};

const HeaderBar = () => {
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <div className={styles.logoArea}>
                    <Logo />
                </div>
            </div>

            {/* Middle Nav Removed as per request */}

            <div className={styles.rightSection}>
                <div className={styles.searchArea}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={UI_TEXT.searchPlaceholder}
                    />
                </div>
            </div>
        </header>
    );
};

export default HeaderBar;
