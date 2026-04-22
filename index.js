import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 ENV VARIABLES (set these in Koyeb)
const LUA_API_KEY = process.env.LUA_API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const LUA_BASE_URL = "https://api.luaobfuscator.com/v1";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.text({ limit: "50mb", type: "text/plain" }));

// 🔒 Basic protection middleware
function auth(req, res, next) {
    if (req.headers["auth"] !== SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
}

// ✅ Create new script session
app.post("/api/obfuscate/newscript", auth, async (req, res) => {
    try {
        const luaCode = typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body);

        const response = await fetch(`${LUA_BASE_URL}/obfuscator/newscript`, {
            method: "POST",
            headers: {
                "apikey": LUA_API_KEY,
                "content-type": "text/plain"
            },
            body: luaCode
        });

        const data = await response.text();
        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).json({
            message: "Proxy error: " + err.message,
            sessionId: null
        });
    }
});

// ✅ Obfuscate script
app.post("/api/obfuscate/obfuscate", auth, async (req, res) => {
    try {
        const sessionId = req.headers["sessionid"];

        const response = await fetch(`${LUA_BASE_URL}/obfuscator/obfuscate`, {
            method: "POST",
            headers: {
                "apikey": LUA_API_KEY,
                "sessionId": sessionId,
                "content-type": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.text();
        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).json({
            message: "Proxy error: " + err.message,
            code: null
        });
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});