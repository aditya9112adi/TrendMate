import { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockUpdates = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-stocks');
        if (error) throw error;
        setStocks(data.stocks || []);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const stockContent = (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading stock data...</p>
        </div>
      ) : stocks.length > 0 ? (
        stocks.map((stock, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-smooth">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">${stock.price}</p>
            <div className={`flex items-center gap-1 text-xs ${
              stock.change >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {stock.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)</span>
            </div>
          </div>
        </div>
      ))
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No stock data available</p>
      )}
    </div>
  );

  return (
    <InfoCard
      title="Stock Updates"
      icon={TrendingUp}
      content={stockContent}
      badge={{ text: "Real-time", variant: "secondary" }}
      action={{
        text: "View Portfolio",
        onClick: () => window.open('https://finance.yahoo.com/portfolios', '_blank')
      }}
    />
  );
};

export default StockUpdates;