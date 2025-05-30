import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  additionalInfo?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  additionalInfo,
}: StatCardProps) {
  return (
    <Card x-chunk="dashboard-05-chunk-1">
      <CardHeader className="pb-2">
        {icon}
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{additionalInfo}</div>
      </CardContent>
    </Card>
  );
}
