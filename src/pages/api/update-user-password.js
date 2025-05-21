require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find user by email
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ error: `User ${email} not found` });
    }

    // Update user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password,
      }
    );

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    return res
      .status(200)
      .json({
        message: `Password updated for ${email}`,
        auth_user_id: user.id,
      });
  } catch (error) {
    console.error("Error updating user password:", error);
    return res.status(500).json({ error: error.message });
  }
}
