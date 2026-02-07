import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styles from './Home.module.css';
import HeaderBar from '../components/layout/HeaderBar';
import MasonryGrid from '../components/layout/MasonryGrid';
import { UI_TEXT } from '../config/uiText';
import { uploadImages } from '../utils/cloudinaryUpload';
import { apiFetch, checkApiHealth, getApiBaseUrl, getStoredToken } from '../utils/api';
import { checkColorMatch } from '../utils/colorMatch';

const FALLBACK_COLORS = [
    { name: 'Red', hex: '#FF5252' },
    { name: 'Orange', hex: '#FF9800' },
    { name: 'Yellow', hex: '#FFEB3B', darkText: true },
    { name: 'Green', hex: '#4CAF50' },
    { name: 'Blue', hex: '#2196F3' },
    { name: 'Indigo', hex: '#3F51B5' },
    { name: 'Violet', hex: '#9C27B0' },
];

const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

const getFallbackDailyColor = () => {
    const today = new Date();
    const index = today.getUTCDay();
    return { ...FALLBACK_COLORS[index], dateKey: getTodayDateKey() };
};

const normalizeImage = (image) => {
    if (!image) return null;

    if (typeof image === 'string') {
        return { url: image, publicId: '', width: null, height: null };
    }

    if (typeof image === 'object' && typeof image.url === 'string') {
        return {
            url: image.url,
            publicId: typeof image.publicId === 'string' ? image.publicId : '',
            width: Number.isFinite(image.width) ? image.width : null,
            height: Number.isFinite(image.height) ? image.height : null,
        };
    }

    return null;
};

const ColorCard = ({ dailyColor }) => {
    return (
        <div
            className={styles.colorButtonCard}
            style={{
                backgroundColor: dailyColor.hex,
                color: dailyColor.darkText ? '#000' : '#fff'
            }}
        >
            {dailyColor.name}
        </div>
    );
};

const UploadSection = ({ dailyColor, onUploadComplete, backendHealthError, onSessionExpired }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [colorMsg, setColorMsg] = useState('');

    const handleUploadFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;

        if (!getStoredToken()) {
            setErrorMsg('Session expired. Please log in again.');
            onSessionExpired?.();
            return;
        }

        setUploading(true);
        setStatusMsg('Analyzing color...');
        setErrorMsg('');
        setColorMsg('');

        try {
            const files = Array.from(fileList);
            const leadFile = files[0];

            const colorCheck = await checkColorMatch(leadFile, dailyColor.hex);
            const matchPercent = Math.round(colorCheck.matchRatio * 100);
            const qualified = colorCheck.qualified;

            setColorMsg(
                qualified
                    ? `Color match: ${matchPercent}% ✅ +5 points`
                    : `Color match: ${matchPercent}% ❌ 0 points`
            );

            setStatusMsg('Uploading to Cloudinary...');

            let uploadedImages;
            try {
                uploadedImages = await uploadImages(files);
            } catch (error) {
                console.error('[Upload] Cloudinary upload failed', error);
                throw new Error('Cloudinary upload failed');
            }

            if (!uploadedImages || uploadedImages.length === 0) {
                throw new Error('Cloudinary upload failed');
            }

            const payload = {
                caption: '',
                dateKey: dailyColor.dateKey || getTodayDateKey(),
                colorName: dailyColor.name,
                colorHex: dailyColor.hex,
                colorCheck: {
                    matchRatio: colorCheck.matchRatio,
                    qualified,
                },
                images: uploadedImages,
            };

            console.log('[Upload] Submissions POST debug', {
                url: `${getApiBaseUrl()}/submissions`,
                method: 'POST',
                headers: {
                    Authorization: getStoredToken() ? '[present redacted]' : '[missing]',
                    'Content-Type': 'application/json',
                },
                bodySummary: {
                    imagesCount: payload.images.length,
                    dateKey: payload.dateKey,
                    colorName: payload.colorName,
                    hasColorCheck: true,
                },
            });

            setStatusMsg('Saving submission...');

            try {
                await apiFetch('/submissions', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } catch (error) {
                if (error?.status === 401 || error?.status === 403) {
                    onSessionExpired?.();
                    throw new Error('Session expired. Please log in again.');
                }

                if (error?.isNetworkError) {
                    throw new Error('Backend unreachable (check server running / CORS)');
                }

                if (error?.status === 400) {
                    throw new Error(error.message || 'Submission validation failed');
                }

                const detail = error?.message || 'Unknown backend error';
                throw new Error(`Saved to Cloudinary but failed to save submission: ${detail}`);
            }

            setStatusMsg('Submission saved');
            await onUploadComplete?.();

            setTimeout(() => {
                setStatusMsg('');
                setColorMsg('');
            }, 3500);
        } catch (error) {
            console.error('[Upload] Failed', error);
            setStatusMsg('');
            setErrorMsg(error?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const handleFilePickerChange = (event) => {
        handleUploadFiles(event.target.files);
    };

    const handleCameraChange = (event) => {
        handleUploadFiles(event.target.files);
    };

    return (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFilePickerChange}
            />
            <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                ref={cameraInputRef}
                onChange={handleCameraChange}
            />

            <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                    className={styles.navButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ flex: 1, backgroundColor: uploading ? '#444' : '#fff', color: uploading ? '#fff' : '#000' }}
                >
                    {uploading ? 'Processing...' : 'Upload Image'}
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    style={{ flex: 1, backgroundColor: uploading ? '#444' : '#fff', color: uploading ? '#fff' : '#000' }}
                >
                    {uploading ? 'Processing...' : 'Capture Photo'}
                </button>
            </div>

            {backendHealthError && (
                <span style={{ color: '#ff8a65', fontSize: '0.8rem', textAlign: 'center' }}>
                    {backendHealthError}
                </span>
            )}
            {colorMsg && <span style={{ color: '#e8e8e8', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>{colorMsg}</span>}
            {statusMsg && <span style={{ color: '#4CAF50', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>{statusMsg}</span>}
            {errorMsg && <span style={{ color: '#ff5252', fontSize: '0.8rem', textAlign: 'center' }}>{errorMsg}</span>}
        </div>
    );
};

const StreakCalendar = ({ profile, onProfileClick }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const todayDate = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

    const totalSlots = daysInMonth + firstWeekday;
    const days = Array.from({ length: totalSlots }, (_, i) => {
        if (i < firstWeekday) return null;
        const dayNum = i - firstWeekday + 1;
        return {
            date: dayNum,
            isToday: dayNum === todayDate,
            active: dayNum <= todayDate
        };
    });

    const streakCount = profile?.streakCount || 0;
    const username = profile?.username || 'My Profile';
    const avatar = profile?.avatar || '';

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
                            {day.date}
                        </div>
                    ) : (
                        <div key={idx} />
                    )
                ))}
            </div>

            <button type="button" className={styles.profileEntry} onClick={onProfileClick}>
                {avatar ? (
                    <img src={avatar} alt={username} className={styles.profileAvatar} />
                ) : (
                    <div className={styles.profileAvatarFallback}>{username.slice(0, 1).toUpperCase()}</div>
                )}
                <span className={styles.profileName}>{username}</span>
            </button>
        </div>
    );
};

