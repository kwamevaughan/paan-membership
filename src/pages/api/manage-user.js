// pages/api/manage-user.js
import { config } from 'dotenv';
import { createClient } from "@supabase/supabase-js";

config();

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey
  });
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    }
  }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, email, password, full_name } = req.body;

  if (!action || !email) {
    return res.status(400).json({ error: "Action and email are required" });
  }

  try {
    // Check if user exists
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('List users error:', listError);
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find((u) => u.email === email);

    if (action === "create") {
      if (!password || !full_name) {
        return res
          .status(400)
          .json({ error: "Password and full_name are required for create" });
      }

      if (user) {
        return res.status(200).json({
          message: `User ${email} already exists`,
          auth_user_id: user.id,
          existed: true,
        });
      }

      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        });

      if (createError) {
        console.error('Create user error:', createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      return res.status(200).json({
        message: `Created user ${email}`,
        auth_user_id: newUser.user.id,
        existed: false,
      });
    }

    if (action === "update_password") {
      if (!password) {
        return res
          .status(400)
          .json({ error: "Password is required for update_password" });
      }

      if (!user) {
        return res.status(404).json({ error: `User ${email} not found` });
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password,
        }
      );

      if (updateError) {
        console.error('Update password error:', updateError);
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      return res.status(200).json({
        message: `Password updated for ${email}`,
        auth_user_id: user.id,
        existed: true,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Error managing user:", error);
    return res.status(500).json({ error: error.message });
  }
}
