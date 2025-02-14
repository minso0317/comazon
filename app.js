import express from "express";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.get("/users", async (req, res) => {
  // 쿼리 파라미터 추가
  const { offset = 0, limit = 10, order = "newest" } = req.query; // offset과 limit를 활용하여  pagenation이 가능, newest: 생성일 기준으로 내림차순 // query에는 문자열
  let orderBy;
  switch (order) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
    default:
      orderBy = { createdAt: "desc" };
  }
  const users = await prisma.user.findMany({
    orderBy: orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    // where: { id: req.params.id }, // uuid를 사용하기 때문에 숫자열 형변환 없이 문자열로 사용한다.
    where: { id },
  });
  res.send(user);
});

app.post("/users", async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.status(201).send(user);
});

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
  });
  res.send(user);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id },
  });
  res.send("Success delete");
});

// products
app.get("/products", async (req, res) => {
  const { offset = 0, limit = 10, order = "newest", category } = req.query;
  let orderBy;
  switch (order) {
    case "priceLowest":
      orderBy = { price: "asc" };
      break;
    case "priceHighest":
      orderBy = { price: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
    default:
      orderBy = { createdAt: "desc" };
  }

  const where = category ? { category } : {}; // 필터조건이 없을 땐 {}

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  res.send(products);
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
  });
  res.send(product);
});

app.post("/products", async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).send(product);
});

app.patch("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
  });
  res.send(product);
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.delete({
    where: { id },
  });
  res.sendStatus(204);
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on ${process.env.PORT}`)
); // process.env로 포트를 띄우거나 혹시 없으면 PORT 3000 으로 띄워라
