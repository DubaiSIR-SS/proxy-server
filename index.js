import dotenv from "dotenv";
import express from "express";
import cors from "cors";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: "*",
    methods: ["OPTIONS", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/", async (req, res) => {
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.sendStatus(404);
  }
  console.log(req.body);
  let respJSON = await fetch(req.body.url, {
    method: "GET",
  });
  let resp = await respJSON.json();
  res.send(resp);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Dynamic proxy server running`);
});
