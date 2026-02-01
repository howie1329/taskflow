import type { AuthConfig } from "convex/server";

// Authentication is currently disabled
// To add authentication, configure a provider here
// See https://docs.convex.dev/auth

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;