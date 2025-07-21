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
    
    // Using Gemini Exchange API for live crypto prices
    const symbols = ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD']
    
    const cryptoData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://api.gemini.com/v1/pubticker/${symbol}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-GEMINI-APIKEY': GEMINI_API_KEY
              }
            }
          )
          
          if (!response.ok) {
            console.log(`Failed to fetch ${symbol}: ${response.status}`)
            return null
          }
          
          const data = await response.json()
          
          const symbolMap: { [key: string]: { symbol: string, name: string } } = {
            'BTCUSD': { symbol: 'BTC', name: 'Bitcoin' },
            'ETHUSD': { symbol: 'ETH', name: 'Ethereum' },
            'ADAUSD': { symbol: 'ADA', name: 'Cardano' },
            'SOLUSD': { symbol: 'SOL', name: 'Solana' }
          }
          
          const price = parseFloat(data.last)
          const change = parseFloat(data.change)
          const changePercent = (change / (price - change)) * 100
          
          return {
            symbol: symbolMap[symbol].symbol,
            name: symbolMap[symbol].name,
            price: price,
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2)
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
          return null
        }
      })
    )

    // Filter out null values and ensure we have data
    const validData = cryptoData.filter(item => item !== null)
    
    // Fallback to CoinGecko if Gemini fails
    if (validData.length === 0) {
      console.log('Gemini failed, falling back to CoinGecko')
      const fallbackResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana&vs_currencies=usd&include_24hr_change=true'
      )
      
      const fallbackData = await fallbackResponse.json()
      
      const fallbackCrypto = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: fallbackData.bitcoin?.usd || 0,
          change: (fallbackData.bitcoin?.usd_24h_change || 0).toFixed(2),
          changePercent: (fallbackData.bitcoin?.usd_24h_change || 0).toFixed(2)
        },
        {
          symbol: 'ETH', 
          name: 'Ethereum',
          price: fallbackData.ethereum?.usd || 0,
          change: (fallbackData.ethereum?.usd_24h_change || 0).toFixed(2),
          changePercent: (fallbackData.ethereum?.usd_24h_change || 0).toFixed(2)
        },
        {
          symbol: 'ADA',
          name: 'Cardano', 
          price: fallbackData.cardano?.usd || 0,
          change: (fallbackData.cardano?.usd_24h_change || 0).toFixed(2),
          changePercent: (fallbackData.cardano?.usd_24h_change || 0).toFixed(2)
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          price: fallbackData.solana?.usd || 0,
          change: (fallbackData.solana?.usd_24h_change || 0).toFixed(2),
          changePercent: (fallbackData.solana?.usd_24h_change || 0).toFixed(2)
        }
      ]
      
      return new Response(
        JSON.stringify({ crypto: fallbackCrypto }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ crypto: validData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Crypto API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})