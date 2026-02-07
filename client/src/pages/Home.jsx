import React, { useMemo } from 'react';
import styles from './Home.module.css';
import HeaderBar from '../components/layout/HeaderBar';
import MasonryGrid from '../components/layout/MasonryGrid';
import { mockTiles } from '../data/mockTiles';
import { UI_TEXT } from '../config/uiText';

/* 
  Mock Daily Color Logic
*/
const COLORS = [
    { name: 'Red', hex: '#FF5252' },
    { name: 'Orange', hex: '#FF9800' },
    { name: 'Yellow', hex: '#FFEB3B', darkText: true },
    { name: 'Green', hex: '#4CAF50' },
    { name: 'Blue', hex: '#2196F3' },
    { name: 'Indigo', hex: '#3F51B5' },
    { name: 'Violet', hex: '#9C27B0' },
];

const getDailyColor = () => {
    const today = new Date();
    const index = today.getUTCDay();
    return COLORS[index];
};

const ColorCard = () => {
    const color = useMemo(() => getDailyColor(), []);
    return (
        <div
            className={styles.colorButtonCard}
            style={{
                backgroundColor: color.hex,
                color: color.darkText ? '#000' : '#fff'
            }}
        >
            {/* {color.name} */}
            {/* Text removed in previous turn? User request implies "Color of the Day" button logic remains 
                "Text on button should be color name" from prev prompt. 
                I'll keep it.
             */}
            {color.name}
        </div>
    );
};

/*
  Real Month Calendar Logic
*/
const StreakCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    const todayDate = today.getDate(); // 1-31

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // First weekday of month (0-6, Sun-Sat)
    const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

    // Generate days array
    // We add padding for empty slots at start if we want alignment
    const totalSlots = daysInMonth + firstWeekday;
    const days = Array.from({ length: totalSlots }, (_, i) => {
        if (i < firstWeekday) return null; // Empty slot
        const dayNum = i - firstWeekday + 1;
        return {
            date: dayNum,
            isToday: dayNum === todayDate,
            // Mock active logic: let's say every 3rd day is active + today
            active: (dayNum % 3 === 0) || (dayNum === todayDate)
        };
    });

    const streakCount = 12; // Mock

    return (
        <div className={styles.streakCard}>
            <div className={styles.streakHeader}>
                <span className={styles.streakTitle}>Current Streak</span>
                <span className={styles.streakCount}>{streakCount} Days</span>
            </div>

            <div className={styles.navButtonsRow}>
                <button className={styles.navButton}>Feed</button>
                <button className={styles.navButton}>{UI_TEXT.nav.explore}</button>
            </div>

            <div className={styles.calendarGrid}>
                {days.map((day, idx) => (
                    day ? (
                        <div
                            key={idx}
                            className={`${styles.calendarDay} ${day.active ? styles.dayActive : ''} ${day.isToday ? styles.dayToday : ''}`}
                        >
                            {/* Optional: Show day number for "Real Month" feel */}
                            {day.date}
                        </div>
                    ) : (
                        <div key={idx} /> // Empty slot
                    )
                ))}
            </div>
        </div>
    );
};

const Home = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
            <HeaderBar />

            <main className={styles.container} style={{ height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
                <aside className={styles.leftColumn} style={{ overflowY: 'auto', paddingBottom: '2rem' }}>
                    <div className={styles.connectCard}>
                        <div className={styles.connectTitle}>
                            {UI_TEXT.leftCard.title}
                        </div>
                    </div>

                    <ColorCard />

                    <StreakCalendar />
                </aside>

                <section className={styles.mainContent}>
                    <MasonryGrid tiles={mockTiles} />
                </section>
            </main>
        </div>
    );
};

export default Home;
