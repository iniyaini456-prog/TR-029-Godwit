<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d13ac899-835c-4952-ae78-a5c848771f4d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🤖 Machine Learning Integration (New)

Added a Python machine learning script (`train_xgboost_model.py`) to dynamically predict supply chain disruption risks using XGBoost.

### What was added:
- `train_xgboost_model.py`: Automates data cleaning, trains an XGBoost Regressor directly on `dynamic_supply_chain_logistics_dataset.csv`. It evaluates model performance and generates a feature importance visualization.
- **Dynamic Risk Detection**: Transforms the system from relying on static random variances (for lead times/delays) to utilizing ML-driven empirical predictions.
- **Feature Importance Tracking**: Generates `feature_importance.png` to help understand exactly which factors (e.g., weather, port congestion, traffic, fuel consumption) most heavily impact supply chain deviations.

### To run the ML model:

1. Install Python dependencies:
   ```bash
   pip install pandas scikit-learn xgboost matplotlib
   ```
2. Run the training script:
   ```bash
   python train_xgboost_model.py
   ```
3. View the generated `feature_importance.png` file to analyze supply chain risk factors.
