import request from "supertest";
import app from "../app";

describe("Health Check", () => {
  it("should return 200 and success message", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("School Management API is running");
  });
});

describe("API Info", () => {
  it("should return API information", async () => {
    const response = await request(app).get("/api").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.version).toBe("1.0.0");
  });
});
