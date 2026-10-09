// Run with: npm run set-admin-password
// Prompts for a username and password, then stores a bcrypt-hashed password
// in src/data/admin.json. Safe to re-run any time to change credentials.
import readline from "node:readline";
import { Writable } from "node:stream";
import "dotenv/config";
import { setAdminPassword } from "../lib/adminStore.js";

// Output stream that can be muted, so typed passwords don't echo to the terminal.
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});

const rl = readline.createInterface({ input: process.stdin, output, terminal: true });

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    muted = hidden;
    rl.question("", (answer) => {
      muted = false;
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const defaultUsername = process.env.ADMIN_USERNAME || "admin";

  const usernameAnswer = await ask(`Admin username [${defaultUsername}]: `);
  const username = usernameAnswer.trim() || defaultUsername;

  const password = await ask("New admin password (min 8 characters): ", { hidden: true });
  const confirm = await ask("Confirm password: ", { hidden: true });
  rl.close();

  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters. Nothing was changed.");
    process.exit(1);
  }
  if (password !== confirm) {
    console.error("Passwords did not match. Nothing was changed.");
    process.exit(1);
  }

  await setAdminPassword(username, password);
  console.log(`Done. Admin username is "${username}". You can now sign in at /admin/login.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to set admin password:", err);
  process.exit(1);
});
