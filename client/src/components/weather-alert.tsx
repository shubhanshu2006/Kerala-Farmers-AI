import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface WeatherAlertProps {
  location: string;
}

export function WeatherAlert({ location }: WeatherAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: alerts } = useQuery({
    queryKey: ["/api/weather/alerts", location],
    enabled: !!location,
  });

  if (dismissed || !alerts?.alerts?.length) {
    return null;
  }

  return (
    <Alert className="bg-warning text-warning-foreground border-warning/20" data-testid="weather-alert">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold">Weather Alert</p>
          <p className="text-sm opacity-90">{alerts.alerts[0]}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDismissed(true)}
          className="ml-3 bg-warning-foreground text-warning hover:bg-warning-foreground/90"
          data-testid="dismiss-alert"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
