import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";

export const ProjectStats = ({ stats }) => {
  // Calculate progress percentage
  const progress =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Circle className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Done"
          value={stats.done}
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={<Clock className="h-4 w-4 text-red-500" />}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {progress}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
