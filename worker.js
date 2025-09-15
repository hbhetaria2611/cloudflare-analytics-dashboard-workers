// Cloudflare Worker for Analytics Dashboard API
// Replaces the Express.js proxy server to handle CORS and API requests

export default {
  async fetch(request, env, ctx) {
    // Handle CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check endpoint
      if (path === '/health') {
        return new Response(
          JSON.stringify({
            status: 'OK',
            message: 'Cloudflare Analytics Dashboard Worker is running',
            timestamp: new Date().toISOString()
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
          }
        );
      }

      // Validate Cloudflare API token and zone access
      if (path.startsWith('/api/cloudflare/validate/')) {
        const zoneId = path.split('/').pop();
        const apiToken = url.searchParams.get('apiToken');

        if (!apiToken) {
          return new Response(
            JSON.stringify({ error: 'API token is required' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }

        try {
          // Validate zone access
          const zoneResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const zoneData = await zoneResponse.json();

          if (!zoneData.success) {
            return new Response(
              JSON.stringify({
                error: 'Zone access failed',
                details: zoneData.errors
              }),
              {
                status: 403,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              zoneName: zoneData.result.name,
              message: 'API token and zone ID are valid'
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );

        } catch (error) {
          console.error('Token validation error:', error);

          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              message: error.message
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }
      }

      // Get Cloudflare analytics data
      if (path.startsWith('/api/cloudflare/analytics/')) {
        const zoneId = path.split('/').pop();
        const since = url.searchParams.get('since');
        const until = url.searchParams.get('until');
        const apiToken = url.searchParams.get('apiToken');

        if (!apiToken) {
          return new Response(
            JSON.stringify({ error: 'API token is required' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }

        console.log(`Fetching analytics for zone ${zoneId} from ${since} to ${until}`);

        try {
          // Try dashboard analytics endpoint
          const analyticsResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard?` +
            new URLSearchParams({
              since: since,
              until: until,
              continuous: 'true'
            }),
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const analyticsData = await analyticsResponse.json();

          if (analyticsData.success) {
            console.log('Analytics request successful');
            return new Response(
              JSON.stringify(analyticsData),
              {
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                },
              }
            );
          } else {
            console.log('Analytics returned unsuccessful response:', analyticsData.errors);
            return new Response(
              JSON.stringify({
                error: 'Analytics request failed',
                details: analyticsData.errors
              }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                },
              }
            );
          }

        } catch (error) {
          console.error('Analytics fetch error:', error);

          return new Response(
            JSON.stringify({
              error: 'Failed to fetch analytics',
              message: error.message
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }
      }

      // Default response for unmatched routes
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: 'API endpoint not found',
          path: path
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );

    } catch (error) {
      console.error('Worker error:', error);

      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }
  },
};