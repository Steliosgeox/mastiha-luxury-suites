// Makes a new admin password and the scrypt hash that goes into src/lib/chat/credentials.ts.
// Only the hash is committed (the repository is public); keep the password somewhere safe.
//
//   npm run chat:password               a new random password
//   npm run chat:password -- "my words"  the hash of a password you chose (12+ characters)
import { randomBytes, randomInt, scryptSync } from "node:crypto";

const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const group = () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
const password = process.argv[2] ?? [group(), group(), group(), group()].join("-");
if (password.length < 12) { console.error("Use at least 12 characters."); process.exit(1); }

const salt = randomBytes(16);
const N = 1 << 15, r = 8, p = 1;
const hash = scryptSync(password, salt, 32, { N, r, p, maxmem: 64 * 1024 * 1024 });
console.log(`password: ${password}\nhash:     ${["scrypt", N, r, p, salt.toString("base64url"), hash.toString("base64url")].join("$")}`);
