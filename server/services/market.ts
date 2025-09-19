import { storage } from "../storage";

export interface MarketData {
  cropId: number;
  cropName: string;
  markets: Array<{
    market: string;
    price: number;
    unit: string;
    change: number;
    timestamp: string;
  }>;
  trend: "up" | "down" | "stable";
  insights: string[];
}

export async function fetchMarketPrices(): Promise<MarketData[]> {
  try {
    // Get all crops
    const crops = await storage.getAllCrops();
    const marketData: MarketData[] = [];
    
    for (const crop of crops) {
      const prices = await storage.getMarketPricesByCrop(crop.id);
      
      if (prices.length > 0) {
        // Group prices by market
        const marketPrices = prices.reduce((acc, price) => {
          if (!acc[price.market]) {
            acc[price.market] = [];
          }
          acc[price.market].push(price);
          return acc;
        }, {} as Record<string, any[]>);
        
        const markets = Object.entries(marketPrices).map(([market, priceList]) => {
          const latest = priceList[0];
          return {
            market,
            price: parseFloat(latest.price),
            unit: latest.unit,
            change: latest.priceChange ? parseFloat(latest.priceChange) : 0,
            timestamp: latest.timestamp.toISOString()
          };
        });
        
        // Determine overall trend
        const avgChange = markets.reduce((sum, m) => sum + m.change, 0) / markets.length;
        const trend = avgChange > 2 ? "up" : avgChange < -2 ? "down" : "stable";
        
        // Generate insights
        const insights = generateMarketInsights(crop, markets, trend);
        
        marketData.push({
          cropId: crop.id,
          cropName: crop.name,
          markets,
          trend,
          insights
        });
      }
    }
    
    return marketData;
  } catch (error) {
    console.error("Market data fetch error:", error);
    // Return default market data if fetch fails
    return getDefaultMarketData();
  }
}

function generateMarketInsights(crop: any, markets: any[], trend: string): string[] {
  const insights: string[] = [];
  
  // Price trend insights
  if (trend === "up") {
    insights.push(`${crop.name} prices are trending upward - good time to sell`);
  } else if (trend === "down") {
    insights.push(`${crop.name} prices are declining - consider storage if possible`);
  } else {
    insights.push(`${crop.name} prices are stable`);
  }
  
  // Market comparison insights
  if (markets.length > 1) {
    const highest = markets.reduce((max, m) => m.price > max.price ? m : max);
    const lowest = markets.reduce((min, m) => m.price < min.price ? m : min);
    
    if (highest.price > lowest.price * 1.1) {
      insights.push(`Best price at ${highest.market} market (₹${highest.price}/${highest.unit})`);
    }
  }
  
  // Seasonal insights
  const month = new Date().getMonth() + 1;
  if (crop.name.toLowerCase().includes('rice')) {
    if (month >= 10 && month <= 12) {
      insights.push("Harvest season - expect higher supply and potential price dips");
    } else if (month >= 4 && month <= 6) {
      insights.push("Pre-monsoon period - good demand for quality rice");
    }
  }
  
  return insights;
}

function getDefaultMarketData(): MarketData[] {
  return [
    {
      cropId: 1,
      cropName: "Rice",
      markets: [
        { market: "Kochi", price: 32, unit: "kg", change: 5, timestamp: new Date().toISOString() },
        { market: "Trivandrum", price: 30, unit: "kg", change: 3, timestamp: new Date().toISOString() },
        { market: "Kozhikode", price: 34, unit: "kg", change: 8, timestamp: new Date().toISOString() }
      ],
      trend: "up",
      insights: [
        "Rice prices trending upward due to increased demand",
        "Best price at Kozhikode market (₹34/kg)"
      ]
    },
    {
      cropId: 2,
      cropName: "Coconut",
      markets: [
        { market: "Kochi", price: 25, unit: "piece", change: -2, timestamp: new Date().toISOString() },
        { market: "Trivandrum", price: 23, unit: "piece", change: -1, timestamp: new Date().toISOString() },
        { market: "Kozhikode", price: 24, unit: "piece", change: -3, timestamp: new Date().toISOString() }
      ],
      trend: "down",
      insights: [
        "Coconut prices declining after monsoon season",
        "Prices expected to stabilize next week"
      ]
    },
    {
      cropId: 3,
      cropName: "Black Pepper",
      markets: [
        { market: "Kochi", price: 485, unit: "kg", change: 8, timestamp: new Date().toISOString() },
        { market: "Trivandrum", price: 492, unit: "kg", change: 12, timestamp: new Date().toISOString() },
        { market: "Kozhikode", price: 480, unit: "kg", change: 5, timestamp: new Date().toISOString() }
      ],
      trend: "up",
      insights: [
        "Strong export demand driving pepper prices up",
        "Best price at Trivandrum market (₹492/kg)"
      ]
    }
  ];
}

export async function updateMarketPrices(): Promise<void> {
  // This would typically fetch from external market APIs
  // For now, we'll simulate market price updates
  
  try {
    const crops = await storage.getAllCrops();
    const markets = ["Kochi", "Trivandrum", "Kozhikode", "Kannur", "Palakkad"];
    
    for (const crop of crops) {
      for (const market of markets) {
        // Generate realistic price variations
        const basePrice = getBasePriceForCrop(crop.name);
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const price = basePrice * (1 + variation);
        const priceChange = (Math.random() - 0.5) * 10; // ±5% change
        
        await storage.createMarketPrice({
          cropId: crop.id,
          market,
          price: price.toString(),
          unit: getUnitForCrop(crop.name),
          priceChange: priceChange.toString()
        });
      }
    }
  } catch (error) {
    console.error("Market price update error:", error);
  }
}

function getBasePriceForCrop(cropName: string): number {
  const basePrices: Record<string, number> = {
    "Rice": 30,
    "Coconut": 24,
    "Black Pepper": 480,
    "Banana": 15,
    "Rubber": 150,
    "Cardamom": 1200,
    "Ginger": 80,
    "Turmeric": 120
  };
  
  return basePrices[cropName] || 50;
}

function getUnitForCrop(cropName: string): string {
  const units: Record<string, string> = {
    "Rice": "kg",
    "Coconut": "piece",
    "Black Pepper": "kg",
    "Banana": "dozen",
    "Rubber": "kg",
    "Cardamom": "kg",
    "Ginger": "kg",
    "Turmeric": "kg"
  };
  
  return units[cropName] || "kg";
}
