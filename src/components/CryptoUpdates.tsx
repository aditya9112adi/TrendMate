import { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Crypto {
  symbol: string;
  name: string;
  price: number;
  change: string;
  changePercent: string;
}

const CryptoUpdates = () => {
  const [crypto, setCrypto] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-crypto');
        if (error) throw error;
        setCrypto(data.crypto || []);
      } catch (error) {
        console.error('Error fetching crypto:', error);
        setCrypto([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();
  }, []);

  const cryptoContent = (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading crypto data...</p>
        </div>
      ) : crypto.length > 0 ? (
        crypto.map((crypto, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-smooth">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="font-medium text-sm">{crypto.symbol}</p>
              <p className="text-xs text-muted-foreground">{crypto.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">${typeof crypto.price === 'number' ? crypto.price.toLocaleString() : crypto.price}</p>
            <div className={`flex items-center gap-1 text-xs ${
              parseFloat(crypto.change) >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {parseFloat(crypto.change) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{crypto.changePercent && !isNaN(parseFloat(crypto.changePercent)) ? (parseFloat(crypto.changePercent) >= 0 ? '+' : '') + crypto.changePercent + '%' : '0.00%'}</span>
            </div>
          </div>
        </div>
      ))
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No crypto data available</p>
      )}
    </div>
  );

  return (
    <InfoCard
      title="Crypto Market"
      icon={Bitcoin}
      content={cryptoContent}
      badge={{ text: "Live", variant: "default" }}
      action={{
        text: "View Gemini Rates",
        onClick: () => window.open('https://www.gemini.com/prices', '_blank')
      }}
    />
  );
};

export default CryptoUpdates;