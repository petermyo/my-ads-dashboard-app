// functions/api/auth/login.js

export const onRequestPost = async (context) => {
    const { request, env } = context;
    try {
      const { email, password } = await request.json();
  
      if (!email || !password) {
        return new Response(JSON.stringify({ message: "Email and password are required." }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // In a real application, you would hash the provided password
      // and compare it with the stored hashed password.
      // For this example, we're doing a plain text comparison (INSECURE for production).
      const { results } = await env.D1_DATABASE.prepare(
        `SELECT id, email, role FROM users WHERE email = ? AND password = ?`
      ).bind(email, password).all();
  
      if (results.length === 0) {
        return new Response(JSON.stringify({ message: "Invalid credentials." }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const user = results[0];
      // In a real application, you would generate a JWT token here.
      // For simplicity, we'll return basic user info.
      return new Response(JSON.stringify({
        message: "Login successful!",
        user: { id: user.id, email: user.email, role: user.role }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error("Login API error:", error);
      return new Response(JSON.stringify({ message: "Internal server error during login." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  