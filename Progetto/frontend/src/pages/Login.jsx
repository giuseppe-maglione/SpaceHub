import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";     // hook che permette di reindirizzare l'utente ad un'altra pagina dopo il login

export default function Login() {
    // inizializzazione degli stati
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const [error, setError] = useState(""); 
    
    const navigate = useNavigate();

    // funzione che gestisce ciò che accade quando l'utente preme il pulsante "Accedi"
    async function handleSubmit(e) {
        e.preventDefault();             // impedisce il comportamento predefinito di un form HTML, che è ricaricare l'intera pagina.        
   
        setError("");

        const res = await login(username, password);
        
        // controllo se c'è un errore nella risposta
        if (res.error) {
            setError(res.error);
        } else {
            // se non c'è errore, navighiamo alla home
            navigate("/");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            
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
            
            <button type="submit">Accedi</button>

            {/* visualizzazione del messaggio di errore */}
            {error && (
                <p style={{ color: "red", marginTop: "10px" }}>
                    {error}
                </p>
            )}
        </form>
    );
}