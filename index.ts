import { parse } from "csv-parse";
import express from "express";
import * as fs from "fs";
import { Sequelize } from "sequelize-typescript";
import { Staff, Redemption } from "./models";

// Constants
const short_csv_path = "staff-id-to-team-mapping.csv";
const long_csv_path = "staff-id-to-team-mapping-long.csv";
const db_filepath = "gifts.db";

const app = express();

// Use a in memory database
const sequelize = new Sequelize({
  dialect: "sqlite",
  // storage: ":memory:",
  storage: db_filepath,
  models: [Staff, Redemption],
});

// Insert data
function insert_data() {
  fs.createReadStream(long_csv_path)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", (row) => {
      console.log(row);
      // const datetime = new Date(parseInt(row[2]));
      Staff.create({
        staff_pass_id: row[0],
        team_name: row[1],
        created_at: row[2],
      });
    });
}

const start = async (): Promise<void> => {
  try {
    const db_exists = fs.existsSync(db_filepath);

    // Synchronizes the database with the defined models
    await sequelize.sync();

    // Insert data if the database does not exist
    if (!db_exists) insert_data();

    // Task 1 : Perform lookup on representative's staff pass ID
    app.get("/lookup", async (req, res) => {
      const staff_pass_id = req.query.staff_pass_id;
      const staff = await Staff.findOne({
        where: { staff_pass_id: staff_pass_id },
      });

      if (staff === null) {
        return res.status(404).send("Not Found");
      }
      return res.status(200).json(staff);
    });

    // Task 2 : Verify if team can redeem their gift by comparing team name
    // against past redemption in the redemption data
    app.get("/verify", async (req, res) => {
      // If there is no team name, check if staff id is given
      const staff_pass_id = req.query.staff_pass_id;
      const staff = await Staff.findOne({
        where: { staff_pass_id: staff_pass_id },
      });

      // If staff does not exist, then there is nothing further to verify
      if (staff === null) {
        return res.status(404).send("Not Found");
      }

      // Only if the staff exists, and there is no redemption data
      // that it is redeemable
      const redemption = await Redemption.findOne({
        where: { team_name: staff.team_name },
      });

      if (redemption === null) {
        return res.status(200).send("Can redeem!");
      }

      return res
        .status(400)
        .send(`The team ${staff.team_name} cannot redeem their gifts again!`);
    });

    app.post("/redeem", async (req, res) => {
      const staff_pass_id = req.query.staff_pass_id;
      if (staff_pass_id == null) return res.status(404).send("Not Found");

      const staff = await Staff.findOne({
        where: { staff_pass_id: staff_pass_id },
      });
      if (staff === null) {
        return res.status(404).send("Not Found");
      }

      // If the staff team already exists on redemption, then they are
      // not allowed to redeem their gift again
      const redemption = await Redemption.findOne({
        where: { team_name: staff.team_name },
      });
      if (redemption != null) {
        const readable_date = new Date(redemption.redeemed_at);
        return res
          .status(404)
          .send(
            `${staff.team_name} has already redeemed their gifts at ${readable_date}`
          );
      }

      // Otherwise - insert new redemption
      const now = Date.now();
      Redemption.create({
        team_name: staff.team_name,
        redeemed_at: now,
      });
      return res
        .status(201)
        .send(
          `${staff.team_name} has successfully redeemed their gifts at ${now}`
        );
    });

    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (error) {
    console.error(error); // Logs any errors that occur
    process.exit(1); // Exits the process with an error status code
  }
};

start();

// const all_staff = await Staff.findAll();
// console.log(all_staff);
// return res.status(200).json(all_staff);
