import React, { useState } from 'react';
import { CloudflareConfig } from '../types/cloudflare';
import { cloudflareService } from '../services/cloudflare';

interface ConfigPanelProps {
  onConfigSet: (config: CloudflareConfig) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  onConfigSet,
  isVisible,
  onClose
}) => {
  const [config, setConfig] = useState<CloudflareConfig>({
    zoneId: '',
    apiToken: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.zoneId.trim()) {
      newErrors.zoneId = 'Zone ID is required';
    }

    if (!config.apiToken.trim()) {
      newErrors.apiToken = 'API Token is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfig()) {
      return;
    }

    setIsValidating(true);
    setValidationMessage('');
    setErrors({});

    try {
      cloudflareService.setConfig(config);
      console.log('Starting validation for zone:', config.zoneId);
      const validation = await cloudflareService.validateConfig();
      console.log('Validation result:', validation);

      if (validation.success) {
        setValidationMessage(`✅ Success! Connected to zone: ${validation.zoneName}`);
        setTimeout(() => {
          onConfigSet(config);
          onClose();
        }, 1500);
      } else {
        setValidationMessage(`❌ ${validation.message}`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationMessage(`❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseMockData = () => {
    const mockConfig: CloudflareConfig = {
      zoneId: 'mock-zone-id',
      apiToken: 'mock-api-token',
    };

    cloudflareService.setConfig(mockConfig);
    onConfigSet(mockConfig);
    onClose();
  };

  const testProxyConnection = async () => {
    setValidationMessage('Testing proxy connection...');
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setValidationMessage(`✅ Proxy server is working: ${data.message}`);
    } catch (error) {
      setValidationMessage(`❌ Cannot connect to proxy server. Make sure it's running on port 3001.`);
      console.error('Proxy test failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="card-header">
          <h2 className="card-title">Cloudflare Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Enter your Cloudflare API credentials to fetch real analytics data
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Zone ID *
            </label>
            <input
              type="text"
              value={config.zoneId}
              onChange={(e) => setConfig({ ...config, zoneId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: `1px solid ${errors.zoneId ? 'var(--accent-red)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="Your Cloudflare Zone ID"
            />
            {errors.zoneId && (
              <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>
                {errors.zoneId}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              API Token *
            </label>
            <input
              type="password"
              value={config.apiToken}
              onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: `1px solid ${errors.apiToken ? 'var(--accent-red)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="Your Cloudflare API Token"
            />
            {errors.apiToken && (
              <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>
                {errors.apiToken}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Email (Optional)
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="your@email.com"
            />
          </div>

          {validationMessage && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: validationMessage.includes('✅') ? 'rgba(86, 211, 100, 0.1)' : 'rgba(245, 101, 101, 0.1)',
              border: `1px solid ${validationMessage.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)'}`,
              borderRadius: '4px',
              fontSize: '14px',
              color: validationMessage.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)',
              whiteSpace: 'pre-wrap'
            }}>
              {validationMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={testProxyConnection}
              disabled={isValidating}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: isValidating ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: isValidating ? 0.6 : 1
              }}
            >
              Test Proxy
            </button>
            <button
              type="button"
              onClick={handleUseMockData}
              disabled={isValidating}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: isValidating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: isValidating ? 0.6 : 1
              }}
            >
              Use Mock Data
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isValidating}
              style={{
                fontSize: '14px',
                opacity: isValidating ? 0.6 : 1,
                cursor: isValidating ? 'not-allowed' : 'pointer'
              }}
            >
              {isValidating ? 'Validating...' : 'Connect'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: 'rgba(51, 116, 224, 0.1)',
          border: '1px solid var(--accent-blue)',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <strong>How to get your credentials:</strong><br />
          1. Go to Cloudflare Dashboard → My Profile → API Tokens<br />
          2. Create a token with Zone:Zone:Read and Zone:Analytics:Read permissions<br />
          3. Find your Zone ID in the Overview section of your domain<br /><br />
          <strong>Note:</strong> For real data, you need to run the proxy server first (see README)
        </div>
      </div>
    </div>
  );
};