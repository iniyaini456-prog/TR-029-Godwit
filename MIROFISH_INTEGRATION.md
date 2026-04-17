# MiroFish Integration Guide

## Overview

This project integrates **MiroFish**, a multi-agent AI simulation system, to enhance supply chain disruption predictions. MiroFish uses stakeholder behavior modeling and social simulation to provide more accurate and contextual predictions.

## Architecture

```
Frontend (Vite + React)
    ↓ HTTP Request
    ↓ /api/mirofish/enhance
    ↓
Backend (Express on port 8080)
    ↓
MiroFish Python CLI
    ↓
Multi-Agent Simulation Results
    ↓
JSON Response
    ↓
Frontend (Enhanced Predictions)
```

## Setup

### 1. Install MiroFish CLI

The MiroFish CLI is already cloned in the `ai-mirofish/` directory. To set it up:

```bash
cd ai-mirofish
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Backend Server

The backend server provides the MiroFish API endpoint:

```bash
# Terminal 1: Start the ERP/MiroFish backend server
npx tsx server/mockErpServer.ts
```

This server:
- Runs on `http://localhost:8080`
- Provides `/api/mirofish/enhance` endpoint for predictions
- Includes `/api/mirofish/status` endpoint to check MiroFish availability

### 3. Run the Frontend

In a separate terminal:

```bash
# Terminal 2: Start the frontend with ERP API pointing to backend
npm run dev:with-erp
```

Or with explicit environment variable:

```bash
VITE_ERP_API_BASE=http://localhost:8080 npm run dev
```

## How It Works

### Prediction Enhancement Flow

1. **Frontend loads disruptions** from mock data
2. **Data service checks for MiroFish availability** by looking for the `ai-mirofish` folder
3. **If available**, sends disruptions to backend for enhancement
4. **Backend calls MiroFish Python CLI** to run multi-agent simulation
5. **MiroFish returns:**
   - Confidence scores for predictions
   - Key stakeholder signals
   - Timeline projections
   - Stakeholder reaction predictions
6. **Results are merged** with original ML predictions
7. **Enhanced disruptions displayed** in the UI with MiroFish insights

### API Endpoint

**POST** `/api/mirofish/enhance`

Request:
```json
{
  "disruptions": [
    {
      "id": "D1",
      "name": "Strait of Hormuz Closure",
      "type": "port_closure",
      "probability": 0.25,
      "impactScore": 95,
      "duration": 30,
      "affectedRegions": ["Persian Gulf", "Middle East"]
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "enhancedDisruptions": [
    {
      "id": "D1",
      "name": "Strait of Hormuz Closure",
      "type": "port_closure",
      "probability": 0.25,
      "impactScore": 95,
      "duration": 30,
      "affectedRegions": ["Persian Gulf", "Middle East"],
      "mirofish_analysis": {
        "id": "D1",
        "confidence": 0.82,
        "summary": "Multi-agent simulation predicts significant stakeholder coordination challenges...",
        "key_signals": [
          "Shipping companies pivot to alternative routes",
          "Oil prices surge due to supply concerns",
          "Manufacturers accelerate inventory build-up",
          ...
        ],
        "stakeholder_reactions": {
          "suppliers": "Seeking alternative markets and customer bases",
          "customers": "Implementing stockpiling strategies",
          ...
        },
        "timeline": {
          "immediate": "Initial assessment and emergency response within 24-48 hours",
          "short_term": "Contingency measures within 10 days",
          "long_term": "Strategic adaptations over 60+ days"
        }
      }
    }
  ]
}
```

### Status Endpoint

**GET** `/api/mirofish/status`

Response:
```json
{
  "mirofish_available": true,
  "status": "ready",
  "message": "MiroFish multi-agent AI is available"
}
```

## Mock Results (Fallback Mode)

If MiroFish is not installed or available, the system automatically falls back to mock multi-agent analysis with:

- Disruption-type-specific stakeholder responses
- Realistic confidence scores (0.65-0.90)
- Key signal predictions
- Timeline projections

This ensures the application works even without the full MiroFish installation.

## Troubleshooting

### Issue: "MiroFish not found"

**Solution:** Install MiroFish:
```bash
cd ai-mirofish
pip install -r requirements.txt
```

### Issue: Backend not responding

**Solution:** Ensure backend is running:
```bash
# Check if port 8080 is in use
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Kill any existing process and restart
npx tsx server/mockErpServer.ts
```

### Issue: CORS errors

**Solution:** The backend has CORS enabled. If still getting errors, check:
1. Frontend is at `http://localhost:3000+`
2. Backend is at `http://localhost:8080`
3. CORS headers are properly set in Express

## Next Steps

1. **Integrate with real MiroFish CLI** - Replace mock results with actual Python execution
2. **Add caching** - Store MiroFish results to avoid repeated simulations
3. **Streaming results** - Use Server-Sent Events for real-time predictions
4. **Custom scenarios** - Allow users to define custom disruption scenarios
5. **Historical learning** - Track prediction accuracy over time

## References

- [MiroFish GitHub Repository](https://github.com/amadad/mirofish-cli)
- [Multi-Agent AI Systems](https://en.wikipedia.org/wiki/Multi-agent_system)
- [Supply Chain Resilience](https://www.mckinsey.com/capabilities/operations/our-insights/resilience)
