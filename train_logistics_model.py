import pandas as pd
import numpy as np
import json
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

def main():
    print("Loading Logistics Performance Index (LPI) Dataset...")
    lpi_path = "dataset/dataset2/datasets/Historical Disruption Benchmarks/International_LPI_from_2007_to_2023_0.xlsx"
    
    if not os.path.exists(lpi_path):
        print("LPI Excel file not found!")
        return

    # Extract 2023 performance sheet
    df = pd.read_excel(lpi_path, sheet_name="2023")
    
    # We want to score countries on Reliability
    # Features: 'Customs Score', 'Infrastructure Score', 'Timeliness Score', 'Logistics Competence and Quality Score'
    features = ['Customs Score', 'Infrastructure Score', 'Timeliness Score', 'Logistics Competence and Quality Score']
    
    # Drop rows without these features
    df = df.dropna(subset=features + ['Economy'])
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[features])
    
    # Use Isolation Forest to find anomalous logistics networks (highly unreliable countries)
    print("Training IsolationForest Anomaly Detector on Country Logistics...")
    iso = IsolationForest(contamination=0.15, random_state=42)
    predictions = iso.fit_predict(X_scaled)
    scores = iso.decision_function(X_scaled)
    
    # Map back to 0-1 Reliability Multiplier
    # Map score bounds to [0.5, 1.0] representing the reliability multiplier
    scores_norm = (scores - scores.min()) / (scores.max() - scores.min())
    reliability_multiplier = 0.5 + (scores_norm * 0.5)
    
    country_reliability = {}
    for i, row in df.iterrows():
        country = str(row['Economy']).strip()
        country_reliability[country] = {
            "lpi_score": float(row['LPI Score']),
            "is_anomalous": bool(predictions[i] == -1),
            "reliability_multiplier": round(float(reliability_multiplier[i]), 4)
        }
        
    # Manual overrides for standard mockData names mismatching World Bank official names
    country_reliability["EU"] = {"lpi_score": 4.0, "is_anomalous": False, "reliability_multiplier": 0.95}
    country_reliability["APAC"] = {"lpi_score": 3.8, "is_anomalous": False, "reliability_multiplier": 0.90}
    country_reliability["Taiwan"] = {"lpi_score": 3.9, "is_anomalous": False, "reliability_multiplier": 0.92}
    country_reliability["USA"] = country_reliability.get("United States", {"lpi_score": 4.0, "is_anomalous": False, "reliability_multiplier": 0.93})
    country_reliability["South Korea"] = country_reliability.get("Korea, Rep.", {"lpi_score": 4.1, "is_anomalous": False, "reliability_multiplier": 0.96})

    output = {
        "module": "Macro-Logistics & Trade",
        "model_type": "Isolation Forest (Anomaly Detection)",
        "country_reliability": country_reliability
    }

    out_path = "src/app/data/ml_logistics_predictions.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
        
    print(f"Success! Logistics model trained! Exported {len(country_reliability)} country profiles to {out_path}")

if __name__ == "__main__":
    main()
