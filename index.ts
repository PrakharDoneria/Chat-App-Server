import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const kv = await Deno.openKv();
const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET_KEY") || "default-secret-key";
const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = "SHA-256";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    key,
    { name: "HMAC", hash: "SHA-256", length: KEY_LENGTH * 8 },
    false,
    ["sign"]
  );

  const hashBuffer = await crypto.subtle.sign("HMAC", derivedKey, passwordBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}$${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split('$');
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    key,
    { name: "HMAC", hash: "SHA-256", length: KEY_LENGTH * 8 },
    false,
    ["sign"]
  );

  const hashBuffer = await crypto.subtle.sign("HMAC", derivedKey, passwordBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashCheckHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === hashCheckHex;
}

async function generateToken(username: string) {
  const key = new TextEncoder().encode(JWT_SECRET_KEY);
  const payload = {
    iss: username,
    exp: getNumericDate(60 * 60),
  };
  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

async function getUsernameFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const key = new TextEncoder().encode(JWT_SECRET_KEY);
    const payload = await verify(token, key, "HS256");
    return payload.iss as string;
  } catch {
    return null;
  }
}

async function handleSignup(req: Request) {
  const { username, password } = await req.json();
  const existingUser = await kv.get(["users", username]);

  if (existingUser.value) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
  }

  const hashedPassword = await hashPassword(password);
  await kv.set(["users", username], { username, password: hashedPassword });

  return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
}

async function handleLogin(req: Request) {
  const { username, password } = await req.json();
  const user = await kv.get(["users", username]);

  if (!user.value || !(await verifyPassword(password, user.value.password))) {
    return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
  }

  const token = await generateToken(username);
  return new Response(JSON.stringify({ message: "Login successful", token }), { status: 200 });
}

async function handleSendMessage(req: Request) {
  const { groupName, message } = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1];
  const username = await getUsernameFromToken(token);

  if (!username) {
    return new Response(JSON.stringify({ error: "Invalid or missing token" }), { status: 401 });
  }

  const timestamp = new Date().toISOString();
  const key = ["messages", groupName, timestamp];
  const value = { from: username, message, timestamp };

  await kv.set(key, value);

  return new Response(JSON.stringify({ message: "Message sent successfully" }), { status: 200 });
}

async function handleGetMessages(req: Request) {
  const url = new URL(req.url);
  const groupName = url.searchParams.get("groupName");
  const token = req.headers.get("Authorization")?.split(" ")[1];
  const username = await getUsernameFromToken(token);

  if (!username) {
    return new Response(JSON.stringify({ error: "Invalid or missing token" }), { status: 401 });
  }

  const messages = [];
  for await (const entry of kv.list({ prefix: ["messages", groupName] })) {
    messages.push(entry.value);
  }

  return new Response(JSON.stringify(messages), { status: 200 });
}

async function handleDelete(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (type === "accounts") {
    for await (const entry of kv.list({ prefix: ["users"] })) {
      await kv.delete(entry.key);
    }
    return new Response(JSON.stringify({ message: "All accounts deleted successfully" }), { status: 200 });
  } else if (type === "msgs") {
    for await (const entry of kv.list({ prefix: ["messages"] })) {
      await kv.delete(entry.key);
    }
    return new Response(JSON.stringify({ message: "All messages deleted successfully" }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: "Invalid type parameter" }), { status: 400 });
  }
}

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/signup") {
    return await handleSignup(req);
  } else if (req.method === "POST" && url.pathname === "/login") {
    return await handleLogin(req);
  } else if (req.method === "POST" && url.pathname === "/send-message") {
    return await handleSendMessage(req);
  } else if (req.method === "GET" && url.pathname === "/messages") {
    return await handleGetMessages(req);
  } else if (req.method === "DELETE" && url.pathname === "/delete") {
    return await handleDelete(req);
  }

  return new Response("Not Found", { status: 404 });
}, { port: 8000 });