const mapSubmissionToTile = (sub) => {
    const img = normalizeImage(sub?.images?.[0]);
    if (!img?.url) return null;

    const width = Number.isFinite(img.width) ? img.width : 1;
    const height = Number.isFinite(img.height) ? img.height : 1;
    const ratio = width / height;

    let size = 'md';
    if (ratio < 0.8) size = 'tall';
    if (ratio > 1.2) size = 'wide';

    return {
        id: sub._id || sub.id,
        src: img.url,
        altKey: sub.caption || 'Submission',
        size
    };
};

const Home = ({ currentUser, onSessionExpired }) => {
    const [tiles, setTiles] = useState([]);
    const [dailyColor, setDailyColor] = useState(getFallbackDailyColor());
    const [backendHealthError, setBackendHealthError] = useState('');
    const dailyColorMemo = useMemo(() => dailyColor, [dailyColor]);

    const fetchFeed = useCallback(async () => {
        try {
            const exploreData = await apiFetch('/explore');
            const exploreItems = Array.isArray(exploreData?.items) ? exploreData.items : [];
            const mappedExplore = exploreItems.map(mapSubmissionToTile).filter(Boolean);
            if (mappedExplore.length > 0) {
                setTiles(mappedExplore);
                return;
            }
        } catch (error) {
            if (error?.status === 401 || error?.status === 403) {
                onSessionExpired?.();
                return;
            }
            console.error('[Feed] /explore failed', error);
        }

        try {
            const meData = await apiFetch('/submissions/me');
            const ownSubmissions = Array.isArray(meData?.submissions) ? meData.submissions : [];
            const mappedOwn = ownSubmissions.map(mapSubmissionToTile).filter(Boolean);
            setTiles(mappedOwn);
        } catch (error) {
            if (error?.status === 401 || error?.status === 403) {
                onSessionExpired?.();
                return;
            }
            console.error('[Feed] /submissions/me failed', error);
            setTiles([]);
        }
    }, [onSessionExpired]);

    const fetchDailyColor = useCallback(async () => {
        try {
            const data = await apiFetch('/daily-color/today');
            if (data?.name && data?.hex) {
                setDailyColor({
                    name: data.name,
                    hex: data.hex,
                    dateKey: data.dateKey || getTodayDateKey(),
                    darkText: data.hex?.toLowerCase() === '#ffeb3b'
                });
            }
        } catch (error) {
            console.error('[DailyColor] failed, using fallback', error);
            setDailyColor(getFallbackDailyColor());
        }
    }, []);

    const validateApiHealth = useCallback(async () => {
        try {
            await checkApiHealth();
            setBackendHealthError('');
        } catch (error) {
            console.error('[Health] API health check failed', error);
            setBackendHealthError(`Backend unreachable at ${getApiBaseUrl()}. Check server running / CORS.`);
        }
    }, []);

    const handleProfileClick = () => {
        window.history.pushState({}, '', '/profile');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    useEffect(() => {
        validateApiHealth();
        fetchDailyColor();
        fetchFeed();
    }, [validateApiHealth, fetchDailyColor, fetchFeed]);

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

                    <ColorCard dailyColor={dailyColorMemo} />

                    <UploadSection
                        dailyColor={dailyColorMemo}
                        onUploadComplete={fetchFeed}
                        backendHealthError={backendHealthError}
                        onSessionExpired={onSessionExpired}
                    />

                    <StreakCalendar
                        profile={currentUser}
                        onProfileClick={handleProfileClick}
                    />
                </aside>

                <section className={styles.mainContent}>
                    <MasonryGrid tiles={tiles} />
                </section>
            </main>
        </div>
    );
};

export default Home;
