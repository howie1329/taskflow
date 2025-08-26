"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { colors, semanticColors } from "@/design-system/tokens/colors";
import { typography } from "@/design-system/tokens/typography";
import { spacing } from "@/design-system/tokens/spacing";

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">TaskFlow Design System</h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive guide to our design tokens, components, and patterns
          </p>
        </div>

        {/* Design Tokens Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Design Tokens</h2>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(semanticColors).map(([key, value]) => (
                  <ColorSwatch key={key} title={key} color={value} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(typography.fontSize).map(
                ([key, [size, { lineHeight }]]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-mono">
                        {key} - {size} / {lineHeight}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {key === "xs"
                          ? "12px"
                          : key === "sm"
                          ? "14px"
                          : key === "base"
                          ? "16px"
                          : key === "lg"
                          ? "18px"
                          : key === "xl"
                          ? "20px"
                          : key === "2xl"
                          ? "24px"
                          : key === "3xl"
                          ? "30px"
                          : key === "4xl"
                          ? "36px"
                          : key === "5xl"
                          ? "48px"
                          : "60px"}
                      </span>
                    </div>
                    <div
                      className="border-l-2 border-primary pl-4"
                      style={{ fontSize: size, lineHeight }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Spacing */}
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 4, 6, 8, 12, 16, 20, 24].map((space) => (
                  <div key={space} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-mono text-muted-foreground">
                      {space * 4}px
                    </div>
                    <div
                      className="bg-primary/20 border border-primary/30 rounded"
                      style={{ width: `${space * 4}px`, height: "20px" }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Components Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Components</h2>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="example">Example Input</Label>
                <Input id="example" placeholder="Enter text..." />
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({ title, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div
          className="w-full h-20 rounded-lg mb-2 border"
          style={{ backgroundColor: color }}
        />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </CardContent>
    </Card>
  );
}
