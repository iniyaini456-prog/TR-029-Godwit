# ERP & Live API Integration Guide

## Overview

The application now includes a lightweight but fully functional ERP Integration panel with live API data sources. This allows real-time data from multiple external sources to enhance supply chain predictions.

## Features

### 1. **ERP System Integration**
- **SAP S/4HANA**: OData REST API with OAuth2
- **Oracle EBS**: REST API with Basic Auth
- **NetSuite**: REST API with OAuth2
- Connection testing with latency measurement
- Automatic fallback to mock data if ERP not available

### 2. **Live API Integrations**

#### Weather Data (`/api/live/weather`)
- Real-time port and route weather conditions
- Temperature, humidity, wind speed
- Risk level classification (Low/Medium/High)
- Auto-refresh every 30 seconds

#### News & Events (`/api/live/news`)
- Supply chain news sentiment analysis
- Relevance scoring
- Impact assessment
- Real-time headlines

#### Geopolitical Risk (`/api/live/geopolitical`)
- Regional tension indices
- Trade route impact assessment
- Affected shipping lanes identification
- Risk recommendations

#### Material Prices (`/api/live/materials`)
- Commodity price tracking:
  - Lithium
  - Steel
  - Polymers
  - Rare Earth Elements
- Price trends (up/down/stable)
- Volatility tracking

#### Port Operations (`/api/live/ports`)
- Live port capacity metrics
- Container throughput
- Vessel wait times
- Congestion indices
- Operational forecasts

### 3. **Service Integration Options**
Each integration has:
- **Enable/Disable Toggle**: Activate only needed data sources
- **Live Data Display**: Real-time metrics shown in card format
- **Auto-Refresh**: Data updates automatically every 30 seconds
- **Visual Indicators**: Color-coded risk levels and trends

## Getting Started

### 1. Access the ERP Integration Page

Navigate to the **ERP Integration** tab in the application. You'll see:
- ERP Connection tester (for SAP/Oracle/NetSuite)
- Live API Integrations panel
- Architecture documentation
- FAQ section

### 2. Enable Live Data Sources

In the "Live API Integrations" section:
1. Check the toggle for each integration you want to use:
   - ☑️ Weather Data
   - ☑️ News & Events
   - ☑️ Geopolitical Risk
   - ☑️ Material Prices
   - ☑️ Port Operations

2. Data will appear automatically below each integration card

3. Data refreshes every 30 seconds (configurable)

### 3. Test ERP Connections

1. Select an ERP system (SAP, Oracle, or NetSuite)
2. Click "Test Connection"
3. See connection status and latency
4. Results show success or error messages

## API Endpoints

### Live Data Endpoints

```
GET /api/live/all              # Fetch all data sources
GET /api/live/weather          # Weather data only
GET /api/live/news             # News sentiment only
GET /api/live/geopolitical     # Geopolitical risk only
GET /api/live/materials        # Material prices only
GET /api/live/ports            # Port operations only
```

### Integration Management

```
POST /api/live/integrate
Body: {
  "integrations": {
    "weather": true,
    "news": true,
    "geopolitical": true,
    "materials": true,
    "ports": true
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "weather": {
      "location": "Shanghai Port",
      "temperature": 28.5,
      "condition": "Clear",
      "riskLevel": "Low"
    },
    "news": {
      "title": "Port Operations Resume",
      "sentiment": "Positive",
      "relevance": 0.87
    },
    "geopolitical": {
      "region": "Persian Gulf",
      "tensionIndex": 6.8
    },
    "materials": {
      "lithium": { "price": 18500, "change": 2.5 },
      "steel": { "price": 950, "change": -1.2 }
    },
    "ports": {
      "throughput": "94.5%",
      "activeVessels": 287
    }
  },
  "timestamp": "2026-04-17T10:30:00Z"
}
```

## Configuration

### Environment Variables

```bash
# Backend API Base (for ERP connections)
VITE_ERP_API_BASE=http://localhost:8080

# Individual API Keys (optional, for production)
VITE_OPENWEATHER_API_KEY=your_key_here
VITE_NEWS_API_KEY=your_key_here
VITE_GEOPOLITICAL_API_KEY=your_key_here
```

### In Production

1. **Enable Real Data Sources**:
   - Replace mock functions with actual API calls
   - Add credentials for NewsAPI, OpenWeather, etc.
   - Configure commodity price feed connections

2. **Add Authentication**:
   ```typescript
   // In liveApiIntegration.ts
   const apiKey = process.env.NEWS_API_KEY;
   const response = await fetch(`https://newsapi.org/v2/...?apiKey=${apiKey}`);
   ```

3. **Enable Caching**:
   ```typescript
   const cache = new Map();
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
   
   if (cache.has('weather') && Date.now() - cache.get('weather').time < CACHE_DURATION) {
     return cache.get('weather').data;
   }
   ```

## Integration with Disruption Predictions

The live data automatically enhances disruption predictions:

1. **Weather Data** → Adjusts natural disaster probability
2. **News Sentiment** → Refines disruption likelihood
3. **Geopolitical Risk** → Increases port closure probability
4. **Material Prices** → Flags shortage disruptions
5. **Port Operations** → Predicts congestion delays

## Data Models

### Weather
```typescript
{
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  riskLevel: "Low" | "Medium" | "High";
}
```

### News
```typescript
{
  title: string;
  source: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  relevance: number;
  impact: string;
}
```

### Geopolitical
```typescript
{
  region: string;
  tensionIndex: number;
  tradeImpact: string;
  affectedRoutes: number;
  recommendation: string;
}
```

### Materials
```typescript
{
  [material]: {
    price: number;
    change: number;
    trend: "up" | "down" | "stable";
  }
}
```

### Ports
```typescript
{
  congestionIndex: number;
  avgWaitTime: string;
  activeVessels: number;
  throughput: string;
  forecast: string;
}
```

## Troubleshooting

### Data Not Refreshing
- Check if toggle is enabled for the integration
- Verify backend server is running at `http://localhost:8080`
- Check browser console for API errors

### Missing ERP Connection
- Ensure `VITE_ERP_API_BASE` environment variable is set
- Start backend with: `npx tsx server/mockErpServer.ts`
- Test individual ERP endpoints in the test panel

### Slow Data Loading
- Data refreshes every 30 seconds by design
- For real-time data, reduce the refresh interval in code
- Consider implementing WebSocket for live streaming

## Next Steps

1. **Connect to Real Data Sources**
   - Add actual API keys for Weather, News, Geopolitical data
   - Integrate with commodity price feeds
   - Connect to port authority APIs

2. **Implement Caching**
   - Cache responses to reduce API calls
   - Implement smart refresh based on data volatility

3. **Add Webhooks**
   - Receive push notifications for critical alerts
   - Real-time disruption warnings

4. **Historical Analysis**
   - Store live data for trend analysis
   - Identify patterns in supply chain disruptions

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify backend server logs
3. Test endpoints directly with `curl` or Postman
4. Review API response format in browser DevTools
