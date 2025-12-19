import request from "supertest";
import { createApp } from "../../../app";
import { HTTP_CODES } from "../../../consts/http.const";

const app = createApp();

describe("Item CRUD", () => {
  it("creates an item", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "Apple", quantity: 5 });

    expect(res.status).toBe(HTTP_CODES.CREATED);
    expect(res.body.data.name).toBe("Apple");
  });

  it("gets all items", async () => {
    await request(app).post("/api/items").send({ name: "Apple", quantity: 5 });

    const res = await request(app).get("/api/items");

    expect(res.status).toBe(HTTP_CODES.OK);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("updates an item", async () => {
    const create = await request(app)
      .post("/api/items")
      .send({ name: "Banana", quantity: 2 });

    const res = await request(app)
      .patch(`/api/items/${create.body.data._id}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(HTTP_CODES.OK);
    expect(res.body.data.quantity).toBe(10);
  });

  it("deletes an item", async () => {
    const create = await request(app)
      .post("/api/items")
      .send({ name: "Orange", quantity: 3 });

    const res = await request(app).delete(`/api/items/${create.body.data._id}`);

    expect(res.status).toBe(HTTP_CODES.OK);
  });
});
