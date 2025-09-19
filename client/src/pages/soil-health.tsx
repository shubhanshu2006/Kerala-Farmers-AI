import { FlaskConical, Calendar, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

interface SoilTest {
  id: number;
  location: string;
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicMatter?: string;
  recommendations: string;
  testDate: string;
}

export default function SoilHealth() {
  const { t } = useLanguage();
  
  // Mock user ID - in real app this would come from auth
  const userId = "user123";

  const { data: latestTest, isLoading } = useQuery({
    queryKey: ["/api/soil/latest", userId],
  });

  const { data: allTests } = useQuery({
    queryKey: ["/api/soil/tests", userId],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const getNutrientLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return { value: 85, color: "bg-green-500", textColor: "text-green-600" };
      case "medium":
        return { value: 60, color: "bg-yellow-500", textColor: "text-yellow-600" };
      case "low":
        return { value: 35, color: "bg-red-500", textColor: "text-red-600" };
      default:
        return { value: 50, color: "bg-gray-500", textColor: "text-gray-600" };
    }
  };

  const getPhStatus = (ph: string) => {
    const phValue = parseFloat(ph);
    if (phValue >= 6.0 && phValue <= 7.5) {
      return { status: t("optimal"), color: "text-green-600" };
    } else if (phValue >= 5.5 && phValue <= 8.0) {
      return { status: "Good", color: "text-yellow-600" };
    } else {
      return { status: "Needs Adjustment", color: "text-red-600" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center" data-testid="soil-health-title">
        <FlaskConical className="mr-2" />
        {t("soilHealthAssessment")}
      </h1>

      {latestTest ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soil Test Results */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">{t("latestSoilTestResults")}</h3>
              <div className="space-y-4">
                {/* pH Level */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("phLevel")}</span>
                    <span className={`font-semibold ${getPhStatus(latestTest.ph).color}`} data-testid="ph-status">
                      {latestTest.ph} ({getPhStatus(latestTest.ph).status})
                    </span>
                  </div>
                  <Progress value={75} className="h-2" data-testid="ph-progress" />
                </div>

                {/* Nitrogen */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("nitrogen")}</span>
                    <span className={`font-semibold ${getNutrientLevel(latestTest.nitrogen).textColor}`} data-testid="nitrogen-status">
                      {latestTest.nitrogen}
                    </span>
                  </div>
                  <Progress 
                    value={getNutrientLevel(latestTest.nitrogen).value} 
                    className="h-2"
                    data-testid="nitrogen-progress"
                  />
                </div>

                {/* Phosphorus */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("phosphorus")}</span>
                    <span className={`font-semibold ${getNutrientLevel(latestTest.phosphorus).textColor}`} data-testid="phosphorus-status">
                      {latestTest.phosphorus}
                    </span>
                  </div>
                  <Progress 
                    value={getNutrientLevel(latestTest.phosphorus).value} 
                    className="h-2"
                    data-testid="phosphorus-progress"
                  />
                </div>

                {/* Potassium */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("potassium")}</span>
                    <span className={`font-semibold ${getNutrientLevel(latestTest.potassium).textColor}`} data-testid="potassium-status">
                      {latestTest.potassium}
                    </span>
                  </div>
                  <Progress 
                    value={getNutrientLevel(latestTest.potassium).value} 
                    className="h-2"
                    data-testid="potassium-progress"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">{t("nutrientRecommendations")}</h3>
              <div className="space-y-4">
                {/* Critical Issues */}
                {latestTest.phosphorus.toLowerCase() === "low" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="critical-action">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      {t("criticalActionRequired")}
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      Phosphorus levels are critically low. This will affect root development and flowering.
                    </p>
                    <Button variant="destructive" size="sm" data-testid="view-phosphorus-solution">
                      View Solution
                    </Button>
                  </div>
                )}

                {/* Moderate Issues */}
                {latestTest.nitrogen.toLowerCase() === "medium" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-testid="moderate-action">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      {t("moderateActionNeeded")}
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Nitrogen levels could be improved for better vegetative growth.
                    </p>
                    <Button variant="secondary" size="sm" data-testid="view-nitrogen-solution">
                      View Recommendations
                    </Button>
                  </div>
                )}

                {/* Good Status */}
                {(latestTest.potassium.toLowerCase() === "high" || parseFloat(latestTest.ph) >= 6.0) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="good-status">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      {t("goodStatus")}
                    </h4>
                    <p className="text-sm text-green-700">
                      pH and Potassium levels are optimal. Maintain current practices.
                    </p>
                  </div>
                )}

                {/* General Recommendations */}
                {latestTest.recommendations && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Detailed Recommendations</h4>
                    <p className="text-sm">{latestTest.recommendations}</p>
                  </div>
                )}
              </div>

              {/* Schedule Next Test */}
              <div className="mt-6 pt-4 border-t border-border">
                <Button className="w-full" data-testid="schedule-next-test">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("scheduleNextSoilTest")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* No Test Data */
        <Card>
          <CardContent className="p-8 text-center">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Soil Test Data</h3>
            <p className="text-muted-foreground mb-4">
              Get started by scheduling your first soil health assessment to receive personalized recommendations.
            </p>
            <Button data-testid="schedule-first-test">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Soil Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {allTests && allTests.length > 1 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Test History</h3>
            <div className="space-y-3">
              {allTests.slice(1, 4).map((test: SoilTest) => (
                <div key={test.id} className="flex items-center justify-between bg-muted rounded-lg p-3" data-testid={`test-history-${test.id}`}>
                  <div>
                    <p className="font-medium">
                      {new Date(test.testDate).toLocaleDateString()} - {test.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      pH: {test.ph} | N: {test.nitrogen} | P: {test.phosphorus} | K: {test.potassium}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
