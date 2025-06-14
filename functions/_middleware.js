// functions/_middleware.js

// This middleware is applied to all requests within the 'functions' directory.
// It's crucial for binding the D1 database to your Pages Functions and handling CORS.

export const onRequest = async (context) => {
    try {
      // Attach the D1 database binding to the context.env for easy access in other functions.
      // Replace 'DB_NAME' with the actual binding name you set up in Cloudflare Pages.
      // Example: If your D1 binding variable is called 'DASHBOARD_DB', use context.env.DASHBOARD_DB
      // For now, we'll use 'DB' as a placeholder. You'll define this binding in your Pages settings.
      context.env.D1_DATABASE = context.env.DB; // Ensure 'DB' matches your D1 binding name
  
      // Handle CORS headers for local development and browser access.
      const origin = context.request.headers.get('Origin');
      const allowedOrigins = ['http://localhost:3000', 'https://my-ads-dashboard-app.pages.dev']; // Add your pages.dev URL and any custom domains
  
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // Cache preflight requests for 24 hours
      };
  
      // Handle preflight (OPTIONS) requests
      if (context.request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            ...corsHeaders,
          },
        });
      }
  
      const response = await context.next();
  
      // Add CORS headers to actual responses
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newHeaders.set(key, value);
      }
  
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
  
    } catch (error) {
      console.error("Middleware error:", error);
      return new Response(JSON.stringify({ message: "Internal server error." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  