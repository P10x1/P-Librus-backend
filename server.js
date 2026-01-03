const express = require("express");
const bodyParser = require("body-parser");
const speakeasy = require("speakeasy");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ========================
// Użytkownicy (łatwo zmienić login i hasło)
// ========================
const USERS = [
  {
    id: 1,
    username: "PIOTRREJMSTP",                        // <- zmień login tutaj
    password: bcrypt.hashSync("Piotr5883", 10), // <- zmień hasło tutaj
    totpSecret: "JBSWY3DPEHPK3PXP"             // Twój sekret 2FA
  }
];

const JWT_SECRET = "P_LIBRUS_SUPER_SECRET";

// ========================
// Strona logowania
// ========================
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>P-Librus Logowanie</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f4f8;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .login-box {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
          text-align: center;
          width: 300px;
        }
        input {
          width: 90%;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          width: 95%;
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #45a049;
        }
        h1 {
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h1>P-Librus</h1>
        <form method="POST" action="/login">
          <input name="username" placeholder="Login" required><br>
          <input type="password" name="password" placeholder="Hasło" required><br>
          <input name="otp" placeholder="Kod z Authenticatora" required><br>
          <button>Zaloguj</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// ========================
// Obsługa logowania
// ========================
app.post("/login", (req, res) => {
  const { username, password, otp } = req.body;
  const user = USERS.find(u => u.username === username);

  if (!user) return res.send("Nie ma takiego użytkownika");

  if (!bcrypt.compareSync(password, user.password))
    return res.send("Złe hasło");

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token: otp,
    window: 1
  });

  if (!verified) return res.send("Zły kod 2FA");

  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: "1h"
  });

  // Przekierowanie do GitHub Pages z tokenem
  res.redirect(`https://p10x1.github.io/P-Librus2/home.html?token=${token}`);
});

// ========================
// Weryfikacja tokena JWT
// ========================
app.get("/verify", (req, res) => {
  try {
    jwt.verify(req.query.token, JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// ========================
// Start serwera
// ========================
const PORT = process.env.PORT || 3000;  // Render używa process.env.PORT
app.listen(PORT, () => console.log(`Login działa na http://localhost:${PORT}`));

);
