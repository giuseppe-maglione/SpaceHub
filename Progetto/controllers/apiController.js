exports.controllaDati = (req, res) => {
    const { card_uid, reader_uid, signature } = req.body;

    if (!card_uid || !reader_uid || !signature) {
        return res.status(400).json({ error: "Dati mancanti" });
    }

    // TODO: verificare firma
    // TODO: cercare prenotazione valida
    // TODO: autorizzare accesso

    res.json({
        access: true,
        message: "Accesso autorizzato"
    });
};
