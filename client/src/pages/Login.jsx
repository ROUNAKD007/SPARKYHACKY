import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in securely with Google</p>

                <button
                    type="button"
                    className="submit-btn google-btn"
                    onClick={() => navigate('/app')}
                    style={{ borderRadius: '9999px', padding: '12px 24px' }}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                    Continue with Google
                </button>

                <div className="form-footer" style={{ marginTop: '2rem' }}>
                    New here? <Link to="/signup" style={{ color: 'white', textDecoration: 'underline' }}>Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
