import { Sprout, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Crops() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: crops } = useQuery({
    queryKey: ["/api/crops"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks", "upcoming", "user123"], // This would be the actual user ID
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}/complete`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });

  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate({ taskId, completed: true });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center" data-testid="crops-title">
        <Sprout className="mr-2" />
        AI Crop Advisory
      </h1>

      {/* Crop Selection */}
      <Card>
        <CardContent className="p-6">
          <label className="block text-sm font-medium mb-2">{t("selectYourCrop")}</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop} data-testid="crop-selector">
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("chooseCrop")} />
            </SelectTrigger>
            <SelectContent>
              {crops?.map((crop: any) => (
                <SelectItem key={crop.id} value={crop.id.toString()}>
                  {crop.nameLocal?.en || crop.name} ({crop.nameLocal?.ml || crop.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {selectedCrop && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <Sprout className="mr-2 text-accent" />
              {t("aiRecommendations")} for Rice Cultivation
            </h3>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">Based on current weather conditions, it's optimal time for transplanting rice seedlings in your region.</p>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <p className="text-sm">Maintain water level at 2-3 inches during vegetative growth stage.</p>
              </div>
              <div className="flex items-start space-x-3">
                <Sprout className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-sm">Apply nitrogen fertilizer (46kg/hectare) split into 3 doses for better yield.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farming Calendar */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Calendar className="mr-2" />
            {t("thisWeeksTasks")}
          </h3>
          <div className="space-y-3">
            {tasks?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between bg-muted rounded-lg p-3" data-testid={`task-${task.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === "high" ? "bg-red-500" : 
                    task.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                  }`}></div>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()} • {task.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.completed ? (
                    <Badge variant="default" className="bg-green-500">Completed</Badge>
                  ) : (
                    <>
                      <Badge variant={
                        task.priority === "high" ? "destructive" : 
                        task.priority === "medium" ? "secondary" : "outline"
                      }>
                        {task.priority}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completeTaskMutation.isPending}
                        data-testid={`complete-task-${task.id}`}
                      >
                        {t("markDone")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {(!tasks || tasks.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming tasks. Check back later or add new farming activities.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
