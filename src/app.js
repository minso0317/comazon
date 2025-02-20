import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Prisma from "@prisma/client";
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

// error middleware
app.use((err, req, res, next) => {
  console.log("Error occured");
  console.log(err);
  if (
    err.name === "StructError" ||
    (err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002") ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    res.status(400).send({ message: err.message });
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).send({ message: err.message });
  } else {
    res.status(500).send({ message: err.message });
  }
});

// app.listen
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on ${process.env.PORT}`)
); // process.env로 포트를 띄우거나 혹시 없으면 PORT 3000 으로 띄워라
