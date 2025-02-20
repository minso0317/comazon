import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import userRouter from "../routes/user.js";
import productRouter from "../routes/product.js";
import orderRouter from "../routes/order.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on ${process.env.PORT}`)
); // process.env로 포트를 띄우거나 혹시 없으면 PORT 3000 으로 띄워라
