import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
const kv = await Deno.openKv();
const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET_KEY") || "default-secret-key";
async function generateToken(username) {
  const payload = {
    iss: username,
    exp: getNumericDate(24 * 60 * 60)
  };
  return await create({
    alg: "HS256",
    typ: "JWT"
  }, payload, JWT_SECRET_KEY);
}
async function getUsernameFromToken(token) {
  if (!token) return null;
  try {
    const payload = await verify(token, JWT_SECRET_KEY, "HS256");
    return payload.iss;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
async function handleSignup(req) {
  try {
    const { username, password } = await req.json();
    const existingUser = await kv.get([
      "users",
      username
    ]);
    if (existingUser.value) {
      return new Response(JSON.stringify({
        error: "User already exists"
      }), {
        status: 409
      });
    }
    const hashedPassword = await bcrypt.hash(password);
    await kv.set([
      "users",
      username
    ], {
      username,
      password: hashedPassword
    });
    return new Response(JSON.stringify({
      message: "User registered successfully"
    }), {
      status: 201
    });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error during signup"
    }), {
      status: 500
    });
  }
}
async function handleLogin(req) {
  try {
    const { username, password } = await req.json();
    const user = await kv.get([
      "users",
      username
    ]);
    if (!user.value || !await bcrypt.compare(password, user.value.password)) {
      return new Response(JSON.stringify({
        error: "Invalid username or password"
      }), {
        status: 401
      });
    }
    const token = await generateToken(username);
    return new Response(JSON.stringify({
      message: "Login successful",
      token
    }), {
      status: 200
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error during login"
    }), {
      status: 500
    });
  }
}
async function handleSendMessage(req) {
  try {
    const { groupName, message } = await req.json();
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);
    if (!username) {
      return new Response(JSON.stringify({
        error: "Invalid or missing token"
      }), {
        status: 401
      });
    }
    if (!groupName || !message) {
      return new Response(JSON.stringify({
        error: "Group name and message are required"
      }), {
        status: 400
      });
    }
    const timestamp = new Date().toISOString();
    const key = [
      "messages",
      groupName,
      timestamp
    ];
    const value = {
      from: username,
      message,
      timestamp
    };
    await kv.set(key, value);
    return new Response(JSON.stringify({
      message: "Message sent successfully"
    }), {
      status: 200
    });
  } catch (error) {
    console.error("Send message error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error while sending message"
    }), {
      status: 500
    });
  }
}
async function handleGetMessages(req) {
  try {
    const url = new URL(req.url);
    const groupName = url.searchParams.get("groupName");
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);
    if (!username) {
      return new Response(JSON.stringify({
        error: "Invalid or missing token"
      }), {
        status: 401
      });
    }
    if (!groupName) {
      return new Response(JSON.stringify({
        error: "Group name is required"
      }), {
        status: 400
      });
    }
    const messages = [];
    for await (const entry of kv.list({
      prefix: [
        "messages",
        groupName
      ]
    })){
      messages.push(entry.value);
    }
    return new Response(JSON.stringify(messages), {
      status: 200
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error while retrieving messages"
    }), {
      status: 500
    });
  }
}
async function handleCheckToken(req) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = await getUsernameFromToken(token);
    if (username) {
      return new Response(JSON.stringify({
        valid: true,
        username
      }), {
        status: 200
      });
    } else {
      return new Response(JSON.stringify({
        valid: false,
        error: "Invalid or missing token"
      }), {
        status: 401
      });
    }
  } catch (error) {
    console.error("Check token error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error while checking token"
    }), {
      status: 500
    });
  }
}
Deno.cron("sample cron", "*/10 * * * *", ()=>{
  console.log("cron job executed every 10 minutes");
});
serve(async (req)=>{
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
    return new Response(JSON.stringify({
      error: "Not Found"
    }), {
      status: 404
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500
    });
  }
}, {
  port: 8000
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvQ2hhdC1BcHAtU2VydmVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMi4wL2h0dHAvc2VydmVyLnRzXCI7XG5pbXBvcnQgeyBjcmVhdGUsIGdldE51bWVyaWNEYXRlLCB2ZXJpZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9kand0QHYyLjQvbW9kLnRzXCI7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvYmNyeXB0L21vZC50c1wiO1xuaW1wb3J0IFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9kb3RlbnZAdjMuMi4yL2xvYWQudHNcIjtcblxuY29uc3Qga3YgPSBhd2FpdCBEZW5vLm9wZW5LdigpO1xuY29uc3QgSldUX1NFQ1JFVF9LRVkgPSBEZW5vLmVudi5nZXQoXCJKV1RfU0VDUkVUX0tFWVwiKSB8fCBcImRlZmF1bHQtc2VjcmV0LWtleVwiO1xuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVRva2VuKHVzZXJuYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICBpc3M6IHVzZXJuYW1lLFxuICAgIGV4cDogZ2V0TnVtZXJpY0RhdGUoMjQgKiA2MCAqIDYwKSwgXG4gIH07XG4gIHJldHVybiBhd2FpdCBjcmVhdGUoeyBhbGc6IFwiSFMyNTZcIiwgdHlwOiBcIkpXVFwiIH0sIHBheWxvYWQsIEpXVF9TRUNSRVRfS0VZKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0VXNlcm5hbWVGcm9tVG9rZW4odG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICBpZiAoIXRva2VuKSByZXR1cm4gbnVsbDtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdmVyaWZ5KHRva2VuLCBKV1RfU0VDUkVUX0tFWSwgXCJIUzI1NlwiKTtcbiAgICByZXR1cm4gcGF5bG9hZC5pc3MgYXMgc3RyaW5nO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJUb2tlbiB2ZXJpZmljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbnVwKHJlcTogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSBhd2FpdCByZXEuanNvbigpO1xuICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGF3YWl0IGt2LmdldChbXCJ1c2Vyc1wiLCB1c2VybmFtZV0pO1xuXG4gICAgaWYgKGV4aXN0aW5nVXNlci52YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIlVzZXIgYWxyZWFkeSBleGlzdHNcIiB9KSwgeyBzdGF0dXM6IDQwOSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBrdi5zZXQoW1widXNlcnNcIiwgdXNlcm5hbWVdLCB7IHVzZXJuYW1lLCBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQgfSk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJVc2VyIHJlZ2lzdGVyZWQgc3VjY2Vzc2Z1bGx5XCIgfSksIHsgc3RhdHVzOiAyMDEgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlNpZ251cCBlcnJvcjpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IgZHVyaW5nIHNpZ251cFwiIH0pLCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvZ2luKHJlcTogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSBhd2FpdCByZXEuanNvbigpO1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBrdi5nZXQoW1widXNlcnNcIiwgdXNlcm5hbWVdKTtcblxuICAgIGlmICghdXNlci52YWx1ZSB8fCAhKGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnZhbHVlLnBhc3N3b3JkKSkpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnZhbGlkIHVzZXJuYW1lIG9yIHBhc3N3b3JkXCIgfSksIHsgc3RhdHVzOiA0MDEgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZW5lcmF0ZVRva2VuKHVzZXJuYW1lKTtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJMb2dpbiBzdWNjZXNzZnVsXCIsIHRva2VuIH0pLCB7IHN0YXR1czogMjAwIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dpbiBlcnJvcjpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IgZHVyaW5nIGxvZ2luXCIgfSksIHsgc3RhdHVzOiA1MDAgfSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZE1lc3NhZ2UocmVxOiBSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBncm91cE5hbWUsIG1lc3NhZ2UgfSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gICAgY29uc3QgdG9rZW4gPSByZXEuaGVhZGVycy5nZXQoXCJBdXRob3JpemF0aW9uXCIpPy5zcGxpdChcIiBcIilbMV07XG4gICAgY29uc3QgdXNlcm5hbWUgPSBhd2FpdCBnZXRVc2VybmFtZUZyb21Ub2tlbih0b2tlbik7XG5cbiAgICBpZiAoIXVzZXJuYW1lKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiSW52YWxpZCBvciBtaXNzaW5nIHRva2VuXCIgfSksIHsgc3RhdHVzOiA0MDEgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFncm91cE5hbWUgfHwgIW1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJHcm91cCBuYW1lIGFuZCBtZXNzYWdlIGFyZSByZXF1aXJlZFwiIH0pLCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBjb25zdCBrZXkgPSBbXCJtZXNzYWdlc1wiLCBncm91cE5hbWUsIHRpbWVzdGFtcF07XG4gICAgY29uc3QgdmFsdWUgPSB7IGZyb206IHVzZXJuYW1lLCBtZXNzYWdlLCB0aW1lc3RhbXAgfTtcblxuICAgIGF3YWl0IGt2LnNldChrZXksIHZhbHVlKTtcblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIk1lc3NhZ2Ugc2VudCBzdWNjZXNzZnVsbHlcIiB9KSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiU2VuZCBtZXNzYWdlIGVycm9yOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludGVybmFsIHNlcnZlciBlcnJvciB3aGlsZSBzZW5kaW5nIG1lc3NhZ2VcIiB9KSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRNZXNzYWdlcyhyZXE6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IGdyb3VwTmFtZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwiZ3JvdXBOYW1lXCIpO1xuICAgIGNvbnN0IHRva2VuID0gcmVxLmhlYWRlcnMuZ2V0KFwiQXV0aG9yaXphdGlvblwiKT8uc3BsaXQoXCIgXCIpWzFdO1xuICAgIGNvbnN0IHVzZXJuYW1lID0gYXdhaXQgZ2V0VXNlcm5hbWVGcm9tVG9rZW4odG9rZW4pO1xuXG4gICAgaWYgKCF1c2VybmFtZSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludmFsaWQgb3IgbWlzc2luZyB0b2tlblwiIH0pLCB7IHN0YXR1czogNDAxIH0pO1xuICAgIH1cblxuICAgIGlmICghZ3JvdXBOYW1lKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiR3JvdXAgbmFtZSBpcyByZXF1aXJlZFwiIH0pLCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiBrdi5saXN0KHsgcHJlZml4OiBbXCJtZXNzYWdlc1wiLCBncm91cE5hbWVdIH0pKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKGVudHJ5LnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VzKSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiR2V0IG1lc3NhZ2VzIGVycm9yOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludGVybmFsIHNlcnZlciBlcnJvciB3aGlsZSByZXRyaWV2aW5nIG1lc3NhZ2VzXCIgfSksIHsgc3RhdHVzOiA1MDAgfSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hlY2tUb2tlbihyZXE6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbiA9IHJlcS5oZWFkZXJzLmdldChcIkF1dGhvcml6YXRpb25cIik/LnNwbGl0KFwiIFwiKVsxXTtcbiAgICBjb25zdCB1c2VybmFtZSA9IGF3YWl0IGdldFVzZXJuYW1lRnJvbVRva2VuKHRva2VuKTtcblxuICAgIGlmICh1c2VybmFtZSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IHZhbGlkOiB0cnVlLCB1c2VybmFtZSB9KSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IFwiSW52YWxpZCBvciBtaXNzaW5nIHRva2VuXCIgfSksIHsgc3RhdHVzOiA0MDEgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJDaGVjayB0b2tlbiBlcnJvcjpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3Igd2hpbGUgY2hlY2tpbmcgdG9rZW5cIiB9KSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuXG5EZW5vLmNyb24oXCJzYW1wbGUgY3JvblwiLCBcIiovMTAgKiAqICogKlwiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiY3JvbiBqb2IgZXhlY3V0ZWQgZXZlcnkgMTAgbWludXRlc1wiKTtcbn0pO1xuXG5zZXJ2ZShhc3luYyAocmVxKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcblxuICAgIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIiAmJiB1cmwucGF0aG5hbWUgPT09IFwiL3NpZ251cFwiKSB7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnbnVwKHJlcSk7XG4gICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIiAmJiB1cmwucGF0aG5hbWUgPT09IFwiL2xvZ2luXCIpIHtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVMb2dpbihyZXEpO1xuICAgIH0gZWxzZSBpZiAocmVxLm1ldGhvZCA9PT0gXCJQT1NUXCIgJiYgdXJsLnBhdGhuYW1lID09PSBcIi9zZW5kLW1lc3NhZ2VcIikge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRNZXNzYWdlKHJlcSk7XG4gICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSBcIkdFVFwiICYmIHVybC5wYXRobmFtZSA9PT0gXCIvbWVzc2FnZXNcIikge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldE1lc3NhZ2VzKHJlcSk7XG4gICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSBcIkdFVFwiICYmIHVybC5wYXRobmFtZSA9PT0gXCIvY2hlY2stdG9rZW5cIikge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNoZWNrVG9rZW4ocmVxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiTm90IEZvdW5kXCIgfSksIHsgc3RhdHVzOiA0MDQgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlNlcnZlciBlcnJvcjpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiB9KSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufSwgeyBwb3J0OiA4MDAwIH0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxRQUFRLCtDQUErQztBQUNyRSxTQUFTLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFR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