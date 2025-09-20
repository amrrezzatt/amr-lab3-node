import http from "http";
import fs from "fs/promises";
import { content } from "./main.js";
console.log("🚀 ~ content:", content);
const PORT = 3000;

const cssContent = await fs.readFile("styles.css", "utf-8");
const users = await fs.readFile("users.json", "utf-8");
const parsedUsers = JSON.parse(users);
const server = http.createServer((req, res) => {
  console.log(req.url);
  const reg = new RegExp(/^\/users\/\d*$/);
  switch (req.method) {
    case "GET":
      switch (req.url) {
        case "/":
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content("menna"));
          break;
        case "/styles.css":
          console.log("hello");
          res.writeHead(200, { "Content-Type": "text/css" });
          res.end(cssContent);
          break;
        case "/users":
          res.writeHead(200, { "content-type": "application/json" });
          res.end(users);
          break;
        default:
          if (reg.test(req.url)) {
            const id = req.url.split("/")[2];
            console.log("🚀 ~ id:", id);
            const user = parsedUsers.find((u) => u.id === parseInt(id));
            if (!user) {
              res.writeHead(404, { "content-type": "text/plain" });
              res.end("NOT FOUND");
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(user));
            break;
          }
          res.writeHead(404);
          res.end(`<h1 style="color='red'"> Error!</h1>`);
          break;
      }
      break;
    case "POST":
      if (req.url === "/users") {
        let body = [];
        req
          .on("data", (chunk) => {
            body.push(chunk);
          })
          .on("end", async () => {
            try {
              body = Buffer.concat(body).toString();
              const newUser = JSON.parse(body);
              const file = await fs.readFile("users.json", "utf-8");
              const users = JSON.parse(file);
              newUser.id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
              users.push(newUser);
              await fs.writeFile("users.json", JSON.stringify(users, null, 2));
              res.writeHead(201, { "content-type": "application/json" });
              res.end(JSON.stringify(newUser));
            } catch (error) {
              res.writeHead(400, { "content-type": "text/plain" });
              res.end("error");
            }
          });
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
      break;
    case "PUT":
      if (reg.test(req.url)) {
        const id = req.url.split("/")[2];
        let body = [];
        req.on("data", (chunk) => {
          body.push(chunk);
        });
        req.on("end", async () => {
          try {
            body = Buffer.concat(body).toString();
            const updatedUser = JSON.parse(body);
            const usersFile = await fs.readFile("users.json", "utf-8");
            const usersData = JSON.parse(usersFile);
            const index = usersData.findIndex((u) => u.id === parseInt(id));
            if (index === -1) {
              res.writeHead(404, { "content-type": "text/plain" });
              res.end("NOT FOUND");
              return;
            }
            usersData[index] = { ...usersData[index], ...updatedUser };
            await fs.writeFile("users.json", JSON.stringify(usersData, null, 2));
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(usersData[index]));
          } catch (err) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end("INVALID DATA");
          }
        });
      } else {
        res.writeHead(404);
        res.end("NOT FOUND");
      }
      break;
    case "DELETE":
      if (reg.test(req.url)) {
        const id = req.url.split("/")[2];
        const usersFile = await fs.readFile("users.json", "utf-8");
        const usersData = JSON.parse(usersFile);
        const index = usersData.findIndex((u) => u.id === parseInt(id));
        if (index === -1) {
          res.writeHead(404, { "content-type": "text/plain" });
          res.end("NOT FOUND");
          return;
        }
        usersData.splice(index, 1);
        await fs.writeFile("users.json", JSON.stringify(usersData, null, 2));
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ message: "User deleted" }));
      } else {
        res.writeHead(404);
        res.end("NOT FOUND");
      }
      break;
    default:
      res.writeHead(404);
      res.end("invalid method");
      break;
  }
});

server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
