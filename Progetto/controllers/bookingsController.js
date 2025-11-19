exports.listBookings = (req, res) => {
    // TODO: query DB
    res.json([
        { id: 1, stanza: "Stanza A", utente: 5, start: "10:00", end: "12:00" }
    ]);
};

exports.createBooking = (req, res) => {
    const { roomId, startTime, endTime, userId } = req.body;

    // TODO: insert nel DB

    res.json({
        message: "Prenotazione creata con successo",
        roomId,
        startTime,
        endTime
    });
};
