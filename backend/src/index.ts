import express from "express";
import cors from "cors";
import userRouter from "./router/user";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);

app.listen(3000, () => {
  console.log("server running on 3000");
});
