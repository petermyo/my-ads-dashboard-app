// functions/api/auth/login.js

// This Pages Function handles user login by verifying credentials against a D1 database.

/**
 * Handles POST requests for user login.
 * Expects a JSON body with 'email' and 'password'.
 *
 * @param {Request} request The incoming HTTP request.
 * @param {object} env The environment variables, including D1 bindings.
 * @returns {Response} A JSON response indicating successful login or an error.
 */
export async function onRequestPost({ request, env }) {
    try {
      const { email, password } = await request.json();
  
      // Basic validation
      if (!email || !password) {
        return new Response(JSON.stringify({ message: 'Email and password are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Hash the provided password using the SAME hashing function as registration
      const hashedPassword = await hashPassword(password);
  
      // Query D1 database for user with matching email and hashed password
      const { results } = await env.DB.prepare(
        "SELECT id, email, role FROM users WHERE email = ? AND password = ?"
      ).bind(email, hashedPassword).all();
  
      if (results.length > 0) {
        const user = results[0];
        // Login successful! Return user data (excluding sensitive info like password)
        return new Response(JSON.stringify({ message: 'Login successful!', user: { id: user.id, email: user.email, role: user.role } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // No user found with the given credentials
        return new Response(JSON.stringify({ message: 'Invalid credentials.' }), {
          status: 401, // Unauthorized
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error("Login API error:", error);
      return new Response(JSON.stringify({ message: error.message || 'Internal server error during login.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  // --- IMPORTANT: MOCK PASSWORD HASHING ---
  // This hashing function MUST be identical to the one in register.js.
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
  