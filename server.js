process.env.NODE_ENV = "production";

const path = require("path");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Azure Windows:
// - iisnode → PORT is a named pipe string
// - HttpPlatformHandler → PORT is a TCP port number
const port = process.env.PORT || 3000;

const app = next({
  dev: false,
  dir: path.join(__dirname),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
      .once("error", (err) => {
        console.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`Next.js ready on PORT=${port}`);
      });
  })
  .catch((err) => {
    console.error("Next.js prepare failed:", err);
    process.exit(1);
  });
