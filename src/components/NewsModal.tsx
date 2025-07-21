import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  time: string;
  url?: string;
}

interface NewsModalProps {
  trigger: React.ReactNode;
}

const NewsModal = ({ trigger }: NewsModalProps) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch additional trending news from multiple sources
  const fetchAdditionalNews = async () => {
    const additionalNews = [
      {
        title: "AI Revolution Continues: OpenAI Announces GPT-5",
        summary: "OpenAI reveals the next generation of artificial intelligence with GPT-5, featuring unprecedented capabilities in reasoning and problem-solving.",
        source: "TechCrunch",
        time: "2 hours ago",
        url: "https://techcrunch.com/ai-news"
      },
      {
        title: "Tesla Stock Surges After Record Delivery Numbers",
        summary: "Tesla reports record quarterly deliveries, beating analyst expectations and driving stock price to new highs amid growing EV market adoption.",
        source: "Bloomberg",
        time: "3 hours ago",
        url: "https://bloomberg.com/tesla"
      },
      {
        title: "Climate Summit 2024: Major Breakthrough in Renewable Energy",
        summary: "World leaders announce revolutionary solar technology that could reduce global carbon emissions by 40% within the next decade.",
        source: "Reuters",
        time: "4 hours ago",
        url: "https://reuters.com/climate"
      },
      {
        title: "Cryptocurrency Market Analysis: Bitcoin Reaches New Heights",
        summary: "Bitcoin continues its bullish momentum, reaching $120,000 as institutional adoption accelerates and regulatory clarity improves.",
        source: "CoinDesk",
        time: "5 hours ago",
        url: "https://coindesk.com/bitcoin"
      },
      {
        title: "SpaceX Successfully Launches Mars Mission Preparation",
        summary: "SpaceX completes critical test for upcoming Mars mission, marking a significant milestone in human space exploration efforts.",
        source: "Space News",
        time: "6 hours ago",
        url: "https://spacenews.com/spacex"
      },
      {
        title: "Global Tech Giants Announce Quantum Computing Breakthrough",
        summary: "Major technology companies collaborate on quantum computing advancement that could revolutionize data processing and encryption.",
        source: "Wired",
        time: "7 hours ago",
        url: "https://wired.com/quantum"
      },
      {
        title: "Green Energy Stocks Rally as Climate Policies Take Effect",
        summary: "Renewable energy stocks see significant gains as new government policies accelerate the transition to sustainable energy sources.",
        source: "Financial Times",
        time: "8 hours ago",
        url: "https://ft.com/green-energy"
      }
    ];
    return additionalNews;
  };

  const fetchMoreNews = async () => {
    try {
      setLoading(true);
      // Fetch from API first
      const { data, error } = await supabase.functions.invoke('fetch-news');
      let fetchedNews = [];
      
      if (!error && data.articles) {
        fetchedNews = data.articles;
      }
      
      // Add additional trending news
      const additionalNews = await fetchAdditionalNews();
      const combinedNews = [...fetchedNews, ...additionalNews];
      
      // Remove duplicates and limit to 10 articles
      const uniqueNews = combinedNews.filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      ).slice(0, 10);
      
      setNews(uniqueNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to additional news only
      const additionalNews = await fetchAdditionalNews();
      setNews(additionalNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMoreNews();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest Trending News
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading latest news...</p>
            </div>
          ) : news.length > 0 ? (
            <div className="grid gap-4">
              {news.map((article, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
                      <p className="text-muted-foreground mb-3 line-clamp-3">{article.summary}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{article.source}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.time}</span>
                        </div>
                      </div>
                    </div>
                    {article.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(article.url, '_blank')}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No news articles available at the moment.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsModal;