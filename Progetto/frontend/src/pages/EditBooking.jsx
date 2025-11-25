import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditBooking() {
  const { id } = useParams();
  const nav = useNavigate();

  const [booking, setBooking] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/prenotazioni/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setStartTime(data.start_time);
        setEndTime(data.end_time);
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/prenotazioni/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ startTime, endTime }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    nav("/dashboard");
  };

  if (!booking) return <p>Caricamento...</p>;

  return (
    <div>
      <h1>Modifica Prenotazione #{id}</h1>

      <form onSubmit={handleUpdate}>
        <label>
          Inizio:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label>
          Fine:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        <button type="submit">Salva modifiche</button>
      </form>

      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
