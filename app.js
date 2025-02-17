import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { assert } from "superstruct";
import * as dotenv from "dotenv";
import {
  CreateProduct,
  CreateUser,
  PatchProduct,
  PatchUser,
} from "./structs.js";

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      console.log("Error occured");
      console.log(e);
      if (
        e.name === "StructError" ||
        (e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002") ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.status(400).send({ message: e.message });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

app.get(
  "/users",
  asyncHandler(async (req, res) => {
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
      include: {
        userPreference: {
          select: {
            receiveEmail: true,
          },
        },
      },
    });
    res.send(users);
  })
);

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUniqueOrThrow({
      // where: { id: req.params.id }, // uuid를 사용하기 때문에 숫자열 형변환 없이 문자열로 사용한다.
      where: { id },
    });
    res.send(user);
  })
);

app.post(
  "/users",
  asyncHandler(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateUser);
      const { userPreference, ...userFields } = req.body;
      const user = await prisma.user.create({
        data: {
          ...userFields,
          userPreference: {
            create: userPreference,
          },
        },
        include: {
          userPreference: true,
        },
      });
      res.status(201).send(user);
    })
  )
);

app.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchUser);
    const user = await prisma.user.update({
      where: { id },
      data: req.body,
    });
    res.send(user);
  })
);

app.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.send("Success delete");
  })
);

app.get(
  "/users/:id/saved-products",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { savedProducts } = await prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        savedProducts: true,
      },
    });
    res.send(savedProducts);
  })
);

// 특정 유저의 Order를 모두 조회할 수 있는 GET /users/:id/orders 유저 정보는 조회할 필요 없고, 유저의 Order만 모두 조회
app.get(
  "/users/:id/orders",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { orders } = await prisma.user.findFirstOrThrow({
      where: { id },
      include: {
        orders: true,
      },
    });
    res.send(orders);
  })
);

// products
app.get(
  "/products",
  asyncHandler(async (req, res) => {
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
  })
);

app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    res.send(product);
  })
);

app.post(
  "/products",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateProduct);
    const product = await prisma.product.create({ data: req.body });
    res.status(201).send(product);
  })
);

app.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchProduct);
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    res.send(product);
  })
);

app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.delete({
      where: { id },
    });
    res.sendStatus(204);
  })
);

// orders/:id에서 Order와 관련된 OrderItem도 모두 조회
app.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findFirstOrThrow({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    // 1번 방식
    let total = 0;
    order.orderItems.forEach(({ unitPrice, quantity }) => {
      total += unitPrice * quantity;
    });

    //2번 방식
    // let total = 0;
    // order.orderItems.forEach((item) => {
    //   total += item.unitPrice * item.quantity;
    // });

    // 3번 방식
    // const total = order.orderItems.reduce((acc, { unitPrice, quantity }) => {
    //   return acc + unitPrice * quantity;
    // }, 0);

    /* =============== */
    order.total = total;
    res.send(order);
  })
);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on ${process.env.PORT}`)
); // process.env로 포트를 띄우거나 혹시 없으면 PORT 3000 으로 띄워라
