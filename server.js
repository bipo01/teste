import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    connectionString: process.env.PG_URL,
});
db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM posts");
    const data = result.rows;

    res.render("index.ejs", { data: data });
});

app.get("/register", (req, res) => {
    res.render("registrar.ejs");
});

app.post("/register", async (req, res) => {
    const nome = req.body.nome;
    const user = req.body.user;
    const senha = req.body.senha;
    const confirmar = req.body.confirmar;

    const result = await db.query(
        "SELECT username FROM accounts WHERE username = $1",
        [user]
    );
    const data = result.rows;

    if (data.length > 0) {
        const exist = true;
        res.render("registrar.ejs", { exist: exist });
    } else {
        if (senha === confirmar) {
            res.render("login.ejs");
        } else {
            const incorrectPassword = true;
            res.render("registrar.ejs", {
                incorrectPassword: incorrectPassword,
            });
        }
    }
});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});
