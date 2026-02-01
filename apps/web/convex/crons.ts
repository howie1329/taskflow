import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs()

crons.interval("update available models", { "hours": 6 }, api.models.updateAvailableModels)



export default crons;