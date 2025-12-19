import { Router, Request, Response } from "express";
import { ItemModel } from "./item.model";
import { sendResponse } from "../../utils/http.success";
import {
  ERROR_MESSAGES,
  HTTP_CODES,
  SUCCESS_MESSAGES,
} from "../../consts/http.const";
import HttpError from "../../utils/http.error";
import { validate } from "../../middleware/validate.middleware";
import { createItemSchema } from "./item.schema";

const router = Router();

// CREATE
router.post(
  "/",
  validate(createItemSchema),
  async (req: Request, res: Response) => {
    const item = await ItemModel.create(req.body);
    sendResponse(
      res,
      HTTP_CODES.CREATED,
      SUCCESS_MESSAGES.RESOURCE_CREATED,
      item
    );
  }
);

// READ ALL
router.get("/", async (_, res: Response) => {
  const items = await ItemModel.find();

  if (!items)
    throw new HttpError(
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    );

  sendResponse(res, HTTP_CODES.OK, SUCCESS_MESSAGES.RESOURCES_FETCHED, items);
});

// READ ONE
router.get("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findById(req.params.id);

  if (!item)
    throw new HttpError(HTTP_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);

  sendResponse(res, HTTP_CODES.OK, SUCCESS_MESSAGES.RESOURCES_FETCHED, item);
});

// UPDATE
router.patch("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!item)
    throw new HttpError(HTTP_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);

  sendResponse(res, HTTP_CODES.OK, SUCCESS_MESSAGES.RESOURCE_UPDATED, item);
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  const item = await ItemModel.findByIdAndDelete(req.params.id);
  if (!item)
    throw new HttpError(HTTP_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);

  sendResponse(res, HTTP_CODES.OK, SUCCESS_MESSAGES.RESOURCE_DELETED);
});

export default router;
