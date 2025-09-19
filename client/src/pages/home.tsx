import { Cloud, Calendar, TrendingUp, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherAlert } from "@/components/weather-alert";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export default function Home() {
  const { t } = useLanguage();

  const quickActions = [
    {
      title: t("weather"),
      description: "28°C, Partly Cloudy",
      icon: Cloud,
      path: "/weather",
      className: "weather-gradient text-gray-800",
      testId: "weather-card"
    },
    {
      title: t("cropCalendar"),
      description: `3 ${t("tasksToday")}`,
      icon: Calendar,
      path: "/crops",
      className: "crop-calendar-gradient text-gray-800",
      testId: "crop-calendar-card"
    },
    {
      title: t("marketPrices"),
      description: "Rice ↑ ₹32/kg",
      icon: TrendingUp,
      path: "/market",
      className: "market-gradient text-gray-800",
      testId: "market-prices-card"
    },
    {
      title: t("diseaseScan"),
      description: t("uploadAndAnalyze"),
      icon: Camera,
      path: "/disease-detection",
      className: "disease-gradient text-white",
      testId: "disease-scan-card"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <WeatherAlert location="Kochi" />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.path} href={action.path}>
            <Card className={`cursor-pointer hover:scale-105 transition-transform ${action.className}`} data-testid={action.testId}>
              <CardContent className="p-4">
                <div className="text-center">
                  <action.icon className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm mt-1">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Featured Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Weather Summary */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Cloud className="mr-2" />
              Today's Weather - Kochi
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">28°C</div>
              <p className="text-muted-foreground mb-4">Partly Cloudy</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Humidity</p>
                  <p className="text-muted-foreground">78%</p>
                </div>
                <div>
                  <p className="font-medium">Wind</p>
                  <p className="text-muted-foreground">12 km/h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Disease Analysis Completed</p>
                  <p className="text-xs text-muted-foreground">Rice plant - Healthy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Market Price Update</p>
                  <p className="text-xs text-muted-foreground">Pepper prices increased by 8%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Task Reminder</p>
                  <p className="text-xs text-muted-foreground">Apply fertilizer to Field A</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
