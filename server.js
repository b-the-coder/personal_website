import http from "http";

const server = http.createServer((req, res) => {
  console.log("Request received:", req.method, req.url);

  if (req.url === "/test" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from server!" }));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
