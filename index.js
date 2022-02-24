const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
const CONTACTS_URL = "https://contacts.superquest.repl.co";
const NOTES_URL = "https://notes.superquest.repl.co";

// Logging
app.use(morgan("dev"));

// Info GET endpoint
app.get("/info", (req, res, next) => {
  res.send("This is a proxy service which proxies to JSONPlaceholder API.");
});

// Authorization
// app.use('', (req, res, next) => {
//     if (req.headers.authorization) {
//         next();
//     } else {
//         res.sendStatus(403);
//     }
// });

// Notes
app.use(
  "/notes",
  createProxyMiddleware({
    target: CONTACTS_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/notes`]: "",
    },
  })
);

// Contacts app
app.use(
  "/contacts",
  createProxyMiddleware({
    target: CONTACTS_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/contacts`]: "",
    },
  })
);

// Route next assets depending on referrer (might be better way to do this)
app.use(
  "/_next/*",
  createProxyMiddleware({
    target: CONTACTS_URL,
    changeOrigin: true,
    router: (req) => {
      const referrer = req.get("Referrer");
      if (!referrer) {
        throw new Error("Need referrerer");
      }
      if (referrer.includes("/contacts")) {
        return CONTACTS_URL;
      }
      if (referrer.includes("/notes")) {
        return NOTES_URL;
      }
    },
  })
);

// Start Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
