import z from "zod";

export const itemSchema = z.object({
  name: z.string().min(3, "Name should be at least 3 characters long"),
  quantity: z.number().positive().default(0),
});

export const createItemSchema = z.object({
  body: itemSchema,
});
