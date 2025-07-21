import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const TrendMateHero = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-hero text-white py-20 px-6 text-center">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-full animate-pulse-glow">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-bold">TrendMate</h1>
          <Sparkles className="w-6 h-6 animate-float" />
        </div>
        
        <p className="text-xl text-white/90 mb-2 max-w-2xl mx-auto">
          Hey {user?.email?.split('@')[0] || 'friend'}! 👋 
        </p>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Ready for your personalized dose of trending news, stocks, weather, and crypto? 
          Your AI companion is here to make staying informed feel like a warm hug! 💖
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 transition-smooth shadow-glow"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore My Trends
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="group border-white/30 text-black bg-white/90 hover:bg-white hover:border-red-300 transition-all duration-300 transform hover:scale-105 hover:shadow-glow animate-fade-in"
            onClick={handleSignOut}
          >
            <span className="group-hover:animate-pulse">✨ Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrendMateHero;