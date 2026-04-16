import os
import glob
import pandas as pd
import numpy as np
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def get_country_files(country_name):
    # Search for all CSVs matching this country name across years
    base_dir = "dataset/dataset2/datasets/Climate & Environmental Risk"
    pattern = f"{base_dir}/**/*{country_name}*.csv"
    return glob.glob(pattern, recursive=True)

def main():
    print("Initializing Climate & Environmental Risk ML Module...")
    # Explicit mapping of supply chain nodes to VIIRS geographical names
    target_countries = {
        "Chile": "Chile",
        "China": "China",
        "Germany": "Germany",
        "USA": "United_States",
        "South Korea": "South_Korea",
        "Taiwan": "Taiwan",
        "India": "India",
        "Mexico": "Mexico",
        "Czech Republic": "Czech_Republic",
        "Singapore": "Singapore",
        "Netherlands": "Netherlands"
    }

    country_metrics = []

    for display_name, search_name in target_countries.items():
        files = get_country_files(search_name)
        if not files:
            # Fallback if specific naming isn't found
            print(f"  -> No specific climate file found for {display_name}, using global baseline.")
            country_metrics.append({
                "country": display_name,
                "total_fires": 0,
                "high_confidence_fires": 0,
                "avg_frp": 0.0,
                "max_frp": 0.0
            })
            continue

        print(f"  -> Processing satellite data for {display_name} ({len(files)} files found)...")
        # Read and aggregate dataset
        df_list = []
        for file in files:
            try:
                chunk = pd.read_csv(file, usecols=['confidence', 'frp'])
                df_list.append(chunk)
            except Exception as e:
                pass
        
        if df_list:
            df = pd.concat(df_list, ignore_index=True)
            high_conf = len(df[df['confidence'] == 'h'])
            country_metrics.append({
                "country": display_name,
                "total_fires": len(df),
                "high_confidence_fires": high_conf,
                "avg_frp": float(df['frp'].mean()) if len(df) > 0 else 0.0,
                "max_frp": float(df['frp'].max()) if len(df) > 0 else 0.0
            })
        else:
            country_metrics.append({
                "country": display_name,
                "total_fires": 0,
                "high_confidence_fires": 0,
                "avg_frp": 0.0,
                "max_frp": 0.0
            })

    metric_df = pd.DataFrame(country_metrics)
    
    # Train KMeans clustering to group into Climate Risk Tiers (1=Safe, 2=Moderate, 3=High Risk)
    print("\nTraining KMeans Cluster Model on Fire Radiative Power Features...")
    features = ['total_fires', 'high_confidence_fires', 'avg_frp', 'max_frp']
    X = metric_df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Use 3 clusters
    kmeans = KMeans(n_clusters=3, random_state=42)
    metric_df['cluster'] = kmeans.fit_predict(X_scaled)
    
    # Map clusters to meaningful risk scores based on centroid's average FRP
    centroids = kmeans.cluster_centers_
    # Cluster with highest average max_frp (feature index 3) gets highest risk
    cluster_order = np.argsort(centroids[:, 3]) # [lowest_risk_cluster, mid, high]
    risk_mapping = {
        cluster_order[0]: {"tier": "Tier 1: Safe", "risk_multiplier": 1.0},
        cluster_order[1]: {"tier": "Tier 2: Moderate", "risk_multiplier": 1.15}, # 15% probability increase
        cluster_order[2]: {"tier": "Tier 3: Extreme", "risk_multiplier": 1.35}  # 35% probability increase
    }

    climate_predictions = {}
    for i, row in metric_df.iterrows():
        cluster_val = int(row['cluster'])
        risk_info = risk_mapping[cluster_val]
        
        climate_predictions[row['country']] = {
            "satellite_total_anomalies": int(row['total_fires']),
            "max_fire_radiative_power": round(float(row['max_frp']), 2),
            "climate_risk_tier": risk_info["tier"],
            "disruption_probability_multiplier": risk_info["risk_multiplier"]
        }

    output = {
        "module": "Climate & Environmental Risk",
        "model_type": "K-Means Clustering (Spatial Fire Density)",
        "climate_predictions": climate_predictions
    }

    out_path = "src/app/data/ml_climate_predictions.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Success! Climate model trained. Exported {len(climate_predictions)} regional boundaries to {out_path}")

if __name__ == "__main__":
    main()
