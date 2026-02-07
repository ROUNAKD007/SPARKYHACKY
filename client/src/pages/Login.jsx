import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login - in a real app, this would call an API
        navigate('/app');
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <h2>Welcome Back</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="submit-btn">Log In</button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button type="button" className="submit-btn google-btn" onClick={() => navigate('/app')}>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                        Continue with Google
                    </button>
                </form>

                <div className="form-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
