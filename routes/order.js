import express from "express";
import asyncHandler from "../src/async-handler.js";
import { assert } from "superstruct";
import { CreateOrder } from "../src/structs.js";

const orderRouter = express.Router();

orderRouter.route("/").post(
  asyncHandler(async (req, res) => {
    assert(req.body, CreateOrder);
    const { userId, orderItems } = req.body;

    // 1. get products
    const productIds = orderItems.map((orderItem) => orderItem.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    function getQuantity(productId) {
      const { quantity } = orderItems.find(
        (orderItem) => orderItem.productId === productId
      );
      return quantity;
    }

    // 2. 재고와 주문량 비교
    const isSuffcientStock = products.every((product) => {
      const { id, stock } = product;
      return stock >= getQuantity(id);
    });

    // 3. error or create order
    if (!isSuffcientStock) {
      throw new Error("Insufficient Stock");
    }

    const queries = productIds.map((productId) => {
      return prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: getQuantity(productId),
          },
        },
      });
    });

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          user: {
            connect: { id: userId },
          },
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: true,
        },
      }),
      ...queries,
    ]);
    res.status(201).send(order);
  })
);

orderRouter.route("/:id").get(
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

    order.total = total;
    res.send(order);
  })
);

export default orderRouter;
