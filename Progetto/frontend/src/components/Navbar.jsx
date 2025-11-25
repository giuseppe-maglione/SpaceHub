import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/rooms">Aule</Link>

            {user && (
                <>
                    <Link to="/my-bookings">Le mie prenotazioni</Link>
                    <Link to="/create-booking">Crea prenotazione</Link>
                </>
            )}

            {user ? (
                <button onClick={logout}>Logout ({user.username})</button>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Registrati</Link>
                </>
            )}
        </nav>
    );
}
