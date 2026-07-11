import express from "express";
import { loginRouter } from "./router/index";
import {orderbookRouter} from "./router/order"

const app = express();

app.use(express.json());

app.use("/api/v1", loginRouter);
app.use("/api/v1", orderbookRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
