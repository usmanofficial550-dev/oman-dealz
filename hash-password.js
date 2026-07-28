// Run this once to generate your admin password hash:
//   node hash-password.js yourSecretPassword
//
// Copy the output into your .env file as ADMIN_PASSWORD_HASH

const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash-password.js yourPassword');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

console.log('\nAdd this line to your .env file:\n');
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
