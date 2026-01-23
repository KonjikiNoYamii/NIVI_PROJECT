import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard';

export const useDashboardPengajar = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getPengajarDashboard();
      setData(res.data);
    } catch (e) {
      console.log('Dashboard error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  return {
    data,
    loading,
    refreshing,
    loadDashboard,
    onRefresh,
  };
};
