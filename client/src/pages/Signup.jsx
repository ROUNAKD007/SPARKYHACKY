import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        // Mock signup - in a real app, this would call an API
        navigate('/app');
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <h2>Create Account</h2>

                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="submit-btn">Sign Up</button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button type="button" className="submit-btn google-btn" onClick={() => navigate('/app')}>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                        Continue with Google
                    </button>
                </form>

                <div className="form-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
