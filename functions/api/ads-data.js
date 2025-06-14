// functions/api/ads-data.js

// This Pages Function acts as a proxy to fetch data from the external DATA_URL
// preventing the DATA_URL from being exposed directly to the client-side.

/**
 * Handles GET requests to fetch advertising data.
 *
 * @param {Request} request The incoming HTTP request.
 * @param {object} env The environment variables, including D1 bindings and custom variables.
 * @returns {Response} A JSON response containing the fetched data or an error message.
 */
export async function onRequestGet({ env }) {
    // Access DATA_URL from the environment variables, which is only available on the server (Worker).
    const DATA_URL = env.REACT_APP_DATA_URL; // Use the same name as in Pages settings
  
    if (!DATA_URL) {
      console.error("Pages Function Error: REACT_APP_DATA_URL environment variable is not defined in the Worker environment.");
      return new Response(JSON.stringify({ message: "Data source URL is not configured on the server." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const response = await fetch(DATA_URL);
  
      if (!response.ok) {
        console.error(`Pages Function Error: Failed to fetch data from external URL. Status: ${response.status}`);
        return new Response(JSON.stringify({ message: `Failed to fetch data from external source: HTTP status ${response.status}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const data = await response.json();
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache the response for 1 hour
        },
      });
    } catch (error) {
      console.error("Pages Function Error: An unexpected error occurred while fetching data:", error);
      return new Response(JSON.stringify({ message: `Internal server error: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  