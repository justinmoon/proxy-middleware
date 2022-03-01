const express = require("express");
const morgan = require("morgan");
const bodyParser = require('body-parser')
const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
const app = express();
var router = undefined
var routes = {
  "/contacts": "https://contacts.superquest.repl.co",
  // "/notes": "https://notes.superquest.repl.co",
}
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Configuration
const PORT = 3000;
const HOST = "0.0.0.0";

// Logging
app.use(morgan("dev"));

// this should be the only thing on your app
app.use(function(req, res, next) {
  // this needs to be a function to hook on whatever the current router is
  router(req, res, next)
})

function updateRouter() {
  router = express.Router()

  for (const [from, to] of Object.entries(routes)) {
    console.log(`${from} -> ${to}`)
    app.use(
      from,
      createProxyMiddleware({
        target: to,
        changeOrigin: true,
        pathRewrite: {
          [`^${from}`]: "",
        },
      })
    );
  }

  // Hack for next.js
  app.use(
    "/_next/*",
    createProxyMiddleware({
      target: "/",
      changeOrigin: true,
      router: (req) => {
        const referrer = req.get("Referrer");
        if (!referrer) {
          throw new Error("Need referrerer");
        }
        for (const [from, to] of Object.entries(routes)) {
          if (referrer.includes(from)) {
            return to;
          }
        }
      },
    })
  );

  // app.get("/", (req, res, next) => {
  //   res.send("<a href='/notes'>Notes</a> | <a href='/contacts'>Contacts</a>");
  // });

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  app.post('/', urlencodedParser, (req, res) => {
    const to = req.body.url
    const from = req.body.url.slice(8) // chop of "https://"
    routes["/" + from] = to
    
    console.log("updated routes", routes)
    
    // TODO: persist this change
    updateRouter()
    
    // console.log('Got body:', req.body);
    res.redirect(from);
  });
}

updateRouter()

// Start Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
