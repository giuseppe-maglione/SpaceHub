module.exports = function (app) {
    const rooms = require("../controllers/roomsController");

    app.route("/api/aule-disponibili")
        .get(rooms.listAvailableRooms);
};
