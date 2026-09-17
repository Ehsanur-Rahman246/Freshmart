import mongoose from "mongoose";

const jobStateSchema = new mongoose.Schema({
  jobName: { type: String, required: true, unique: true },
  lastRunAt: { type: Date, default: null },
});

const JobState = mongoose.model("JobState", jobStateSchema);

export default JobState;