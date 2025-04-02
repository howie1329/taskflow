import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Label,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
} from "recharts";
import { Card } from "@/components/ui/card";

const chartData = [
  { Label: "Low", item: 5, fill: "hsl(var(--primary))" },
  { Label: "Medium", item: 10, fill: "hsl(var(--primary))" },
  { Label: "High", item: 25, fill: "hsl(var(--primary))" },
];
const chartConfig = {
  Low: { label: "Low", color: "#6c20f8" },
  Medium: { label: "Medium", color: "#6c20f8" },
  High: { label: "High", color: "#6c20f8" },
};

export const RadicalChart = () => {
  return (
    <Card className="h-full w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="item"
            nameKey="Label"
            innerRadius={60}
            strokeWidth={5}
          ></Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
};
