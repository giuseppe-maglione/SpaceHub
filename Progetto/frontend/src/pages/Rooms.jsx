import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);

    async function load() {
        const res = await apiGet("/api/aule-disponibili?date=2025-01-01");
        setRooms(res);
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div>
            <h2>Aule disponibili</h2>
            {rooms.map(r => (
                <div key={r.id}>
                    {r.name} — {r.available ? "Libera" : "Occupata"}
                </div>
            ))}
        </div>
    );
}
