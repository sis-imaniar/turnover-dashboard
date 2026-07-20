const http = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "8080", 10);
const host = "0.0.0.0";

const app = next({
  dev: false,
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  server.listen(port, host, () => {
    console.log(`Next server running at http://${host}:${port}`);
  });
});
