// functions/api/auth/register.js

// This function handles user registration by storing user data in a D1 database.

/**
 * Handles POST requests for user registration.
 * Expects a JSON body with 'email', 'password', and 'role'.
 *
 * @param {Request} request The incoming HTTP request.
 * @param {object} env The environment variables, including D1 bindings.
 * @returns {Response} A JSON response indicating success or failure.
 */
export async function onRequestPost({ request, env }) {
    try {
      const { email, password, role } = await request.json();
  
      // Basic validation
      if (!email || !password || !role) {
        return new Response(JSON.stringify({ message: 'Email, password, and role are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Hash the password before storing (IMPORTANT FOR SECURITY)
      // For a real application, use a strong, asynchronous hashing library like bcrypt.
      // For this example, we'll use a simple mock hash for demonstration purposes.
      const hashedPassword = await hashPassword(password); // Implement this hashing function securely
  
      // Insert user into D1 database
      // D1 bindings are available via env.DB (where DB is your D1 binding name)
      const { success } = await env.DB.prepare(
        "INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), email, hashedPassword, role).run();
  
      if (success) {
        return new Response(JSON.stringify({ message: 'Registration successful!', user: { email, role } }), {
          status: 201, // 201 Created
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // This might happen if there's a unique constraint violation (e.g., email already exists)
        // or another D1 error. More granular error handling is recommended.
        return new Response(JSON.stringify({ message: 'Failed to register user. Email might already be taken.' }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error("Registration API error:", error);
      return new Response(JSON.stringify({ message: error.message || 'Internal server error during registration.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  // --- IMPORTANT: MOCK PASSWORD HASHING ---
  // In a production environment, NEVER use a simple hash like this.
  // Use a secure, asynchronous, salt-generating hashing library like Argon2, bcrypt, or scrypt.
  async function hashPassword(password) {
    // This is a minimal, INSECURE example. Do NOT use in production.
    // Replace with crypto.subtle.digest for real-world hashing,
    // or a WebAssembly-compiled bcrypt library.
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
  }
  