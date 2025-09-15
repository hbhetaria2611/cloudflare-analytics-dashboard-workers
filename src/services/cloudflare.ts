import axios from 'axios';
import { CloudflareConfig, ZoneAnalytics, CountryData, StatusCodeData, DashboardData } from '../types/cloudflare';

class CloudflareService {
  private config: CloudflareConfig | null = null;
  private useMockData: boolean = false;
  private useProxy: boolean = true; // Try proxy first, fallback to direct API
  private workerUrl: string = import.meta.env.VITE_WORKER_URL || 'https://cloudflare-analytics-dashboard.bhetariah.workers.dev';

  setConfig(config: CloudflareConfig) {
    this.config = config;
    this.useMockData = config.zoneId === 'mock-zone-id';
  }

  async validateConfig(): Promise<{ success: boolean; message: string; zoneName?: string }> {
    if (!this.config) {
      return { success: false, message: 'Configuration not set' };
    }

    if (this.useMockData) {
      return { success: true, message: 'Using mock data', zoneName: 'Demo Zone' };
    }

    // First check if Worker or local proxy is available
    try {
      // Always try Worker first if it's a workers.dev URL
      const healthUrls = this.workerUrl.includes('workers.dev')
        ? [`${this.workerUrl}/health`, 'http://localhost:3001/health']
        : ['http://localhost:3001/health', `${this.workerUrl}/health`];

      let proxyAvailable = false;
      for (const url of healthUrls) {
        try {
          await axios.get(url, { timeout: 2000 });
          console.log(`Proxy available at: ${url}`);
          // Set the working URL as our proxy endpoint
          if (url.includes('workers.dev')) {
            this.workerUrl = url.replace('/health', '');
          } else {
            this.workerUrl = url.replace('/health', '');
          }
          proxyAvailable = true;
          break;
        } catch (err) {
          console.warn(`Proxy not available at: ${url}`);
        }
      }

      if (!proxyAvailable) {
        console.warn('No proxy available, will use direct API');
        this.useProxy = false;
      }
    } catch (error) {
      console.warn('Proxy check failed, will use direct API');
      this.useProxy = false;
    }

    // Try proxy validation first if available
    if (this.useProxy) {
      try {
        const response = await axios.get(
          `${this.workerUrl}/api/cloudflare/validate/${this.config.zoneId}`,
          {
            params: {
              apiToken: this.config.apiToken,
            },
            timeout: 10000,
          }
        );

        return {
          success: true,
          message: response.data.message,
          zoneName: response.data.zoneName
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 404) {
            return {
              success: false,
              message: `Zone not found: "${this.config.zoneId}" is not a valid Zone ID or your API token doesn't have access to this zone. Please check your Zone ID in the Cloudflare dashboard.`
            };
          }

          return {
            success: false,
            message: data.error + (data.suggestion ? '. ' + data.suggestion : '')
          };
        }
        console.warn('Proxy validation failed, will try direct API...');
        this.useProxy = false;
      }
    }

