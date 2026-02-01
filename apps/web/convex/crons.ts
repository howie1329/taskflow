import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync models from OpenRouter",
  { hours: 6 },
  internal.models.syncModels,
);

export default crons;
