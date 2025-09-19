import { Cloud, Droplets, Wind, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

export default function Weather() {
  const { t } = useLanguage();
  const location = "Kochi"; // This could come from user preferences

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["/api/weather", location],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const weather = weatherData || {
    location: "Kochi",
    current: { temperature: 28, condition: "Partly Cloudy", humidity: 78, windSpeed: 12 },
    forecast: [],
    farmingAdvice: []
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold" data-testid="weather-title">
        {t("weather")} Dashboard - {weather.location}
      </h1>

      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Cloud className="h-12 w-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-primary mb-2" data-testid="current-temperature">
              {weather.current.temperature}°C
            </div>
            <p className="text-muted-foreground mb-4" data-testid="current-condition">
              {weather.current.condition}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-center space-x-1">
                <Droplets className="h-4 w-4" />
                <span>{weather.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <Wind className="h-4 w-4" />
                <span>{weather.current.windSpeed} km/h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">{t("todaysForecast")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>6 AM</span>
                <div className="flex items-center space-x-2">
                  <span>24°C</span>
                  <Cloud className="h-4 w-4" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>12 PM</span>
                <div className="flex items-center space-x-2">
                  <span>31°C</span>
                  <Cloud className="h-4 w-4" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>6 PM</span>
                <div className="flex items-center space-x-2">
                  <span>26°C</span>
                  <Cloud className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">{t("farmingTips")}</h3>
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              {weather.farmingAdvice.map((tip, index) => (
                <p key={index} data-testid={`farming-tip-${index}`}>• {tip}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5-Day Forecast */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("dayForecast")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {weather.forecast.map((day, index) => (
              <div key={index} className="bg-muted rounded-lg p-4" data-testid={`forecast-day-${index}`}>
                <div className="font-medium mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <Cloud className="h-8 w-8 mx-auto my-2 text-primary" />
                <div className="font-semibold">{day.high}°/{day.low}°</div>
                <div className="text-xs text-muted-foreground mt-1">{day.condition}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Insights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Eye className="mr-2" />
            Weather Insights
          </h3>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <p>• Current conditions are favorable for most farming activities</p>
              <p>• Humidity levels indicate potential for fungal diseases - monitor crops closely</p>
              <p>• Wind conditions are suitable for pesticide application</p>
              <p>• No extreme weather expected in the next 5 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
