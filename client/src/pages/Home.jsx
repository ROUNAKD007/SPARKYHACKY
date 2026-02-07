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
        color: color.darkText ? '#000' : '#fff',
      }}
    >
      {color.name}
    </div>
  );
};

/*
  7-Day Calendar Logic
*/
const StreakCalendar = () => {
  // If you want the displayed streak capped at 7:
  const actualStreakCount = 12; // mock (replace later)
  const streakCount = Math.min(actualStreakCount, 7);

  const dailyColor = getDailyColor();

  // Build last 7 days (UTC-based)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000); // oldest -> newest
    const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const isToday = dateKey === new Date().toISOString().slice(0, 10);

    return {
      label: d.toLocaleDateString(undefined, { weekday: 'short' }), // Sun, Mon...
      date: d.getUTCDate(),
      dateKey,
      isToday,
      active: isToday, // for now only today is active
    };
  });

  return (
    <div className={styles.streakCard}>
      <div className={styles.streakHeader}>
        <span className={styles.streakTitle}>Current Streak</span>
        <span className={styles.streakCount}>{streakCount} Days</span>
      </div>

      <div className={styles.navButtonsRow}>
        <button className={styles.navButton}>Feed</button>
        <button className={styles.navButton}>Leaderboard</button>
      </div>

      {/* 7-day grid */}
      <div
        className={styles.calendarGrid}
        style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {days.map((day) => (
          <div key={day.dateKey} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              {day.label}
            </div>

            <div
              className={`${styles.calendarDay} ${
                day.active ? styles.dayActive : ''
              } ${day.isToday ? styles.dayToday : ''}`}
              style={
                day.isToday
                  ? {
                      backgroundColor: dailyColor.hex,
                      color: dailyColor.darkText ? '#000' : '#fff',
                      border: `2px solid ${dailyColor.hex}`,
                      fontWeight: 800,
                    }
                  : {}
              }
            >
              {day.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      <HeaderBar />

      <main
        className={styles.container}
        style={{ height: 'calc(100vh - 72px)', overflow: 'hidden' }}
      >
        <aside
          className={styles.leftColumn}
          style={{ overflowY: 'auto', paddingBottom: '2rem' }}
        >
          <div className={styles.connectCard}>
            <div className={styles.connectTitle}>
              {UI_TEXT?.leftCard?.title ?? 'Welcome'}
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
