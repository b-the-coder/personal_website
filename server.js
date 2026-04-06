import http from "http";

const server = http.createServer((req, res) => {
  console.log("Request received:", req.method, req.url);

  // Add CORS header to allow all origins (for testing/dev only)
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Handle preflight OPTIONS request
if (req.method === "OPTIONS") {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  return res.end();
}

  if (req.url === "/test" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { contactName, contactEmail, contactMessage } = data;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errors = [];

        if (!contactName || contactName.trim().length < 2)
          errors.push({
            field: "contactName",
            message: "Name must be at least 2 characters",
          });
        if (!contactEmail || !emailRegex.test(contactEmail))
          errors.push({
            field: "contactEmail",
            message: "Invalid email format",
          });
        if (!contactMessage || contactMessage.trim().length < 5)
          errors.push({
            field: "contactMessage",
            message: "Message must be at least 5 characters",
          });

        if (errors.length > 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ errors }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Form received successfully!" }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
