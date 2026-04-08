export interface LandingLink {
  href: string;
  label: string;
  isHash?: boolean;
}

export const landingNavLinks: LandingLink[] = [
  { href: "#workflow", label: "Workflow", isHash: true },
  { href: "#features", label: "Features", isHash: true },
  { href: "#ai", label: "AI", isHash: true },
  { href: "/roadmap", label: "Roadmap" },
];

export const landingFooterLinks: LandingLink[] = [
  { href: "#workflow", label: "Workflow", isHash: true },
  { href: "#features", label: "Features", isHash: true },
  { href: "#ai", label: "AI", isHash: true },
  { href: "/roadmap", label: "Roadmap" },
];
