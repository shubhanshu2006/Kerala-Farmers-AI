import { Camera, Upload, Microscope, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useState, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DiseaseDetection {
  id: number;
  imagePath: string;
  detectedDisease: string;
  confidence: string;
  treatment: string;
  timestamp: string;
}

export default function DiseaseDetection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Mock user ID - in real app this would come from auth
  const userId = "user123";

  const { data: detections, isLoading } = useQuery({
    queryKey: ["/api/disease/history", userId],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", userId);

      const response = await fetch("/api/disease/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Disease detection completed with ${data.confidence}% confidence`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/disease/history"] });
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeMutation.mutate(selectedFile);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const conf = parseFloat(confidence);
    if (conf >= 90) return "bg-green-500";
    if (conf >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center" data-testid="disease-detection-title">
        <Microscope className="mr-2" />
        Disease Detection & Analysis
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t("uploadPlantImage")}</h3>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="image-upload-area"
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Selected plant" 
                    className="max-h-48 mx-auto rounded-lg object-cover"
                    data-testid="preview-image"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <>
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {t("dragAndDrop")}
                  </p>
                  <Button variant="outline" data-testid="choose-image-button">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("chooseImage")}
                  </Button>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="file-input"
            />

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Supports JPG, PNG up to 10MB
            </p>

            {selectedFile && (
              <Button
                className="w-full mt-4"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                data-testid="analyze-button"
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Image"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t("recentAnalysis")}</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : detections && detections.length > 0 ? (
              <div className="space-y-4">
                {detections.slice(0, 3).map((detection: DiseaseDetection) => (
                  <div key={detection.id} className="bg-muted rounded-lg p-4" data-testid={`detection-${detection.id}`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{detection.detectedDisease}</h4>
                          <Badge 
                            className={`text-white ${getConfidenceColor(detection.confidence)}`}
                            data-testid={`confidence-${detection.id}`}
                          >
                            {detection.confidence}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {detection.treatment}
                        </p>
                        <Button size="sm" variant="outline" data-testid={`view-treatment-${detection.id}`}>
                          {t("viewTreatment")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No previous analyses found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first plant image to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Treatment Recommendations */}
      {detections && detections.length > 0 && detections[0].detectedDisease !== "Healthy Plant" && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-destructive mb-3 flex items-center">
              <AlertTriangle className="mr-2" />
              {t("treatmentRecommendation")}
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>{t("disease")}:</strong> {detections[0].detectedDisease}</p>
              <p><strong>{t("severity")}:</strong> High</p>
              <p><strong>{t("treatment")}:</strong></p>
              <div className="ml-4 space-y-1">
                {detections[0].treatment.split('.').filter(Boolean).map((step, index) => (
                  <p key={index}>• {step.trim()}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Healthy Plant Message */}
      {detections && detections.length > 0 && detections[0].detectedDisease === "Healthy Plant" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <CheckCircle className="mr-2" />
              Plant Health Status
            </h3>
            <p className="text-sm text-green-700">
              Great news! Your plant appears to be healthy with no diseases detected. 
              Continue with your current care routine and monitor regularly for any changes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
