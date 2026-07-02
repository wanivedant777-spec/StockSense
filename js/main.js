// ============================================
// StockSense — main.js
// Phase 2: Live Stock Data via Finnhub API
// ============================================

// Your Finnhub API key (keep this private!)
const API_KEY = 'd8tr8fhr01qhcnk5q0ugd8tr8fhr01qhcnk5q0v0'; // Stores your API key as a constant — never changes


// Indian stocks we want to track
// Finnhub uses NSE: prefix for Indian stocks
const STOCKS = [    //An array — a list of stock objects we want to fetch
  { symbol: 'NSE:RELIANCE', name: 'Reliance Industries',  elementId: 'stock-RELIANCE' },
  { symbol: 'NSE:TCS',      name: 'Tata Consultancy Svc', elementId: 'stock-TCS'      },
  { symbol: 'NSE:HDFCBANK', name: 'HDFC Bank',            elementId: 'stock-HDFCBANK' },
  { symbol: 'NSE:INFY',     name: 'Infosys',              elementId: 'stock-INFY'     },
  { symbol: 'NSE:WIPRO',    name: 'Wipro',                elementId: 'stock-WIPRO'    },
]; //The ticker code Finnhub understands — NSE: prefix for India

// ============================================
// FETCH STOCK PRICE FROM FINNHUB API
// ============================================

// This function takes one stock symbol and gets its price
async function fetchStockPrice(symbol) { //Tells JS "this function will do something that takes time"
  
  // Build the API URL - we plug in the symbol and API key
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;

  try {
    // fetch() sends a request to the URL and waits for response
    const response = await fetch(url);

    // Convert the response into a JavaScript object we can use
    const data = await response.json();

    // data looks like this:
    // { c: 2847.50, d: 34.20, dp: 1.23, h: 2860, l: 2810, o: 2813, pc: 2813 }
    // c = current price, d = change, dp = % change
    // h = high, l = low, o = open, pc = previous close

    return data;

  } catch (error) {
    // If something goes wrong (no internet, API down etc.)
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}



// ============================================
// UPDATE STOCK TABLE ROW WITH LIVE DATA
// ============================================

// This function takes live data and puts it into the HTML table
function updateStockRow(stock, data) {

  // If API returned no data, skip this stock
  if (!data || data.c === 0) return;

  // Extract the values we need from API response
  const price     = data.c.toFixed(2);      // current price, 2 decimal places
  const change    = data.d.toFixed(2);      // change amount
  const changePct = data.dp.toFixed(2);     // change percentage
  const isPositive = data.d >= 0;           // true if price went UP

  // Build the change text with arrow
  // Example: "▲ +34.20 (+1.23%)" or "▼ -12.50 (-0.45%)"
  const arrow     = isPositive ? '▲' : '▼';
  const sign      = isPositive ? '+' : '';
  const changeText = `${arrow} ${sign}${change} (${sign}${changePct}%)`;

  // Find the table row for this stock using its elementId
  const row = document.getElementById(stock.elementId);

  // If the row doesn't exist in HTML yet, skip
  if (!row) return;

  // Find the price and change cells inside this row
  const priceCell  = row.querySelector('.price-cell');
  const changeCell = row.querySelector('.change-cell');

  // Update the price cell text
  priceCell.textContent = price;

  // Update the change cell text
  changeCell.textContent = changeText;

  // Remove old color class and add new one based on direction
  changeCell.classList.remove('positive', 'negative');
  changeCell.classList.add(isPositive ? 'positive' : 'negative');
}

// ============================================
// MAIN FUNCTION — fetches all stocks at once
// ============================================

async function fetchAllStocks() {

  // Show a loading message in the table while fetching
  console.log('Fetching live stock data...');

  // Loop through every stock in our STOCKS array
  for (const stock of STOCKS) {

    // Fetch the price data for this stock
    const data = await fetchStockPrice(stock.symbol);

    // Update the HTML row with the live data
    updateStockRow(stock, data);

    // Wait 500ms before next request
    // This prevents hitting API rate limits (too many requests too fast)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('All stocks updated ✅');
}


// ============================================
// AUTO REFRESH — updates data every 30 seconds
// ============================================

// Run once immediately when page loads
fetchAllStocks();

// Then run again every 30 seconds automatically
// 30000 = 30 seconds in milliseconds
setInterval(fetchAllStocks, 30000);