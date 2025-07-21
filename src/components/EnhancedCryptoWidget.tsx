import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedCryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: string;
  dayHigh: number;
  dayLow: number;
  volume: number;
  volatility: number;
  momentum: string;
  aiSentiment: string;
  support: number;
  resistance: number;
}

const EnhancedCryptoWidget = () => {
  const [cryptoData, setCryptoData] = useState<EnhancedCryptoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');

  const symbols = [
    { value: 'BTCUSD', label: 'Bitcoin', icon: '₿' },
    { value: 'ETHUSD', label: 'Ethereum', icon: 'Ξ' },
    { value: 'ADAUSD', label: 'Cardano', icon: '₳' },
    { value: 'SOLUSD', label: 'Solana', icon: '◎' }
  ];

  const fetchEnhancedData = async (symbol: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('enhanced-crypto-analysis', {
        body: { symbol }
      });
      
      if (error) throw error;
      setCryptoData(data.analysis);
    } catch (error) {
      console.error('Error fetching enhanced crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedData(selectedSymbol);
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchEnhancedData(selectedSymbol), 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />;
      case 'bearish': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-fit max-h-96 overflow-y-auto">{/* Fixed overflow issue */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-primary" />
          Enhanced Crypto Analysis
          <Badge variant="outline" className="ml-auto">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbol Selector */}
        <div className="flex gap-1 overflow-x-auto">
          {symbols.map((symbol) => (
            <Button
              key={symbol.value}
              size="sm"
              variant={selectedSymbol === symbol.value ? "default" : "outline"}
              onClick={() => setSelectedSymbol(symbol.value)}
              className="whitespace-nowrap text-xs"
            >
              {symbol.icon} {symbol.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Analyzing market data...</p>
          </div>
        ) : cryptoData ? (
          <div className="space-y-3">
            {/* Price & Change */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{cryptoData.name}</h3>
                <div className={`flex items-center gap-1 ${getMomentumColor(cryptoData.momentum)}`}>
                  {getMomentumIcon(cryptoData.momentum)}
                  <span className="text-xs font-medium capitalize">{cryptoData.momentum}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${cryptoData.price?.toLocaleString() || '0'}
                </span>
                <div className={`text-sm ${(cryptoData.changePercent && parseFloat(cryptoData.changePercent) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                  {(cryptoData.changePercent && parseFloat(cryptoData.changePercent) >= 0) ? '+' : ''}{cryptoData.changePercent || '0'}%
                </div>
              </div>
            </div>

            {/* Technical Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">24h High</p>
                <p className="font-semibold text-sm">${cryptoData.dayHigh?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">24h Low</p>
                <p className="font-semibold text-sm">${cryptoData.dayLow?.toLocaleString() || '0'}</p>
              </div>
            </div>

            {/* Advanced Metrics */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volatility:</span>
                <span className={`font-medium ${(cryptoData.volatility || 0) > 5 ? 'text-red-500' : 'text-green-500'}`}>
                  {cryptoData.volatility || 0}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Support:</span>
                <span>${cryptoData.support?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Resistance:</span>
                <span>${cryptoData.resistance?.toLocaleString() || '0'}</span>
              </div>
            </div>

            {/* AI Sentiment */}
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Market Sentiment</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {cryptoData.aiSentiment || "Market analysis unavailable"}
              </p>
            </div>

            <Button 
              className="w-full" 
              size="sm"
              onClick={() => window.open('https://www.gemini.com/prices', '_blank')}
            >
              📊 View Full Analysis on Gemini
            </Button>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCryptoWidget;