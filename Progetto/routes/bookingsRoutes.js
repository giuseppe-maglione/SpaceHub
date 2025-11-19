module.exports = function (app) {
    const auth = require("../controllers/authController");
    const bookings = require("../controllers/bookingsController");

    // API protette
    app.route("/api/crea-prenotazione")
        .post(auth.requireLogin, bookings.createBooking);

    app.route("/api/prenotazioni")
        .get(auth.requireLogin, bookings.listBookings);
};
