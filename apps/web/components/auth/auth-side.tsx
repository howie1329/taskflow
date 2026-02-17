"use client";

interface AuthSideProps {
  mode?: "signin" | "signup";
}

export function AuthSide({ mode = "signin" }: AuthSideProps) {
  const features = [
    { icon: "✓", text: "Smart task management with AI assistance" },
    { icon: "✓", text: "Real-time collaboration and sync" },
    { icon: "✓", text: "Rich notes and project organization" },
  ];

  const title =
    mode === "signin" ? "Welcome back" : "Get started with Taskflow";
  const description =
    mode === "signin"
      ? "Continue your productivity journey. Your AI-assisted workspace is waiting."
      : "Join thousands of users managing their work smarter with AI-powered productivity.";

  return (
    <div className="flex flex-col justify-center h-full space-y-8 px-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xs font-medium text-primary">Taskflow</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
              {feature.icon}
            </span>
            <span className="text-sm text-muted-foreground">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