    // Direct API validation fallback
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.errors?.[0]?.message || 'Zone validation failed'
        };
      }

      return {
        success: true,
        message: 'Configuration validated successfully',
        zoneName: response.data.result.name
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
          return {
            success: false,
            message: 'CORS Error: Cannot validate directly. Please start the proxy server or use mock data.'
          };
        }
        if (error.response?.status === 401) {
          return {
            success: false,
            message: 'Authentication failed: Please check your API token format and validity'
          };
        }
        if (error.response?.status === 403) {
          return {
            success: false,
            message: 'Access denied: Your API token needs Zone:Zone:Read and Zone:Analytics:Read permissions'
          };
        }
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Zone not found: Please check your Zone ID'
          };
        }
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  private getHeaders() {
    if (!this.config) {
      throw new Error('Cloudflare configuration not set');
    }

    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('.')[0] + 'Z';
  }

  async getZoneAnalytics(since: Date, until: Date): Promise<ZoneAnalytics> {
    if (!this.config) {
      throw new Error('Cloudflare configuration not set');
    }

    // Check if proxy is available before trying to use it
    if (this.useProxy) {
      try {
        // Quick health check
        await axios.get(`${this.workerUrl}/health`, { timeout: 2000 });

        const response = await axios.get(
          `${this.workerUrl}/api/cloudflare/analytics/${this.config.zoneId}`,
          {
            params: {
              since: this.formatDate(since),
              until: this.formatDate(until),
              apiToken: this.config.apiToken,
            },
            timeout: 15000,
          }
        );

        if (!response.data.success) {
          throw new Error(`Cloudflare API error: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
        }

        return response.data.result;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // This is a real API error from Cloudflare, not a proxy issue
          throw error;
        }
        console.warn('Proxy server not available, trying direct API...');
        this.useProxy = false; // Disable proxy for subsequent requests
      }
    }

    // Direct API fallback
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/analytics/dashboard`,
        {
          headers: this.getHeaders(),
          params: {
            since: this.formatDate(since),
            until: this.formatDate(until),
            continuous: true,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(`Cloudflare API error: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
          throw new Error('CORS Error: Cannot access Cloudflare API directly from browser. Please start the proxy server (see README) or use mock data.');
        }
        if (error.response?.status === 401) {
          throw new Error('Authentication failed: Please check your API token and Zone ID');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied: Your API token may not have the required permissions');
        }
      }
      throw error;
    }
  }

  async getCountryData(since: Date, until: Date): Promise<CountryData[]> {
    if (!this.config) {
      throw new Error('Cloudflare configuration not set');
    }

    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/analytics/dashboard`,
      {
        headers: this.getHeaders(),
        params: {
          since: this.formatDate(since),
          until: this.formatDate(until),
        },
      }
    );

    if (!response.data.success) {
      throw new Error(`Cloudflare API error: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
    }

    return response.data.result.totals?.countries || [];
  }

  async getStatusCodeData(since: Date, until: Date): Promise<StatusCodeData[]> {
    if (!this.config) {
      throw new Error('Cloudflare configuration not set');
    }

    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/analytics/dashboard`,
      {
        headers: this.getHeaders(),
        params: {
          since: this.formatDate(since),
          until: this.formatDate(until),
        },
      }
    );

    if (!response.data.success) {
      throw new Error(`Cloudflare API error: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
    }

    return response.data.result.totals?.status_codes || [];
  }

  async getDashboardData(): Promise<DashboardData> {
    if (this.useMockData) {
      console.log('Using mock data as requested');
      return this.getMockDashboardData();
    }

    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
      console.log('Fetching real Cloudflare data...');
      const analytics = await this.getZoneAnalytics(since, now);

      // For countries and status codes, we'll try to get real data but fall back to mock if not available
      // since these endpoints might not be available in all Cloudflare plans
      const [countries, statusCodes] = await Promise.all([
        this.getCountryData(since, now).catch(() => {
          console.warn('Country data not available, using mock data');
          return this.getMockCountryData();
        }),
        this.getStatusCodeData(since, now).catch(() => {
          console.warn('Status code data not available, using mock data');
          return this.getMockStatusCodeData();
        }),
      ]);

      console.log('Successfully fetched Cloudflare data');
      return {
        analytics,
        countries,
        statusCodes,
        lastUpdated: now.toISOString(),
      };
    } catch (error) {
      // If we get a 403 error specifically for analytics, provide helpful guidance
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error('Analytics access denied. Your API token needs "Zone:Analytics:Read" permission. Please update your token permissions in the Cloudflare dashboard or use mock data.');
      }
      console.error('Failed to fetch Cloudflare data:', error);
      throw error;
    }
  }

  private getMockCountryData(): CountryData[] {
    return [
      { country: 'United States', requests: 12500, percentage: 45.2 },
      { country: 'Germany', requests: 3200, percentage: 11.6 },
      { country: 'United Kingdom', requests: 2800, percentage: 10.1 },
      { country: 'France', requests: 2100, percentage: 7.6 },
      { country: 'Canada', requests: 1900, percentage: 6.9 },
      { country: 'Japan', requests: 1500, percentage: 5.4 },
      { country: 'Australia', requests: 1200, percentage: 4.3 },
      { country: 'Brazil', requests: 900, percentage: 3.3 },
      { country: 'India', requests: 800, percentage: 2.9 },
      { country: 'Netherlands', requests: 700, percentage: 2.5 },
    ];
  }

  private getMockStatusCodeData(): StatusCodeData[] {
    return [
      { status: '200', requests: 22000, percentage: 88.0 },
      { status: '304', requests: 1500, percentage: 6.0 },
      { status: '404', requests: 800, percentage: 3.2 },
      { status: '403', requests: 400, percentage: 1.6 },
      { status: '500', requests: 200, percentage: 0.8 },
      { status: '502', requests: 100, percentage: 0.4 },
    ];
  }

  private getMockDashboardData(): DashboardData {
    const now = new Date();
    const timeseries = [];

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      timeseries.push({
        timestamp: timestamp.toISOString(),
        requests: Math.floor(Math.random() * 1000) + 500,
        bandwidth: Math.floor(Math.random() * 50000000) + 10000000,
        threats: Math.floor(Math.random() * 50),
        uniqueVisitors: Math.floor(Math.random() * 200) + 100,
        pageViews: Math.floor(Math.random() * 800) + 400,
        cachedRequests: Math.floor(Math.random() * 600) + 300,
        uncachedRequests: Math.floor(Math.random() * 400) + 200,
      });
    }

    return {
      analytics: {
        totals: {
          requests: {
            all: 25000,
            cached: 18000,
            uncached: 7000,
          },
          bandwidth: {
            all: 850000000,
            cached: 650000000,
            uncached: 200000000,
          },
          threats: {
            all: 1200,
          },
          uniques: {
            all: 4500,
          },
        },
        timeseries,
      },
      countries: this.getMockCountryData(),
      statusCodes: this.getMockStatusCodeData(),
      lastUpdated: now.toISOString(),
    };
  }
}

export const cloudflareService = new CloudflareService();