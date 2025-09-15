// Simple Node.js proxy server for Cloudflare API
// This helps bypass CORS restrictions when calling Cloudflare API from the browser

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Test endpoint to validate API token
app.get('/api/cloudflare/validate/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { apiToken } = req.query;

    if (!apiToken) {
      return res.status(400).json({ error: 'API token is required' });
    }

    // First, test if we can access the zone
    const zoneResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!zoneResponse.data.success) {
      return res.status(403).json({
        error: 'Zone access failed',
        details: zoneResponse.data.errors
      });
    }

    res.json({
      success: true,
      zoneName: zoneResponse.data.result.name,
      message: 'API token and zone ID are valid'
    });

  } catch (error) {
    console.error('Token validation error:', error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 403) {
        return res.status(403).json({
          error: 'Access denied - insufficient permissions',
          suggestion: 'Your API token needs Zone:Zone:Read and Zone:Analytics:Read permissions',
          details: errorData
        });
      } else if (status === 401) {
        return res.status(401).json({
          error: 'Authentication failed - invalid token',
          suggestion: 'Please check your API token format and validity',
          details: errorData
        });
      } else if (status === 404) {
        return res.status(404).json({
          error: 'Zone not found',
          suggestion: 'Please check your Zone ID',
          details: errorData
        });
      }

      res.status(status).json({
        error: errorData.errors?.[0]?.message || 'Cloudflare API error',
        details: errorData
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Proxy endpoint for Cloudflare analytics
app.get('/api/cloudflare/analytics/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { since, until, apiToken } = req.query;

    if (!apiToken) {
      return res.status(400).json({ error: 'API token is required' });
    }

    console.log(`Fetching analytics for zone ${zoneId} from ${since} to ${until}`);

    // Try different analytics endpoints based on available permissions
    const endpoints = [
      {
        name: 'dashboard',
        url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard`,
        params: { since, until, continuous: true },
        permission: 'Zone:Analytics:Read'
      }
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint.name} endpoint...`);

        const response = await axios.get(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          params: endpoint.params,
        });

        if (response.data.success) {
          console.log(`Analytics request successful via ${endpoint.name}`);
          return res.json(response.data);
        } else {
          console.log(`${endpoint.name} returned unsuccessful response:`, response.data.errors);
          lastError = response.data.errors?.[0]?.message || 'API returned unsuccessful';
        }
      } catch (error) {
        console.log(`${endpoint.name} endpoint failed:`, error.message);
        lastError = error;

        if (error.response?.status === 403) {
          console.log(`403 error suggests missing ${endpoint.permission} permission`);
        }
        continue; // Try next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All analytics endpoints failed');
  } catch (error) {
    console.error('Cloudflare API error:', error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 403) {
        return res.status(403).json({
          error: 'Access denied - insufficient permissions for analytics',
          suggestion: 'Your API token needs Zone:Analytics:Read permission',
          details: errorData
        });
      } else if (status === 401) {
        return res.status(401).json({
          error: 'Authentication failed',
          suggestion: 'Please check your API token',
          details: errorData
        });
      }

      res.status(status).json({
        error: errorData.errors?.[0]?.message || 'Cloudflare API error',
        details: errorData
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cloudflare proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Cloudflare proxy server running on port ${PORT}`);
});

module.exports = app;