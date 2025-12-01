import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../api";
import { Link } from "react-router-dom";
export default function MyBookings() {
    const [list, setList] = useState([]);
    async function load() {
        try {
            const res = await apiGet("/api/prenotazioni");
            
            // Accedi alla proprietà .bookings dell'oggetto risposta.
            // Aggiungiamo '|| []' per sicurezza, nel caso tornasse undefined.
            setList(res.bookings || []); 
            
        } catch (err) {
            console.error("Errore caricamento prenotazioni:", err);
            setList([]); // In caso di errore resetta la lista
        }
    }
    async function del(id) {
        if(!confirm("Sei sicuro di voler eliminare questa prenotazione?")) return;
        
        try {
            await apiDelete(`/api/prenotazioni/${id}`);
            load(); // Ricarica la lista dopo l'eliminazione
        } catch (err) {
            console.error("Errore cancellazione:", err);
            alert("Impossibile eliminare la prenotazione.");
        }
    }
    useEffect(() => { load(); }, []);
    return (
        <div>
            <h2>Le mie prenotazioni</h2>
            
            {/* Controllo se la lista è vuota per mostrare un messaggio cortese */}
            {list.length === 0 && <p>Non hai ancora effettuato prenotazioni.</p>}
            {list.map(b => (
                <div key={b.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                    <strong>Aula {b.room_id}</strong>
                    <br />
                    {/* Nota: qui le date sono stringhe SQL, potresti volerle formattare meglio */}
                    Inizio: {new Date(b.start_time).toLocaleString()} <br />
                    Fine: {new Date(b.end_time).toLocaleString()}
                    <br />
                    <div style={{ marginTop: "10px" }}>
                        <Link to={`/edit-booking/${b.id}`} style={{ marginRight: "10px" }}>Modifica</Link>
                        <button onClick={() => del(b.id)} style={{ color: "red" }}>Elimina</button>
                    </div>
                </div>
            ))}
        </div>
    );
}