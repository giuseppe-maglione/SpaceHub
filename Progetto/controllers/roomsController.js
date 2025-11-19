exports.listAvailableRooms = (req, res) => {
    // TODO: recuperare dal DB
    res.json([
        { id: 1, nome: "Stanza A", disponibile: true },
        { id: 2, nome: "Stanza B", disponibile: false },
        { id: 3, nome: "Stanza C", disponibile: true }
    ]);
};
