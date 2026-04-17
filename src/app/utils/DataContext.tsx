import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadSupplyChainData, DataLoadResult } from '../utils/dataService';

interface DataContextType {
  data: DataLoadResult | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataLoadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🚀 DataProvider initialized");

  const loadData = async () => {
    try {
      console.log("📡 Starting data load...");
      setLoading(true);
      setError(null);
      
      // Add timeout to data loading
      const dataPromise = loadSupplyChainData();
      const timeoutPromise = new Promise<DataLoadResult>((_, reject) => {
        setTimeout(() => reject(new Error('Data loading timed out')), 10000);
      });
      
      const result = await Promise.race([dataPromise, timeoutPromise]);
      console.log("✅ Data loaded successfully:", result);
      setData(result);
    } catch (err) {
      console.error("❌ Data load failed:", err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}