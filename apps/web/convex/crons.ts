import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync models inferences",
  { hours: 12 },
  internal.models.syncModels,
);


crons.hourly(
  "delete old threads & messages",
  { minuteUTC: 1 },
  internal.chat.deleteOldThreadsAndMessages,
);

export default crons;
