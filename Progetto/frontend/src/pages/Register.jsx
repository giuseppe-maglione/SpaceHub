import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        
        setError("");

        const res = await register(username, password);
        
        if (res.error) {
            setError(res.error);
        } else {
            // Altrimenti si viene reindirizzati alla home
            navigate("/");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registrazione</h2>
            
            <input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Username" 
            />
            
            <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
            />
            
            <button type="submit">Registrati</button>

            {/* mostriamo il messaggio di errore se presente */}
            {error && (
                <p style={{ color: "red", marginTop: "10px" }}>
                    {error}
                </p>
            )}
        </form>
    );
}