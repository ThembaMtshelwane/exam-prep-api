import { Router, Request, Response } from "express";
import { ItemModel } from "./item.model";

const router = Router();

// CREATE
router.post("/", async (req: Request, res: Response) => {
  const item = await ItemModel.create(req.body);
  res.status(201).json(item);
});

// READ ALL
router.get("/", async (_, res: Response) => {
  const items = await ItemModel.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findById(req.params.id);
  if (!item) return res.sendStatus(404);
  res.json(item);
});

// UPDATE
router.patch("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!item) return res.sendStatus(404);
  res.json(item);
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findByIdAndDelete(req.params.id);
  if (!item) return res.sendStatus(404);
  res.sendStatus(204);
});

export default router;
