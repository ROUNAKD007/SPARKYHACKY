import React, { useMemo } from 'react';
import styles from './MasonryGrid.module.css';
import TileCard from '../ui/TileCard';

const MasonryGrid = ({ tiles }) => {
    const columns = useMemo(() => {
        const bucket = [[], [], []];
        tiles.forEach((tile, index) => {
            bucket[index % 3].push(tile);
        });
        return bucket.map((column) => (column.length > 0 ? [...column, ...column] : []));
    }, [tiles]);

    if (!tiles.length) {
        return (
            <div className={styles.emptyState}>
                Upload your first image to start the gallery.
            </div>
        );
    }

    return (
        <div className={styles.carousel}>
            {columns.map((column, columnIndex) => (
                <div className={styles.columnViewport} key={`column-${columnIndex}`}>
                    <div className={styles.columnTrack}>
                        {column.map((tile, tileIndex) => (
                            <TileCard key={`${tile.id}-${columnIndex}-${tileIndex}`} tile={tile} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MasonryGrid;
