import { app, sequelize } from "./app";
import { Staff, Redemption } from "./models";
import { beforeAll, expect, test, describe, afterAll } from "@jest/globals";
import request from "supertest";

// Setup
beforeAll(async () => {
  await sequelize.sync();

  // Create some test specific data
  await Staff.create({
    staff_pass_id: "TEST_123456789",
    team_name: "TEST_TEAM1",
    created_at: 1610793973889,
  });
  await Staff.create({
    staff_pass_id: "TEST_12345678",
    team_name: "TEST_TEAM2",
    created_at: 1610793973890,
  });
  await Staff.create({
    staff_pass_id: "TEST_1234567",
    team_name: "TEST_TEAM3",
    created_at: 1610793973895,
  });

  // Make one of the teams redeem
  await Redemption.create({
    team_name: "TEST_TEAM2",
    redeemed_at: 1610793973891,
  });
});

describe("/lookup", () => {
  test("GET /lookup 200", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "BOSS_DNLHLUFFJ7E9" });

    expect(res.statusCode).toEqual(200);
  });

  test("GET /lookup 200 fake data", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "TEST_123456789" });

    expect(res.statusCode).toEqual(200);
  });

  test("GET /lookup 404", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "HEYO_ITS_ME" });

    expect(res.statusCode).toEqual(404);
  });
});

describe("/verify", () => {
  test("GET /verify 200", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "BOSS_DNLHLUFFJ7E9" });

    expect(res.statusCode).toEqual(200);
  });

  test("GET /verify 200 fake data", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "TEST_123456789" });

    expect(res.statusCode).toEqual(200);
  });

  test("GET /verify 400", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "HEYO_ITS_ME" });

    expect(res.statusCode).toEqual(404);
  });

  test("GET /verify 404", async () => {
    const res = await request(app)
      .get("/lookup")
      .query({ staff_pass_id: "HEYO_ITS_ME" });

    expect(res.statusCode).toEqual(404);
  });
});

describe("/redeem", () => {
  // Unclaimed user
  test("POST /redeem 201", async () => {
    const res = await request(app)
      .post("/redeem")
      .query({ staff_pass_id: "TEST_123456789" });
    expect(res.statusCode).toEqual(201);
  });

  test("POST /redeem 404", async () => {
    const res = await request(app)
      .post("/redeem")
      .query({ staff_pass_id: "TEST_12345678" });
    expect(res.statusCode).toEqual(404);
  });

  test("POST /redeem twice", async () => {
    // First time redeeming should be fine
    const res = await request(app)
      .post("/redeem")
      .query({ staff_pass_id: "TEST_1234567" });
    expect(res.statusCode).toEqual(201);

    // Should fail as there exists a previous redemption
    const res_after = await request(app)
      .post("/redeem")
      .query({ staff_pass_id: "TEST_1234567" });
    expect(res_after.statusCode).toEqual(404);
  });
});

// Teardown
afterAll(async () => {
  await Staff.destroy({
    where: {
      team_name: "TEST_TEAM1",
    },
  });
  await Staff.destroy({
    where: {
      team_name: "TEST_TEAM2",
    },
  });
  await Staff.destroy({
    where: {
      team_name: "TEST_TEAM3",
    },
  });
  await Redemption.destroy({
    where: {
      team_name: "TEST_TEAM1",
    },
  });
  await Redemption.destroy({
    where: {
      team_name: "TEST_TEAM2",
    },
  });
  await Redemption.destroy({
    where: {
      team_name: "TEST_TEAM3",
    },
  });

  await sequelize.close();
});
