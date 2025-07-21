import TrendingNews from "./TrendingNews";
import StockUpdates from "./StockUpdates";
import WeatherWidget from "./WeatherWidget";
import CryptoUpdates from "./CryptoUpdates";
import ChatInterface from "./ChatInterface";
import EnhancedCryptoWidget from "./EnhancedCryptoWidget";
import SentimentAnalysis from "./SentimentAnalysis";
import { ErrorBoundary, ErrorFallback } from "./ui/error-boundary";

const TrendMateDashboard = () => {
  return (
    <div id="dashboard" className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Your Personal Trend Dashboard</h2>
        <p className="text-muted-foreground">Stay informed with real-time updates from your friendly AI companion</p>
      </div>

      {/* Enhanced Layout with Better Sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area - News and Chat */}
        <div className="lg:col-span-8 space-y-6">
          <TrendingNews />
          <div className="grid md:grid-cols-2 gap-4">
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
              <div className="h-fit">
                <EnhancedCryptoWidget />
              </div>
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
              <div className="h-fit">
                <SentimentAnalysis />
              </div>
            </ErrorBoundary>
          </div>
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            <ChatInterface />
          </ErrorBoundary>
        </div>

        {/* Sidebar - Market Updates and Weather */}
        <div className="lg:col-span-4 space-y-6">
          <WeatherWidget />
          <StockUpdates />
          <CryptoUpdates />
        </div>
      </div>
    </div>
  );
};

export default TrendMateDashboard;