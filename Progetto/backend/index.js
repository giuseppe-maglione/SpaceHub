import express from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { initDbPool } from "./src/services/db.js";
import cors from "cors";

// Serve a far funzionare __dirname con import ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Inizializza il DB
await initDbPool();

const app = express();
const sessionSecret = process.env.SESSION_SECRET || "super-secret-key";
const port = process.env.BACKEND_PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessioni
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,     // metti true quando sarai in HTTPS reale
        maxAge: 1000 * 60 * 60 // 1h
    }
}));

// Serve i file statici del frontend React
const buildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(buildPath));

// Rotte API
import bookingsRoutes from "./src/routes/bookingsRoutes.js";
//import readerRoutes from "./src/routes/readerRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

bookingsRoutes(app);
//readerRoutes(app);
authRoutes(app);

// Catch-all: React gestisce il routing
app.get("/", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
});

app.listen(port, () => {
    console.log("Server in ascolto su http://localhost:3000");
});
