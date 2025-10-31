/**
 * Admin User Management Script
 *
 * This script allows system administrators to manage admin users in the hr_users table.
 * It should be run with appropriate environment variables set.
 *
 * Usage:
 * node scripts/manage-admin-users.js add user@example.com "User Name"
 * node scripts/manage-admin-users.js remove user@example.com
 * node scripts/manage-admin-users.js list
 * node scripts/manage-admin-users.js promote user@example.com
 * node scripts/manage-admin-users.js demote user@example.com
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAdminUser(email, name) {
  try {
    console.log(`Adding admin user: ${email}`);

    // First, create the auth user (they need to sign up first)
    console.log("Note: User must first sign up through the normal auth flow.");
    console.log(
      "This script will add them to hr_users with admin role after they exist in auth.users"
    );

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      throw new Error(`Failed to list auth users: ${authError.message}`);
    }

    const authUser = authUsers.users.find((user) => user.email === email);
    if (!authUser) {
      console.log(
        `User ${email} not found in auth.users. They need to sign up first.`
      );
      return;
    }

    // Add or update user in hr_users
    const { data, error } = await supabaseAdmin.from("hr_users").upsert(
      [
        {
          id: authUser.id,
          username: email,
          name: name || email,
          role: "admin",
        },
      ],
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`Failed to add admin user: ${error.message}`);
    }

    console.log(`✅ Successfully added ${email} as admin user`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function removeAdminUser(email) {
  try {
    console.log(`Removing admin user: ${email}`);

    // Find user by email in hr_users
    const { data: hrUsers, error: findError } = await supabaseAdmin
      .from("hr_users")
      .select("*")
      .eq("username", email);

    if (findError) {
      throw new Error(`Failed to find user: ${findError.message}`);
    }

    if (hrUsers.length === 0) {
      console.log(`User ${email} not found in hr_users`);
      return;
    }

    // Remove from hr_users
    const { error } = await supabaseAdmin
      .from("hr_users")
      .delete()
      .eq("username", email);

    if (error) {
      throw new Error(`Failed to remove admin user: ${error.message}`);
    }

    console.log(`✅ Successfully removed ${email} from admin users`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function listAdminUsers() {
  try {
    console.log("Listing all admin users:");

    const { data: hrUsers, error } = await supabaseAdmin
      .from("hr_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list admin users: ${error.message}`);
    }

    if (hrUsers.length === 0) {
      console.log("No admin users found");
      return;
    }

    console.log("\n📋 Admin Users:");
    console.log("================");
    hrUsers.forEach((user) => {
      console.log(`Email: ${user.username}`);
      console.log(`Name: ${user.name || "N/A"}`);
      console.log(`Role: ${user.role || "user"}`);
      console.log(`ID: ${user.id}`);
      console.log(`Created: ${user.created_at || "N/A"}`);
      console.log("---");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function promoteUser(email) {
  try {
    console.log(`Promoting user to admin: ${email}`);

    const { data, error } = await supabaseAdmin
      .from("hr_users")
      .update({ role: "admin" })
      .eq("username", email);

    if (error) {
      throw new Error(`Failed to promote user: ${error.message}`);
    }

    console.log(`✅ Successfully promoted ${email} to admin`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function demoteUser(email) {
  try {
    console.log(`Demoting user from admin: ${email}`);

    const { data, error } = await supabaseAdmin
      .from("hr_users")
      .update({ role: "user" })
      .eq("username", email);

    if (error) {
      throw new Error(`Failed to demote user: ${error.message}`);
    }

    console.log(`✅ Successfully demoted ${email} from admin`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Main function
async function main() {
  const [command, email, name] = process.argv.slice(2);

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("❌ Missing required environment variables:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL");
    console.error("   SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  switch (command) {
    case "add":
      if (!email) {
        console.error("❌ Email is required for add command");
        console.error(
          'Usage: node scripts/manage-admin-users.js add user@example.com "User Name"'
        );
        process.exit(1);
      }
      await addAdminUser(email, name);
      break;

    case "remove":
      if (!email) {
        console.error("❌ Email is required for remove command");
        console.error(
          "Usage: node scripts/manage-admin-users.js remove user@example.com"
        );
        process.exit(1);
      }
      await removeAdminUser(email);
      break;

    case "list":
      await listAdminUsers();
      break;

    case "promote":
      if (!email) {
        console.error("❌ Email is required for promote command");
        console.error(
          "Usage: node scripts/manage-admin-users.js promote user@example.com"
        );
        process.exit(1);
      }
      await promoteUser(email);
      break;

    case "demote":
      if (!email) {
        console.error("❌ Email is required for demote command");
        console.error(
          "Usage: node scripts/manage-admin-users.js demote user@example.com"
        );
        process.exit(1);
      }
      await demoteUser(email);
      break;

    default:
      console.log("Admin User Management Script");
      console.log("============================");
      console.log("");
      console.log("Available commands:");
      console.log(
        "  add <email> [name]     - Add user as admin (user must exist in auth.users first)"
      );
      console.log("  remove <email>         - Remove user from admin users");
      console.log("  list                   - List all admin users");
      console.log(
        "  promote <email>        - Promote existing hr_user to admin"
      );
      console.log(
        "  demote <email>         - Demote admin user to regular user"
      );
      console.log("");
      console.log("Examples:");
      console.log(
        '  node scripts/manage-admin-users.js add admin@example.com "Admin User"'
      );
      console.log("  node scripts/manage-admin-users.js list");
      console.log(
        "  node scripts/manage-admin-users.js promote user@example.com"
      );
      break;
  }
}

main().catch(console.error);
