import { useState } from 'react';
import { Settings, RefreshCw, Activity } from 'lucide-react';
import { useCloudflareData } from './hooks/useCloudflareData';
import { CloudflareConfig } from './types/cloudflare';
import { MetricCard } from './components/MetricCard';
import { ConfigPanel } from './components/ConfigPanel';
import { RequestsChart } from './components/RequestsChart';
import { BandwidthChart } from './components/BandwidthChart';
import { CountryChart } from './components/CountryChart';
import { StatusCodesChart } from './components/StatusCodesChart';
import { format } from 'date-fns';

function App() {
  const [config, setConfig] = useState<CloudflareConfig | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const { data, loading, error, refetch, isUsingMockData } = useCloudflareData(!!config);

  const handleConfigSet = (newConfig: CloudflareConfig) => {
    setConfig(newConfig);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1000000000) {
      return `${(bytes / 1000000000).toFixed(1)}GB`;
    }
    if (bytes >= 1000000) {
      return `${(bytes / 1000000).toFixed(1)}MB`;
    }
    if (bytes >= 1000) {
      return `${(bytes / 1000).toFixed(1)}KB`;
    }
    return `${bytes}B`;
  };

  const getCacheHitRate = (): number => {
    if (!data?.analytics.totals) return 0;
    const { cached, all } = data.analytics.totals.requests;
    return all > 0 ? (cached / all) * 100 : 0;
  };

  if (!config) {
    return (
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Activity size={64} style={{ color: 'var(--accent-blue)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Cloudflare Analytics Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Monitor your website's performance and traffic in real-time
          </p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="btn btn-primary"
          style={{ fontSize: '16px', padding: '12px 24px' }}
        >
          Get Started
        </button>
        <ConfigPanel
          isVisible={showConfig}
          onConfigSet={handleConfigSet}
          onClose={() => setShowConfig(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 0',
        marginBottom: '32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} style={{ color: 'var(--accent-blue)' }} />
            <h1 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>
              Cloudflare Analytics
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isUsingMockData && (
              <span style={{
                color: 'var(--accent-orange)',
                fontSize: '12px',
                backgroundColor: 'rgba(247, 147, 30, 0.1)',
                border: '1px solid var(--accent-orange)',
                borderRadius: '4px',
                padding: '4px 8px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Demo Mode
              </span>
            )}
            {data?.lastUpdated && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Last updated: {format(new Date(data.lastUpdated), 'HH:mm:ss')}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={16} style={{
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
            <button
              onClick={() => setShowConfig(true)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="error">
            Error: {error}
          </div>
        )}

        {loading && !data ? (
          <div className="loading">
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
            Loading analytics data...
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="grid grid-4">
              <MetricCard
                title="Total Requests"
                value={data.analytics.totals.requests.all}
                color="blue"
              />
              <MetricCard
                title="Bandwidth"
                value={formatBytes(data.analytics.totals.bandwidth.all)}
                color="green"
              />
              <MetricCard
                title="Threats Blocked"
                value={data.analytics.totals.threats.all}
                color="red"
              />
              <MetricCard
                title="Cache Hit Rate"
                value={`${getCacheHitRate().toFixed(1)}%`}
                color="orange"
              />
            </div>

            <div className="grid grid-2">
              <RequestsChart data={data.analytics.timeseries} />
              <BandwidthChart data={data.analytics.timeseries} />
            </div>

            <div className="grid grid-2">
              <CountryChart data={data.countries} />
              <StatusCodesChart data={data.statusCodes} />
            </div>
          </div>
        ) : null}
      </main>

      <ConfigPanel
        isVisible={showConfig}
        onConfigSet={handleConfigSet}
        onClose={() => setShowConfig(false)}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export default App;