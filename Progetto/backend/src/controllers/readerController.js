import { cardModel } from "../models/cardModel.js";
import { readerModel } from "../models/readerModel.js";
import { bookingModel } from "../models/bookingModel.js";
import { logModel } from "../models/logModel.js";

// supponiamo che tu abbia una funzione verifySignature(data, signature, publicKey)
import { verifySignature } from "../utils/cryptoUtils.js";

export const checkData = async (req, res) => {
  try {
    const { card_uid, reader_uid, signature } = req.body;

    if (!card_uid || !reader_uid || !signature) {
      return res.status(400).json({ error: "Dati mancanti" });
    }

    // 1. Recupera la card
    const card = await cardModel.getCardByUID(card_uid);
    if (!card || !card.active) {
      await logModel.createLog(null, reader_uid, false, "Card non valida o inattiva");
      return res.status(401).json({ access: false, message: "Card non valida" });
    }

    // 2. Recupera il reader
    const reader = await readerModel.getReaderByUID(reader_uid);
    if (!reader || !reader.is_active) {
      await logModel.createLog(card.id, null, false, "Reader non valido o inattivo");
      return res.status(401).json({ access: false, message: "Reader non valido" });
    }

    // 3. Verifica firma
    const validSignature = verifySignature({ card_uid, reader_uid }, signature, reader.public_key);
    if (!validSignature) {
      await logModel.createLog(card.id, reader.id, false, "Firma non valida");
      return res.status(401).json({ access: false, message: "Firma non valida" });
    }

    // 4. Controlla prenotazione attiva per la stanza
    const now = new Date();
    const booking = await bookingModel.getActiveBookingForUserInRoom(
      card.user_id,
      reader.room_id,
      now
    );

    if (!booking) {
      await logModel.createLog(card.id, reader.id, false, "Nessuna prenotazione attiva");
      return res.status(403).json({ access: false, message: "Nessuna prenotazione valida in questo momento" });
    }

    // 5. Accesso consentito
    await logModel.createLog(card.id, reader.id, true, "Accesso autorizzato");

    return res.json({ access: true, message: "Accesso autorizzato" });

  } catch (err) {
    console.error("Errore in checkData:", err);
    return res.status(500).json({ access: false, message: "Errore interno server" });
  }
};

