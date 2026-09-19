import cron from "node-cron";
import Driver from "../models/Driver.js";
import JobState from "../models/JobState.js";
import {
  DRIVER_SHUFFLE_CHECK_INTERVAL,
  DRIVER_SHUFFLE_GAP_MS,
} from "../config/time.js";

const pickRandomZone = (zones, excludeZone) => {
  const candidates = zones.filter((z) => z !== excludeZone);
  const pool = candidates.length > 0 ? candidates : zones;
  return pool[Math.floor(Math.random() * pool.length)];
};

const shuffleAvailableDrivers = async () => {
  const drivers = await Driver.find({ isAvailable: true }).populate(
    "courier",
    "zonesCovered",
  );

  for (const driver of drivers) {
    const zones = driver.courier?.zonesCovered;
    if (!zones || zones.length === 0) continue;

    const newZone = pickRandomZone(zones, driver.currentZone);

    if (newZone !== driver.currentZone) {
      driver.currentZone = newZone;
      await driver.save();
    }
  }
};

export const startDriverShuffleScheduler = () => {
  cron.schedule(DRIVER_SHUFFLE_CHECK_INTERVAL, async () => {
    try {
      const jobState = await JobState.findOneAndUpdate(
        { jobName: "driverShuffle" },
        { $setOnInsert: { lastRunAt: null } },
        { upsert: true, returnDocument: "after" },
      );

      const lastRun = jobState.lastRunAt ? jobState.lastRunAt.getTime() : 0;

      if (Date.now() - lastRun < DRIVER_SHUFFLE_GAP_MS) return;

      await JobState.updateOne(
        { jobName: "driverShuffle" },
        { $set: { lastRunAt: new Date() } },
      );

      await shuffleAvailableDrivers();
    } catch (error) {
      console.error("Driver shuffle error:", error);
    }
  });

  console.log("Driver shuffle scheduler started");
};