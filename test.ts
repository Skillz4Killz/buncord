import RestManager from "./packages/rest/RestManager";

const api = new RestManager({
  token: process.env.TOKEN,
});

for (let i = 1; i <= 100; i++) {
  api.post("/channels/997202426820038756/messages", {
    body: { content: "Hello World " + i },
  });
  api.post("/channels/997933194781409380/messages", {
    body: { content: "Hello Second Channel " + i },
  });
}
