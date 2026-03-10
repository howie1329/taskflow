import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync models inferences",
  { hours: 12 },
  internal.models.syncModels,
);

crons.daily(
  "delete old threads & messages",
  { hourUTC: 1, minuteUTC: 0 },
  internal.chat.deleteOldThreadsAndMessages,
);

export default crons;
