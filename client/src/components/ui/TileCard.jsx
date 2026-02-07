import React, { useState } from 'react';
import styles from './TileCard.module.css';
import { UI_TEXT } from '../../config/uiText';

const TileCard = ({ tile }) => {
    const [imgError, setImgError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Map size prop to aspect ratio class
    // 'tall' -> portrait, 'wide' -> landscape, 'md'/'sm' -> square
    let sizeClass = styles.square;
    if (tile.size === 'tall') sizeClass = styles.portrait;
    if (tile.size === 'wide') sizeClass = styles.landscape;

    // Construct path to potential local asset
    const imgSrc = tile.src || (tile.id ? new URL(`../../assets/tiles/tile${tile.id}.jpg`, import.meta.url).href : '');

    const handleLoad = () => {
        setLoaded(true);
    };

    const handleError = () => {
        setImgError(true);
        setLoaded(true);
    };

    return (
        <div className={`${styles.card} ${sizeClass}`}>
            {tile.badgeKey && UI_TEXT.badges && UI_TEXT.badges[tile.badgeKey] && (
                <div className={styles.badge}>
                    {UI_TEXT.badges[tile.badgeKey]}
                </div>
            )}

            {!imgError ? (
                <img
                    src={imgSrc}
                    alt={tile.altKey || 'Tile'}
                    className={`${styles.image} ${loaded ? styles.imageLoaded : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            ) : (
                <div className={styles.skeleton}>
                    {/* {tile.altKey} */}
                </div>
            )}

            {!loaded && !imgError && (
                <div className={styles.skeleton} style={{ position: 'absolute', top: 0, left: 0 }} />
            )}
        </div>
    );
};

export default TileCard;
