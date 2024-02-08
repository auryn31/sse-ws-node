import express from "express";
import expressWebsocket from "express-ws";

const app = express();
expressWebsocket(app);
app.use(express.static("public"));

// const wss = new WebSocketServer({ port: 8080, path: "/chatroom" });
const messages = [];
const connections = [];

app.ws("/chatroom", function connection(ws, req) {
  connections.push(ws);
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    messages.push(JSON.parse(message.toString())["chat_message"]);
    const responseList = messages.map((message) => {
      return `<li>${message}</li>`;
    });

    // send message to all connection clients
    for (let connection of connections) {
      connection.send(`<ul id="chat_room">${responseList.join("\n")}</ul>`);
    }
    // ws.send(`<ul id="chat_room">${responseList.join("\n")}</ul>`);
  });

  const responseList = messages.map((message) => {
    return `<li>${message}</li>`;
  });

  ws.send(`<ul id="chat_room">${responseList.join("\n")}</ul>`);
});

app.get("/stream", (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "access-control-allow-credentials": "false",
  });

  let counter = 0;
  const interval = setInterval(() => {
    res.write(`event: counter\n`);
    counter++;
    res.write(
      `data: <div>Counter on server for your connection is: ${counter}</div>\n\n`,
    );
  }, 200);

  res.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

const listener = app.listen(process.env.PORT || 8080, () =>
  console.log(`Your app is listening on port ${listener.address().port}`),
);
