// functions/api/auth/register.js

import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for new users

export const onRequestPost = async (context) => {
  const { request, env } = context;
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email and password are required." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real application, you would hash the password before storing it.
    // For this example, we're storing it plain (INSECURE for production).

    const userId = uuidv4(); // Generate a unique ID for the new user
    const userRole = role || 'viewer'; // Default role to 'viewer' if not provided

    try {
      await env.D1_DATABASE.prepare(
        `INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`
      ).bind(userId, email, password, userRole).run();
    } catch (e) {
      if (e.message.includes('UNIQUE constraint failed: users.email')) {
        return new Response(JSON.stringify({ message: "Email already registered." }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw e; // Re-throw other unexpected D1 errors
    }


    return new Response(JSON.stringify({
      message: "Registration successful!",
      user: { id: userId, email, role: userRole }
    }), {
      status: 201, // Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Register API error:", error);
    return new Response(JSON.stringify({ message: "Internal server error during registration." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
