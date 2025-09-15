export interface CloudflareConfig {
  zoneId: string;
  apiToken: string;
  email?: string;
}

export interface AnalyticsData {
  timestamp: string;
  requests: number;
  bandwidth: number;
  threats: number;
  uniqueVisitors: number;
  pageViews: number;
  cachedRequests: number;
  uncachedRequests: number;
}

export interface ZoneAnalytics {
  totals: {
    requests: {
      all: number;
      cached: number;
      uncached: number;
    };
    bandwidth: {
      all: number;
      cached: number;
      uncached: number;
    };
    threats: {
      all: number;
    };
    uniques: {
      all: number;
    };
  };
  timeseries: AnalyticsData[];
}

export interface CountryData {
  country: string;
  requests: number;
  percentage: number;
}

export interface StatusCodeData {
  status: string;
  requests: number;
  percentage: number;
}

export interface DashboardData {
  analytics: ZoneAnalytics;
  countries: CountryData[];
  statusCodes: StatusCodeData[];
  lastUpdated: string;
}