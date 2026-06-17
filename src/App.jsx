import { Routes, Route, Navigate } from 'react-router-dom';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Signup from './pages/Signup';

// This acts as a Bouncer. If they have no token, kick them to login!
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Routes>
            {/* The Login and Signup routes are public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* The Tracker route is protected by the Bouncer! */}
            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        <Tracker />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}