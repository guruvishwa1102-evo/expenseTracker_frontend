import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        // Pointing to your live Render backend!
        const response = await fetch('https://expensetracker-api-nezd.onrender.com/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save the JWT "wristband" in the browser's local storage
            localStorage.setItem('token', data.token);
            alert('Signup successful!');
            navigate('/'); // Send them to the main tracker page
        } else {
            alert(data.message || 'Signup failed');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Create an Account</h2>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
    );
}