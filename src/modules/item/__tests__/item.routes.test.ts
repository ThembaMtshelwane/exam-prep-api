import request from "supertest";
import { createApp } from "../../../app";

const app = createApp();

describe("Item CRUD", () => {
  it("creates an item", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "Apple", quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Apple");
  });

  it("gets all items", async () => {
    // Arrange: create an item first
    await request(app).post("/api/items").send({ name: "Apple", quantity: 5 });

    // Act
    const res = await request(app).get("/api/items");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("updates an item", async () => {
    const create = await request(app)
      .post("/api/items")
      .send({ name: "Banana", quantity: 2 });

    const res = await request(app)
      .put(`/api/items/${create.body._id}`)
      .send({ quantity: 10 });

    expect(res.body.quantity).toBe(10);
  });

  it("deletes an item", async () => {
    const create = await request(app)
      .post("/api/items")
      .send({ name: "Orange", quantity: 3 });

    const res = await request(app).delete(`/api/items/${create.body._id}`);

    expect(res.status).toBe(204);
  });
});
