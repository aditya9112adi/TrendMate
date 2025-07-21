import { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import NewsModal from "./NewsModal";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  time: string;
  url?: string;
}

const TrendingNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-news');
        if (error) throw error;
        setNews(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const newsContent = (
    <div className="space-y-3">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Fetching latest news...</p>
        </div>
      ) : news.length > 0 ? (
        news.map((article, index) => (
          <div key={index} className="border-l-2 border-primary/30 pl-3 py-2 hover:border-primary transition-smooth">
            <h4 className="font-medium text-sm mb-1">{article.title}</h4>
            <p className="text-xs text-muted-foreground mb-2">{article.summary}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{article.source}</span>
              <span>{article.time}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No news available</p>
      )}
    </div>
  );

  return (
    <InfoCard
      title="Trending News"
      icon={Newspaper}
      content={newsContent}
      badge={{ text: "Live", variant: "default" }}
      action={{
        text: "View All News",
        onClick: () => {}, // Will be handled by NewsModal
        customAction: (
          <NewsModal trigger={
            <Button variant="ghost" size="sm" className="text-xs">
              View All News
            </Button>
          } />
        )
      }}
    />
  );
};

export default TrendingNews;