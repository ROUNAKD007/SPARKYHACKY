import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();

    // -- Scroll-based Theme Transitions --
    // Background: Black -> White
    const background = useTransform(scrollYProgress, [0.15, 0.4], ["#050505", "#ffffff"]);

    // Text: White -> Black
    const textColor = useTransform(scrollYProgress, [0.15, 0.4], ["#ffffff", "#111111"]);

    // Subtext/Muted: Gray -> Dark Gray
    const mutedColor = useTransform(scrollYProgress, [0.15, 0.4], ["#888888", "#555555"]);

    // Navbar Background: Transparent -> Blurred White/Black
    const navBg = useTransform(scrollYProgress, [0.05, 0.2], ["rgba(5, 5, 5, 0)", "rgba(255, 255, 255, 0.1)"]);
    const navBackdrop = useTransform(scrollYProgress, [0.05, 0.2], ["blur(0px)", "blur(12px)"]);

    // Button: White -> Black (invert)
    const btnBg = useTransform(scrollYProgress, [0.15, 0.4], ["#ffffff", "#111111"]);
    const btnText = useTransform(scrollYProgress, [0.15, 0.4], ["#000000", "#ffffff"]);

    return (
        <motion.div
            style={{ background, minHeight: '100vh', color: textColor }}
            className="landing-container"
        >
            {/* -- Navbar -- */}
            <motion.nav
                className="nav-fixed"
                style={{ background: navBg, backdropFilter: navBackdrop, padding: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
                    <motion.div style={{ fontWeight: 600, letterSpacing: '0.05em', color: textColor, fontSize: '1.1rem' }}>
                        LUMINOUS.
                    </motion.div>
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <motion.span
                                style={{ color: mutedColor, fontSize: '1rem', fontWeight: 500 }}
                                whileHover={{ opacity: 0.8 }}
                            >
                                Log In
                            </motion.span>
                        </Link>
                        <motion.button
                            onClick={() => navigate('/signup')}
                            style={{
                                background: btnBg,
                                color: btnText,
                                padding: '14px 32px',
                                borderRadius: '9999px',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                minHeight: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{ scale: 1.02, opacity: 0.95 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* -- Section 1: Hero -- */}
            {/* Centered Flexbox Layout ensuring no horizontal shift */}
            <section className="section hero-section" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
                padding: '0 2rem'
            }}>
                <div style={{ maxWidth: '1000px', width: '100%' }}>
                    <motion.h1 style={{
                        color: textColor,
                        fontSize: 'clamp(3.5rem, 8vw, 7rem)', // Significantly larger
                        fontWeight: 700, // Heavier weight
                        letterSpacing: '-0.03em', // Tighter spacing for modern look
                        lineHeight: 1.1,
                        margin: '0 auto'
                    }}>
                        <RevealText delay={0.1}>Your space for inspiration.</RevealText>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        style={{ marginTop: '4rem' }}
                    >
                        <motion.button
                            className="cta-btn"
                            style={{
                                background: btnBg,
                                color: btnText,
                                padding: '1.2rem 3.5rem',
                                borderRadius: '50px',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* -- Section 2: Minimal Philosophy (No Floating Images) -- */}
            <section className="section" style={{ minHeight: '80vh', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <FadeInBlock>
                        <motion.h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.2, marginBottom: '2.5rem', color: textColor, fontWeight: 500 }}>
                            A calm place for<br />clear thinking.
                        </motion.h2>
                        <motion.p style={{ fontSize: '1.4rem', lineHeight: 1.6, color: mutedColor, maxWidth: '600px', margin: '0 auto' }}>
                            Organize ideas. Notice patterns. Think without noise.
                        </motion.p>
                    </FadeInBlock>
                </div>
            </section>

            {/* -- Section 3: Statement -- */}
            <section className="section" style={{ minHeight: '60vh', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <FadeInBlock>
                        <motion.h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, fontWeight: 400, opacity: 0.8 }}>
                            Feeds are built to distract.
                        </motion.h2>
                        <motion.h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, fontWeight: 600, marginTop: '1.5rem' }}>
                            Luminous is built to focus.
                        </motion.h2>
                    </FadeInBlock>
                </div>
            </section>

            {/* -- Section 4: Final CTA -- */}
            <section className="section" style={{ minHeight: '60vh', padding: '0 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <FadeInBlock>
                        <motion.h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: textColor, fontWeight: 600 }}>
                            Begin with clarity.
                        </motion.h2>
                        <motion.button
                            className="cta-btn"
                            style={{
                                background: btnBg,
                                color: btnText,
                                padding: '1.2rem 3.5rem',
                                borderRadius: '50px',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/signup')}
                        >
                            Create your space
                        </motion.button>
                    </FadeInBlock>
                </div>
            </section>

            <footer style={{ padding: '3rem', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <motion.p style={{ color: mutedColor, fontSize: '0.9rem' }}>© 2024 Luminous.</motion.p>
            </footer>

        </motion.div>
    );
};

// --- Helper Components ---

const RevealText = ({ children, delay }) => (
    <motion.div style={{ overflow: 'hidden' }}>
        <motion.span
            style={{ display: 'block' }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
        >
            {children}
        </motion.span>
    </motion.div>
);

const FadeInBlock = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

export default Landing;
