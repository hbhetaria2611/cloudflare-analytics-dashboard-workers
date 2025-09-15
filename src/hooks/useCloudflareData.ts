import { useState, useEffect } from 'react';
import { DashboardData } from '../types/cloudflare';
import { cloudflareService } from '../services/cloudflare';

export const useCloudflareData = (isConfigured: boolean = false, refreshInterval: number = 30000) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchData = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const dashboardData = await cloudflareService.getDashboardData();
      setData(dashboardData);
      // Check if we're using mock data based on the lastUpdated field and some mock characteristics
      const isMock = dashboardData.analytics.totals.requests.all === 25000 &&
                     dashboardData.analytics.totals.threats.all === 1200;
      setIsUsingMockData(isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching Cloudflare data:', err);
      setIsUsingMockData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured) {
      fetchData();

      const interval = setInterval(fetchData, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isConfigured, refreshInterval]);

  const refetch = () => {
    if (isConfigured) {
      setLoading(true);
      fetchData();
    }
  };

  return { data, loading, error, refetch, isUsingMockData };
};