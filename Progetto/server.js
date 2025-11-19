const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessioni
app.use(session({
    secret: "super-secret-key",    // cambia questa stringa
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,            // impedisce accesso tramite JS
        secure: true,             // metti true su HTTPS reale
        maxAge: 1000 * 60 * 60     // 1h
    }
}));

// File statici
app.use(express.static(path.join(__dirname, "public")));

// Rotte
require("./routes/mainRoutes")(app);
require("./routes/roomsRoutes")(app);
require("./routes/bookingsRoutes")(app);
require("./routes/apiRoutes")(app);
require("./routes/authRoutes")(app);

app.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
});
