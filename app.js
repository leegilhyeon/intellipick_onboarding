import express from "express";
import cors from "cors";
import "dotenv/config";
import UserRouter from "./src/routers/user.router.js";
import { swaggerUi, spec } from "./src/swagger.js";
import { errorHandler } from "./src/middlewares/error-handler.middleware.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", [UserRouter]);
app.use(errorHandler);
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(spec, { explorer: true })
);

const PORT = process.env.SERVER_PORT;

app.get("/", (req, res) => {
  res.send("Hello node!");
});

app.listen(PORT, () => {
  console.log(`${PORT} 서버가 열렸어요`);
});
