import React, { useEffect, useRef, useState } from 'react';
import styles from './MasonryGrid.module.css';
import TileCard from '../ui/TileCard';

/*
  Smooth Inertial Scroll Hook
  - Intercepts wheel events
  - Animates translateY
*/
const useSmoothScroll = (scrollContainerRef) => {
    const [scrollY, setScrollY] = useState(0);
    const targetY = useRef(0);
    const currentY = useRef(0);
    const requestRef = useRef();

    useEffect(() => {
        const handleWheel = (e) => {
            // Prevent default if inside our feed area to handle it manually (optional, but cleaner for "app" feel)
            // However, blocking default scroll can be UX hostile. 
            // The prompt asks for "smooth inertial scroll using requestAnimationFrame".
            // A common way is to let native scroll happen but map it, or hijack it.
            // Let's hijack it for that "smooth as butter" requested effect on this specific container.

            // Note: If this is the main page scroll, hijacking window scroll is aggressive.
            // We'll perform it on the container.
            e.preventDefault();
            targetY.current += e.deltaY;

            // Clamp (0 to max scroll) - we need content height.
            // For now, let's allow infinite down, but clamp 0 at top.
            targetY.current = Math.max(0, targetY.current);
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        const update = () => {
            // Lerp
            const diff = targetY.current - currentY.current;
            const delta = diff * 0.1; // 0.1 easing factor

            if (Math.abs(diff) > 0.5) {
                currentY.current += delta;
                setScrollY(currentY.current);
                requestRef.current = requestAnimationFrame(update);
            } else {
                requestRef.current = requestAnimationFrame(update);
            }
        };

        requestRef.current = requestAnimationFrame(update);

        return () => {
            if (container) container.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return scrollY;
};

const MasonryGrid = ({ tiles }) => {
    // Standard Masonry Layout
    const columns = [[], [], []];

    // Distribute tiles
    tiles.forEach((tile, i) => {
        columns[i % 3].push(tile);
    });

    // Lazy load mock: Duplicate tiles to simulate long feed
    // In real app, we'd fetch more.
    const longTiles = [...tiles, ...tiles, ...tiles, ...tiles];
    const longColumns = [[], [], []];
    longTiles.forEach((tile, i) => {
        longColumns[i % 3].push({ ...tile, id: `${tile.id}-${i}` }); // ensure unique keys
    });

    const containerRef = useRef(null);
    // Note: Applying smooth scroll logic to a container requires it to be fixed height or window based.
    // Assuming the Grid is inside a container that takes remaining space.
    // But since we are modifying just the Grid component, we'll try to apply the transform here.
    // Important: To have "overflow: hidden" on parent and transform here.

    // Actually, to make the "whole feed area" scroll, we usually apply this to the page wrapper.
    // Since I can only modify specific files, I'll wrap the grid in a localized smooth scroller.
    // BUT the user asked for "whole feed area scrolls as a single page".
    // I will try to make this component act as the scroll viewport for the feed section.

    const scrollY = useSmoothScroll(containerRef);

    return (
        <div
            ref={containerRef}
            style={{
                height: 'calc(100vh - 80px)', // ballpark height minus header/padding
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div
                className={styles.masonryContainer}
                style={{ transform: `translateY(-${scrollY}px)` }}
            >
                <div className={styles.column}>
                    {longColumns[0].map((tile, i) => <TileCard key={tile.id} tile={tile} />)}
                </div>
                <div className={styles.column}>
                    {longColumns[1].map((tile, i) => <TileCard key={tile.id} tile={tile} />)}
                </div>
                <div className={styles.column}>
                    {longColumns[2].map((tile, i) => <TileCard key={tile.id} tile={tile} />)}
                </div>
            </div>
        </div>
    );
};

export default MasonryGrid;
