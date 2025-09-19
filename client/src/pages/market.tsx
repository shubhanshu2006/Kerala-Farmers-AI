import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketPrice {
  market: string;
  price: number;
  unit: string;
  change: number;
  timestamp: string;
}

interface MarketData {
  cropId: number;
  cropName: string;
  markets: MarketPrice[];
  trend: "up" | "down" | "stable";
  insights: string[];
}

export default function Market() {
  const { t } = useLanguage();

  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market/prices"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const markets: MarketData[] = marketData || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <ArrowUp className="h-3 w-3 text-green-600" />;
    } else if (change < 0) {
      return <ArrowDown className="h-3 w-3 text-red-600" />;
    }
    return <Minus className="h-3 w-3 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center" data-testid="market-title">
        <TrendingUp className="mr-2" />
        {t("marketPrices")} & Trends
      </h1>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {markets.slice(0, 3).map((market) => {
          const latestPrice = market.markets[0];
          if (!latestPrice) return null;

          return (
            <Card key={market.cropId} className="bg-muted" data-testid={`price-card-${market.cropName.toLowerCase()}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{market.cropName}</h3>
                  <div className={`flex items-center space-x-1 text-sm ${getChangeColor(latestPrice.change)}`}>
                    {getChangeIcon(latestPrice.change)}
                    <span>{latestPrice.change > 0 ? '+' : ''}{latestPrice.change.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  ₹{latestPrice.price.toFixed(0)}/{latestPrice.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(latestPrice.timestamp).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Market Insights */}
      {markets.length > 0 && markets[0].insights && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-accent mb-3 flex items-center">
              <TrendingUp className="mr-2" />
              {t("marketInsights")}
            </h3>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                {markets.flatMap(market => market.insights).slice(0, 4).map((insight, index) => (
                  <p key={index} data-testid={`insight-${index}`}>• {insight}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("priceComparison")} - Different Markets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="price-comparison-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2">Crop</th>
                  <th className="text-left pb-2">Kochi Market</th>
                  <th className="text-left pb-2">Trivandrum Market</th>
                  <th className="text-left pb-2">Kozhikode Market</th>
                  <th className="text-left pb-2">{t("bestPrice")}</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => {
                  const kochiPrice = market.markets.find(m => m.market === "Kochi");
                  const trivandrumPrice = market.markets.find(m => m.market === "Trivandrum");
                  const kozhikodePrice = market.markets.find(m => m.market === "Kozhikode");
                  
                  const prices = [kochiPrice, trivandrumPrice, kozhikodePrice].filter(Boolean);
                  const bestPrice = prices.reduce((max, price) => 
                    !max || (price && price.price > max.price) ? price : max, null as MarketPrice | null);

                  return (
                    <tr key={market.cropId} className="border-b border-border" data-testid={`price-row-${market.cropName.toLowerCase()}`}>
                      <td className="py-2 font-medium">{market.cropName}</td>
                      <td className={`py-2 ${kochiPrice && bestPrice && kochiPrice.market === bestPrice.market ? 'text-green-600 font-semibold' : ''}`}>
                        {kochiPrice ? `₹${kochiPrice.price.toFixed(0)}/${kochiPrice.unit}` : '-'}
                      </td>
                      <td className={`py-2 ${trivandrumPrice && bestPrice && trivandrumPrice.market === bestPrice.market ? 'text-green-600 font-semibold' : ''}`}>
                        {trivandrumPrice ? `₹${trivandrumPrice.price.toFixed(0)}/${trivandrumPrice.unit}` : '-'}
                      </td>
                      <td className={`py-2 ${kozhikodePrice && bestPrice && kozhikodePrice.market === bestPrice.market ? 'text-green-600 font-semibold' : ''}`}>
                        {kozhikodePrice ? `₹${kozhikodePrice.price.toFixed(0)}/${kozhikodePrice.unit}` : '-'}
                      </td>
                      <td className="py-2">
                        {bestPrice && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {bestPrice.market}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* No Data State */}
      {(!markets || markets.length === 0) && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Market Data Available</h3>
            <p className="text-muted-foreground">
              Market price data is currently unavailable. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
