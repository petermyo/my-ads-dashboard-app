// functions/api/users/index.js

// Handles GET for all users and POST for creating a user (though register is separate)

// GET /api/users - Fetch all users
export const onRequestGet = async (context) => {
    const { env } = context;
    try {
      // In a real app, you'd add authentication/authorization checks here
      // e.g., only allow 'admin' roles to fetch all users.
  
      const { results } = await env.D1_DATABASE.prepare(`SELECT id, email, role FROM users`).all();
  
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error("GET /api/users error:", error);
      return new Response(JSON.stringify({ message: "Internal server error fetching users." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  
  // POST /api/users - Create a new user (optional, as register handles this)
  // This is mostly for demonstration if you wanted an unauthenticated user creation API.
  // Typically, registration handles creating new users with passwords.
  export const onRequestPost = async (context) => {
    const { request, env } = context;
    try {
      const { email, role } = await request.json(); // Password should NOT be handled here if this is unauthenticated
  
      if (!email || !role) {
        return new Response(JSON.stringify({ message: "Email and role are required." }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // In a real app, you'd add authentication/authorization here (e.g., only admins can create)
      // If this is for user management by an admin, you'd also expect a password or a way to set it.
      // For simplicity, we'll add a user without a password here.
      const userId = crypto.randomUUID(); // Generate a unique ID
  
      try {
          await env.D1_DATABASE.prepare(
              `INSERT INTO users (id, email, role, password) VALUES (?, ?, ?, ?)`
          ).bind(userId, email, role, 'temp_password_no_hash').run(); // Placeholder for password
      } catch (e) {
          if (e.message.includes('UNIQUE constraint failed: users.email')) {
              return new Response(JSON.stringify({ message: "Email already exists." }), {
                  status: 409,
                  headers: { 'Content-Type': 'application/json' },
              });
          }
          throw e;
      }
  
  
      return new Response(JSON.stringify({
        message: "User created successfully!",
        user: { id: userId, email, role }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error("POST /api/users error:", error);
      return new Response(JSON.stringify({ message: "Internal server error creating user." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  