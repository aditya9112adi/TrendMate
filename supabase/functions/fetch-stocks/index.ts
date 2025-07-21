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
    const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY')!
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT']
    
    const stockData = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        )
        const data = await response.json()
        const quote = data['Global Quote']
        
        if (!quote) {
          return {
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0
          }
        }
        
        const price = parseFloat(quote['05. price'])
        const change = parseFloat(quote['09. change'])
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
        
        const companyNames: { [key: string]: string } = {
          'AAPL': 'Apple',
          'TSLA': 'Tesla', 
          'NVDA': 'NVIDIA',
          'MSFT': 'Microsoft'
        }
        
        return {
          symbol,
          name: companyNames[symbol] || symbol,
          price: price,
          change: change,
          changePercent: changePercent
        }
      })
    )

    return new Response(
      JSON.stringify({ stocks: stockData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})