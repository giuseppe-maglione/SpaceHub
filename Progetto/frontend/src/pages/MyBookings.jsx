import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../api";
import { Link } from "react-router-dom";

export default function MyBookings() {
    const [list, setList] = useState([]);

    async function load() {
        const res = await apiGet("/api/prenotazioni");
        setList(res);
    }

    async function del(id) {
        await apiDelete(`/api/prenotazioni/${id}`);
        load();
    }

    useEffect(() => { load(); }, []);

    return (
        <div>
            <h2>Le mie prenotazioni</h2>
            {list.map(b => (
                <div key={b.id}>
                    Aula {b.room_id} — {b.start_time} → {b.end_time}
                    <Link to={`/edit-booking/${b.id}`}>Modifica</Link>
                    <button onClick={() => del(b.id)}>Elimina</button>
                </div>
            ))}
        </div>
    );
}
