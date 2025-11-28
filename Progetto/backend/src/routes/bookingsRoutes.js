import * as auth from "../middleware/authMiddleware.js";
import * as bookings from "../controllers/bookingsController.js";

export default function bookingsRoutes(app) {
    // LISTA AULE
    app.route("/api/aule-disponibili")
        .get(bookings.listRooms);

    // CREA PRENOTAZIONE
    app.route("/api/crea-prenotazione")
        .post(auth.requireLogin, bookings.createBooking);

    // LISTA PRENOTAZIONI UTENTE
    app.route("/api/prenotazioni")
        .get(auth.requireLogin, bookings.getUserBookings);

    // PRENOTAZIONE DELL'UTENTE
    app.route("/api/prenotazioni/:id")
        .get(auth.requireLogin, bookings.getUserBookingById);

    // MODIFICA PRENOTAZIONE
    app.route("/api/prenotazioni/:id")
        .put(auth.requireLogin, bookings.updateBooking);

    // ELIMINA PRENOTAZIONE
    app.route("/api/prenotazioni/:id")
        .delete(auth.requireLogin, bookings.deleteBooking);
};
