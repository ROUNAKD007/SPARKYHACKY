import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "http://localhost:5001";

export default function CloudinaryGallery() {
    const [images, setImages] = useState([]);
    const [err, setErr] = useState("");
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const fetchImages = async () => {
        try {
            setErr("");
            const res = await fetch(`${API_BASE}/api/images`);
            if (!res.ok) throw new Error("Failed to fetch images");
            const data = await res.json();
            setImages(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(`Backend unreachable at ${API_BASE}. Check server + CORS.`);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const columns = useMemo(() => {
        const cols = [[], [], []];
        images.forEach((img, i) => cols[i % 3].push(img));
        return cols;
    }, [images]);

    const uploadFile = async (file) => {
        if (!file) return;
        try {
            setErr("");
            const fd = new FormData();
            fd.append("image", file);

            const res = await fetch(`${API_BASE}/api/images/upload`, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error("Upload failed");
            await fetchImages();
        } catch (e) {
            setErr("Upload failed. Check backend logs.");
        }
    };

    const onPickFile = (e) => uploadFile(e.target.files?.[0]);
    const onPickCamera = (e) => uploadFile(e.target.files?.[0]);

    // Important: force permission prompt first (Safari/Chrome behave better)
    const openCamera = async () => {
        try {
            setErr("");
            if (!navigator.mediaDevices?.getUserMedia) {
                setErr("Camera not supported in this browser.");
                return;
            }
            await navigator.mediaDevices.getUserMedia({ video: true });
            cameraInputRef.current?.click();
        } catch (e) {
            setErr("Camera permission denied or unavailable.");
        }
    };

    return (
        <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '99px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'white',
                        color: 'black',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Upload Image
                </button>
                <button
                    onClick={openCamera}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '99px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Capture Photo
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onPickFile}
                />

                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={onPickCamera}
                />
            </div>

            {err && (
                <div style={{ marginTop: 12, color: "#ff6b6b", marginBottom: 12 }}>
                    {err}
                </div>
            )}

            <div className="portfolio-carousel" style={{ marginTop: 24 }}>
                {columns.map((col, i) => (
                    <div className="portfolio-col" key={i} aria-label={`Column ${i + 1}`}>
                        {/* Duplicate the column for seamless scroll */}
                        {[...col, ...col].map((src, idx) => (
                            <img
                                key={`${i}-${idx}`}
                                src={src}
                                alt="portfolio"
                                loading="lazy"
                                className="portfolio-img"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
