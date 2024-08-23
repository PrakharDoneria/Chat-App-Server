import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const kv = await Deno.openKv();

async function handleSignup(req: Request) {
  const { username, password } = await req.json();
  const existingUser = await kv.get(["users", username]);

  if (existingUser.value) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
  }

  await kv.set(["users", username], { username, password });

  return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
}

async function handleLogin(req: Request) {
  const { username, password } = await req.json();
  const user = await kv.get(["users", username]);

  if (!user.value || user.value.password !== password) {
    return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
  }

  return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
}

async function handleSendMessage(req: Request) {
  const { groupName, message } = await req.json();
  // No authentication logic
  const timestamp = new Date().toISOString();
  const key = ["messages", groupName, timestamp];
  const value = { message, timestamp };

  await kv.set(key, value);

  return new Response(JSON.stringify({ message: "Message sent successfully" }), { status: 200 });
}

async function handleGetMessages(req: Request) {
  const url = new URL(req.url);
  const groupName = url.searchParams.get("groupName");

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
  } else if (req.method === "GET" && url.pathname === "/delete") {
    return await handleDelete(req);
  }

  return new Response("Not Found", { status: 404 });
}, { port: 8000 });
