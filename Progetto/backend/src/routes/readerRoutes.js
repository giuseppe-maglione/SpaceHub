import * as reader from "../controllers/readerController.js";

export default function readerRoutes(app) {
    app.route("/api/controlla-dati")
        .post(reader.checkData);
};
