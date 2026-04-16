import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
import matplotlib.pyplot as plt
import os

def main():
    print("Loading dataset...")
    data_path = os.path.join("dataset", "dynamic_supply_chain_logistics_dataset.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: Could not find dataset at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    # 1. Data Cleaning & Preprocessing
    print("Cleaning and preprocessing data...")
    # Drop timestamp or non-numeric identifiers that we won't use directly for this simple model
    df = df.drop(columns=['timestamp'], errors='ignore')
    
    # Encode categorical variables (e.g., 'risk_classification')
    if 'risk_classification' in df.columns:
        df['risk_classification'] = df['risk_classification'].astype('category').cat.codes
        
    # Handle missing values (fill numerical with median)
    df.fillna(df.median(numeric_only=True), inplace=True)
    
    # Our target variable will be 'disruption_likelihood_score'
    target_col = 'disruption_likelihood_score'
    
    if target_col not in df.columns:
        print(f"Error: Target column '{target_col}' not found.")
        return
        
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Splitting the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Train the XGBoost Model
    print("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(
        n_estimators=100, 
        learning_rate=0.1, 
        max_depth=5, 
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # 3. Predict and Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print("-" * 30)
    print("Model Evaluation Performance:")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"R-squared (R2): {r2:.4f}")
    print("-" * 30)
    
    # 4. Feature Importance
    print("Generating Feature Importance Plot...")
    
    # Get feature importances
    importances = model.feature_importances_
    
    # Sort them
    sorted_idx = np.argsort(importances)
    
    fig = plt.figure(figsize=(10, 8))
    plt.barh(range(len(sorted_idx)), importances[sorted_idx], align='center')
    plt.yticks(range(len(sorted_idx)), np.array(X.columns)[sorted_idx])
    plt.title('Feature Importance for Disruption Likelihood')
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    
    plot_path = "feature_importance.png"
    plt.savefig(plot_path)
    print(f"Feature importance chart successfully saved to: {plot_path}")
    
    # 5. Export Predictions to the App
    print("Exporting ML predictions for the Portal...")
    mean_disruption_prob = float(np.mean(predictions))
    std_disruption_prob = float(np.std(predictions))
    
    ml_output = {
        "modelStatus": "Trained",
        "r2_score": round(float(r2), 4),
        "mse": round(float(mse), 4),
        "mean_delay_probability": mean_disruption_prob,
        "historical_variance": std_disruption_prob,
        "feature_importances": {
            col: float(imp) for col, imp in zip(np.array(X.columns)[sorted_idx], importances[sorted_idx])
        }
    }
    
    import json
    # Save directly to the React app's data folder so it can be imported
    output_path = os.path.join("src", "app", "data", "ml_predictions.json")
    # Ensure dir exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(ml_output, f, indent=2)
        
    print(f"ML predictions successfully linked to portal at: {output_path}")
    print("Done!")

if __name__ == "__main__":
    main()
