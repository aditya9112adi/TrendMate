import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! 👋 I'm TrendMate, your friendly AI companion. What would you like to know about today? I can share trending news, stock updates, weather forecasts, or anything else you're curious about!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load chat history on component mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-chat-history', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data.history && data.history.length > 0) {
        const historyMessages: Message[] = data.history
          .reverse() // Show oldest first
          .map((item: any, index: number) => [
            {
              id: index * 2 + 1000,
              text: item.message,
              isUser: true,
              timestamp: new Date(item.created_at)
            },
            {
              id: index * 2 + 1001,
              text: item.response,
              isUser: false,
              timestamp: new Date(item.created_at)
            }
          ])
          .flat();

        setMessages(prev => [...historyMessages, ...prev]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(), // Use timestamp for unique ID
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Simple fallback responses for now
      let response = "I'm having a tiny moment of confusion, but I'm still here for you! 💖 Try asking me about the latest trends - I love sharing what's happening in the world!";
      
      const message = messageToSend.toLowerCase();
      if (message.includes('weather') || message.includes('temperature')) {
        response = "Check out the weather widget on the right side of your dashboard! It shows your local weather and forecast. 🌤️";
      } else if (message.includes('news') || message.includes('trending')) {
        response = "Great question! Check out the trending news section at the top of your dashboard for the latest updates! 📰";
      } else if (message.includes('crypto') || message.includes('bitcoin')) {
        response = "Looking for crypto info? Check out the crypto analysis widgets on your dashboard - they show real-time market data! 📈";
      } else if (message.includes('stock') || message.includes('market')) {
        response = "For stock updates, take a look at the stock widget on your dashboard - it has the latest market information! 📊";
      } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        response = "Hey there! 👋 I'm so happy to chat with you! What would you like to explore on your dashboard today?";
      }

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "I'm having a tiny moment of confusion, but I'm still here for you! 💖 Try asking me about the latest trends - I love sharing what's happening in the world!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "I'm having trouble responding right now, but I'm still here for you!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat with TrendMate
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs"
            >
              💾 {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {showHistory && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
            💾 Chat history is saved automatically. {messages.length > 1 ? `You have ${messages.length} messages in this session.` : 'Start chatting to build your history!'}
          </div>
        )}
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-64">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about trends, news, stocks, weather..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} size="sm" className="px-3" disabled={isLoading || !inputText.trim()}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;