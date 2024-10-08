import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello node!");
});

app.listen(PORT, () => {
  console.log(`${PORT} 서버가 열렸어요`);
});
