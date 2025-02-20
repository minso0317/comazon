import express from "express";
import asyncHandler from "../src/async-handler.js";
import { PrismaClient } from "@prisma/client";
import { assert } from "superstruct";
import { CreateProduct, PatchProduct } from "../src/structs.js";

const prisma = new PrismaClient();
const productRouter = express.Router();

productRouter
  .route("/")
  .get(
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
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateProduct);
      const product = await prisma.product.create({ data: req.body });
      res.status(201).send(product);
    })
  );

productRouter
  .route("/:id")
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
      });
      res.send(product);
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      assert(req.body, PatchProduct);
      const product = await prisma.product.update({
        where: { id },
        data: req.body,
      });
      res.send(product);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const product = await prisma.product.delete({
        where: { id },
      });
      res.sendStatus(204);
    })
  );

export default productRouter;
