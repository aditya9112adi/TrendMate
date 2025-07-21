import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
    const { symbol } = await req.json()
    
    // Enhanced Gemini API integration for deeper crypto analysis
    const cryptoSymbol = symbol || 'BTCUSD'
    
    // Get detailed ticker data from Gemini
    const [tickerResponse, statsResponse, tradesResponse] = await Promise.all([
      fetch(`https://api.gemini.com/v1/pubticker/${cryptoSymbol}`, {
        headers: { 'X-GEMINI-APIKEY': GEMINI_API_KEY }
      }),
      fetch(`https://api.gemini.com/v1/stats/${cryptoSymbol}`, {
        headers: { 'X-GEMINI-APIKEY': GEMINI_API_KEY }
      }),
      fetch(`https://api.gemini.com/v1/trades/${cryptoSymbol}?limit_trades=10`, {
        headers: { 'X-GEMINI-APIKEY': GEMINI_API_KEY }
      })
    ])

    const [tickerData, statsData, tradesData] = await Promise.all([
      tickerResponse.json(),
      statsResponse.json(),
      tradesResponse.json()
    ])

    // Calculate advanced metrics
    const currentPrice = parseFloat(tickerData.last) || 0
    const dayHigh = parseFloat(tickerData.high) || currentPrice
    const dayLow = parseFloat(tickerData.low) || currentPrice
    const volume = parseFloat(tickerData.volume?.[cryptoSymbol.slice(0, 3)]) || 0
    const volumeUSD = parseFloat(tickerData.volume?.USD) || 0
    
    // Calculate volatility safely
    const volatility = currentPrice > 0 ? ((dayHigh - dayLow) / currentPrice * 100).toFixed(2) : "0.00"
    
    // Calculate market momentum based on recent trades
    const recentTrades = tradesData.slice(0, 5)
    const priceDirection = recentTrades.length > 1 ? 
      (parseFloat(recentTrades[0].price) > parseFloat(recentTrades[recentTrades.length - 1].price) ? 'bullish' : 'bearish') : 'neutral'
    
    // Generate AI-powered market sentiment using Gemini AI
    const sentimentPrompt = `Analyze the current market sentiment for ${cryptoSymbol} based on:
    - Current price: $${currentPrice}
    - 24h high: $${dayHigh}
    - 24h low: $${dayLow}
    - Volume: ${volume} ${cryptoSymbol.slice(0, 3)}
    - Volatility: ${volatility}%
    - Recent trend: ${priceDirection}
    
    Provide a brief sentiment analysis (bullish/bearish/neutral) with reasoning in 2-3 sentences.`

    const sentimentResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sentimentPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150 }
        })
      }
    )

    const sentimentData = await sentimentResponse.json()
    const aiSentiment = sentimentData.candidates?.[0]?.content?.parts?.[0]?.text || "Market sentiment analysis unavailable"

    // Enhanced crypto analysis data
    const enhancedData = {
      symbol: cryptoSymbol.slice(0, 3),
      name: cryptoSymbol.slice(0, 3) === 'BTC' ? 'Bitcoin' : 
            cryptoSymbol.slice(0, 3) === 'ETH' ? 'Ethereum' :
            cryptoSymbol.slice(0, 3) === 'ADA' ? 'Cardano' : 'Solana',
      price: currentPrice,
      change: parseFloat(tickerData.change),
      changePercent: isNaN(parseFloat(tickerData.change)) || currentPrice === 0 ? 
        "0.00" : 
        ((parseFloat(tickerData.change) / (currentPrice - parseFloat(tickerData.change))) * 100).toFixed(2),
      dayHigh,
      dayLow,
      volume,
      volumeUSD,
      volatility: parseFloat(volatility),
      momentum: priceDirection,
      aiSentiment,
      timestamp: new Date().toISOString(),
      // Technical indicators
      support: dayLow,
      resistance: dayHigh,
      marketCap: statsData.open_24h ? (currentPrice * parseFloat(statsData.open_24h) * 1000000).toFixed(0) : null
    }

    return new Response(
      JSON.stringify({ analysis: enhancedData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Enhanced Crypto Analysis Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})