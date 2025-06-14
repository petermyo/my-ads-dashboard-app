// functions/api/users/[id].js

// Handles GET, PUT, DELETE operations for a specific user by ID.

// GET /api/users/:id - Fetch a specific user
export const onRequestGet = async (context) => {
    const { env, params } = context;
    const userId = params.id; // Access the dynamic ID from the path
  
    try {
      // Add authentication/authorization checks here (e.g., user can only view their own profile, or admin can view all)
  
      const { results } = await env.D1_DATABASE.prepare(
        `SELECT id, email, role FROM users WHERE id = ?`
      ).bind(userId).all();
  
      if (results.length === 0) {
        return new Response(JSON.stringify({ message: "User not found." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      return new Response(JSON.stringify(results[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error(`GET /api/users/${userId} error:`, error);
      return new Response(JSON.stringify({ message: "Internal server error fetching user." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  
  // PUT /api/users/:id - Update a specific user
  export const onRequestPut = async (context) => {
    const { request, env, params } = context;
    const userId = params.id;
  
    try {
      // Add strong authentication/authorization checks here (e.g., only admin or the user themselves can update)
      const { email, role, password } = await request.json(); // Include password if updating it
  
      if (!email || !role) {
        return new Response(JSON.stringify({ message: "Email and role are required for update." }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      let updateQuery = `UPDATE users SET email = ?, role = ? WHERE id = ?`;
      let bindParams = [email, role, userId];
  
      if (password) {
        // In a real app, hash the password before updating!
        updateQuery = `UPDATE users SET email = ?, role = ?, password = ? WHERE id = ?`;
        bindParams = [email, role, password, userId];
      }
  
      const { success } = await env.D1_DATABASE.prepare(updateQuery).bind(...bindParams).run();
  
      if (!success) { // D1 returns success:true if rows were affected.
          // Check if user exists before attempting update
          const { results: existingUser } = await env.D1_DATABASE.prepare(
              `SELECT id FROM users WHERE id = ?`
          ).bind(userId).all();
          if (existingUser.length === 0) {
              return new Response(JSON.stringify({ message: "User not found for update." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
              });
          }
          // If user exists but update didn't affect rows (e.g., no changes or unique constraint violation)
          throw new Error("Update operation did not affect any rows or encountered a constraint issue.");
      }
  
      return new Response(JSON.stringify({ message: "User updated successfully." }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error(`PUT /api/users/${userId} error:`, error);
      return new Response(JSON.stringify({ message: "Internal server error updating user." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  
  // DELETE /api/users/:id - Delete a specific user
  export const onRequestDelete = async (context) => {
    const { env, params } = context;
    const userId = params.id;
  
    try {
      // Add strong authentication/authorization checks here (e.g., only admin can delete)
  
      const { success } = await env.D1_DATABASE.prepare(
        `DELETE FROM users WHERE id = ?`
      ).bind(userId).run();
  
      if (!success) { // D1 returns success:true if rows were affected.
          // Check if user exists before attempting delete
          const { results: existingUser } = await env.D1_DATABASE.prepare(
              `SELECT id FROM users WHERE id = ?`
          ).bind(userId).all();
          if (existingUser.length === 0) {
              return new Response(JSON.stringify({ message: "User not found for deletion." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
              });
          }
          throw new Error("Delete operation did not affect any rows.");
      }
  
      return new Response(JSON.stringify({ message: "User deleted successfully." }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error(`DELETE /api/users/${userId} error:`, error);
      return new Response(JSON.stringify({ message: "Internal server error deleting user." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  