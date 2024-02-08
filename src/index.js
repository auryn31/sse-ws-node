import express from "express";
import expressWebsocket from "express-ws";

const app = express();
expressWebsocket(app);
app.use(express.static("public"));

const messages = [];
const connections = [];
app.ws("/chatroom", function connection(ws, req) {
  connections.push(ws);
  ws.on("message", function incoming(message) {
    const parsedMessage = JSON.parse(message.toString())["chat_message"];
    messages.push(parsedMessage);
    const messagesList = messages.map((message) => {
      return `<li>${message}</li>`;
    });
    connections.forEach((connection) => {
      connection.send(`<ul id='chat_room'>${messagesList.join("")}</ul>`);
    });
  });

  const messagesList = messages.map((message) => {
    return `<li>${message}</li>`;
  });
  ws.send(`<ul id='chat_room'>${messagesList.join("")}</ul>`);
});

app.get("/stream", (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    res.write(`event: counter\n`);
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
