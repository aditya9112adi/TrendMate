import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  action?: {
    text: string;
    onClick: () => void;
    customAction?: React.ReactNode;
  };
  className?: string;
}

const InfoCard = ({ title, icon: Icon, content, badge, action, className = "" }: InfoCardProps) => {
  return (
    <Card className={`transition-smooth hover:shadow-card hover:scale-[1.02] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {badge && (
          <Badge variant={badge.variant || "default"} className="text-xs">
            {badge.text}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {content}
          {action && (
            action.customAction || (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={action.onClick}
                className="w-full transition-bounce hover:bg-primary hover:text-primary-foreground"
              >
                {action.text}
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;