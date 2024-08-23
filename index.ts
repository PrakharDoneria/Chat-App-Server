import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const kv = await Deno.openKv();
const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET_KEY") || "default-secret-key";

async function generateToken(username: string) {
  const payload = {
    iss: username,
    exp: getNumericDate(24 * 60 * 60), 
  };
  return await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET_KEY);
}

async function getUsernameFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const payload = await verify(token, JWT_SECRET_KEY, "HS256");
    return payload.iss as string;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

async function handleSignup(req: Request) {
  try {
    const { username, password } = await req.json();
    const existingUser = await kv.get(["users", username]);

    if (existingUser.value) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password);
    await kv.set(["users", username], { username, password: hashedPassword });

    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error during signup" }), { status: 500 });
  }
}

async function handleLogin(req: Request) {
  try {
    const { username, password } = await req.json();
    const user = await kv.get(["users", username]);

    if (!user.value || !(await bcrypt.compare(password, user.value.password))) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    const token = await generateToken(username);
    return new Response(JSON.stringify({ message: "Login successful", token }), { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Internal server error during login" }), { status: 500 });
  }
}

async function handleSendMessage(req: Request) {
  try {
    const { groupName, message } = await req.json();
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);

    if (!username) {
      return new Response(JSON.stringify({ error: "Invalid or missing token" }), { status: 401 });
    }

    if (!groupName || !message) {
      return new Response(JSON.stringify({ error: "Group name and message are required" }), { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const key = ["messages", groupName, timestamp];
    const value = { from: username, message, timestamp };

    await kv.set(key, value);

    return new Response(JSON.stringify({ message: "Message sent successfully" }), { status: 200 });
  } catch (error) {
    console.error("Send message error:", error);
    return new Response(JSON.stringify({ error: "Internal server error while sending message" }), { status: 500 });
  }
}

async function handleGetMessages(req: Request) {
  try {
    const url = new URL(req.url);
    const groupName = url.searchParams.get("groupName");
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);

    if (!username) {
      return new Response(JSON.stringify({ error: "Invalid or missing token" }), { status: 401 });
    }

    if (!groupName) {
      return new Response(JSON.stringify({ error: "Group name is required" }), { status: 400 });
    }

    const messages = [];
    for await (const entry of kv.list({ prefix: ["messages", groupName] })) {
      messages.push(entry.value);
    }

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Get messages error:", error);
    return new Response(JSON.stringify({ error: "Internal server error while retrieving messages" }), { status: 500 });
  }
}

async function handleCheckToken(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);

    if (username) {
      return new Response(JSON.stringify({ valid: true, username }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ valid: false, error: "Invalid or missing token" }), { status: 401 });
    }
  } catch (error) {
    console.error("Check token error:", error);
    return new Response(JSON.stringify({ error: "Internal server error while checking token" }), { status: 500 });
  }
}

Deno.cron("sample cron", "*/10 * * * *", () => {
  console.log("cron job executed every 10 minutes");
});

serve(async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/signup") {
      return await handleSignup(req);
    } else if (req.method === "POST" && url.pathname === "/login") {
      return await handleLogin(req);
    } else if (req.method === "POST" && url.pathname === "/send-message") {
      return await handleSendMessage(req);
    } else if (req.method === "GET" && url.pathname === "/messages") {
      return await handleGetMessages(req);
    } else if (req.method === "GET" && url.pathname === "/check-token") {
      return await handleCheckToken(req);
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}, { port: 8000 });
