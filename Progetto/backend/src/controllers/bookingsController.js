import { bookingModel } from "../models/bookingModel.js";
import { roomModel } from "../models/roomModel.js";

// Helper per convertire JS Date in formato MariaDB 'YYYY-MM-DD HH:MM:SS'
// Assicura che la data sia in UTC per coerenza con la config del DB
const toSqlDate = (dateObj) => {
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
};

// 1. LISTA AULE DISPONIBILI
export const listRooms = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Parametri mancanti: start ed end sono obbligatori." });
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    // Validazione Date
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return res.status(400).json({ error: "Formato data/ora non valido. Usa ISO 8601." });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: "L'orario di inizio deve essere precedente alla fine." });
    }

    // Conversione per SQL
    const sqlStart = toSqlDate(startTime);
    const sqlEnd = toSqlDate(endTime);

    // Recupera stanze
    const rooms = await roomModel.getAllRooms();

    const result = [];
    for (const r of rooms) {
      // Passiamo le stringhe SQL al model
      const overlap = await bookingModel.hasOverlap(r.id, sqlStart, sqlEnd);
      result.push({
        id: r.id,
        name: r.name,
        location: r.location,
        capacity: r.capacity,
        available: !overlap
      });
    }

    return res.json({ 
        start: startTime.toISOString(), 
        end: endTime.toISOString(), 
        rooms: result 
    });

  } catch (err) {
    console.error("Errore in listRooms:", err);
    return res.status(500).json({ error: "Errore interno server" });
  }
};


// 2. RECUPERA SINGOLA PRENOTAZIONE
export const getUserBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId    = req.session.userId;
        const booking   = await bookingModel.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: "Prenotazione non trovata" });
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({ error: "Non puoi visualizzare questa prenotazione" });
        }

        res.json({ booking });

    } catch (err) {
        console.error("Errore in getUserBookingById:", err);
        res.status(500).json({ error: "Errore nel recupero della prenotazione" });
    }
};


// 3. LISTA PRENOTAZIONI UTENTE
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.session.userId;
        const bookings = await bookingModel.getActiveBookingsByUser(userId);
        res.json({ bookings });
    } catch (err) {
        console.error("Errore in getUserBookings:", err);
        res.status(500).json({ error: "Errore nel recupero delle prenotazioni" });
    }
};


// 4. CREA PRENOTAZIONE
export const createBooking = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { roomId, startTime, endTime } = req.body;

        if (!roomId || !startTime || !endTime) {
            return res.status(400).json({ error: "Dati mancanti" });
        }

        // Conversione e Validazione Date
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({ error: "Formato date non valido" });
        }

        if (start >= end) {
            return res.status(400).json({ error: "La data di inizio deve essere prima della fine" });
        }

        // Formattazione per MariaDB
        const sqlStart = toSqlDate(start);
        const sqlEnd = toSqlDate(end);

        // Check esistenza stanza
        const room = await roomModel.getRoomById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Stanza inesistente" });
        }

        // Check sovrapposizione (Usando date SQL)
        const overlap = await bookingModel.hasOverlap(roomId, sqlStart, sqlEnd);
        if (overlap) {
            return res.status(400).json({
                error: "La stanza è già occupata in quell'orario"
            });
        }

        // Creazione (Usando date SQL)
        const booking = await bookingModel.createBooking(
            userId,
            roomId,
            sqlStart,
            sqlEnd
        );

        res.json({
            message: "Prenotazione creata con successo",
            bookingId: booking.id
        });

    } catch (err) {
        console.error("Errore in createBooking:", err);
        res.status(500).json({ error: "Errore durante la creazione della prenotazione" });
    }
};


// 5. MODIFICA PRENOTAZIONE
export const updateBooking = async (req, res) => {
    try {
        const userId = req.session.userId;
        const bookingId = req.params.id;
        const { startTime, endTime } = req.body;

        if (!startTime || !endTime) {
            return res.status(400).json({ error: "Dati mancanti" });
        }

        // Conversione e Validazione Date
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({ error: "Formato date non valido" });
        }
        
        if (start >= end) {
             return res.status(400).json({ error: "La data di inizio deve essere prima della fine" });
        }

        // Formattazione per MariaDB
        const sqlStart = toSqlDate(start);
        const sqlEnd = toSqlDate(end);

        // Check esistenza prenotazione
        const booking = await bookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Prenotazione non trovata" });
        }

        // Check ownership
        if (booking.user_id !== userId) {
            return res.status(403).json({ error: "Non puoi modificare questa prenotazione" });
        }

        // Check sovrapposizione
        const overlap = await bookingModel.hasOverlap(
            booking.room_id,
            sqlStart,
            sqlEnd
        );

        // Se c’è sovrapposizione, dobbiamo capire se stiamo sovrapponendo noi stessi.
        // Convertiamo le date del DB in stringhe SQL per confrontarle con i nuovi input
        const currentDbStart = toSqlDate(new Date(booking.start_time));
        const currentDbEnd = toSqlDate(new Date(booking.end_time));

        // Logica: Se c'è overlap, MA i tempi richiesti sono IDENTICI a quelli attuali, allora OK (nessuna modifica reale di orario).
        // Altrimenti, se i tempi cambiano e c'è overlap, allora ERRORE.
        if (overlap && !(currentDbStart === sqlStart && currentDbEnd === sqlEnd)) {
            return res.status(400).json({
                error: "Nuovo orario non disponibile, stanza occupata"
            });
        }

        // Update (Usando date SQL)
        await bookingModel.updateBooking(bookingId, sqlStart, sqlEnd);

        res.json({ message: "Prenotazione aggiornata correttamente" });

    } catch (err) {
        console.error("Errore in updateBooking:", err);
        res.status(500).json({ error: "Errore nell'aggiornamento della prenotazione" });
    }
};


// 6. ELIMINA PRENOTAZIONE (soft delete → status='cancelled')
export const deleteBooking = async (req, res) => {
    try {
        const userId = req.session.userId;
        const bookingId = req.params.id;

        const booking = await bookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Prenotazione non trovata" });
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({ error: "Non hai permesso per eliminarla" });
        }

        await bookingModel.deleteBooking(bookingId);

        res.json({ message: "Prenotazione cancellata" });

    } catch (err) {
        console.error("Errore in deleteBooking:", err);
        res.status(500).json({ error: "Errore nella cancellazione della prenotazione" });
    }
};