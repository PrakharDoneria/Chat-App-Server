import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
const kv = await Deno.openKv();
const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET_KEY") || "default-secret-key";
async function generateToken(username) {
  const payload = {
    iss: username,
    exp: getNumericDate(60 * 60)
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
  } catch  {
    return null;
  }
}
async function handleSignup(req) {
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
}
async function handleLogin(req) {
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
}
async function handleSendMessage(req) {
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
}
async function handleGetMessages(req) {
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
}
serve(async (req)=>{
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname === "/signup") {
    return await handleSignup(req);
  } else if (req.method === "POST" && url.pathname === "/login") {
    return await handleLogin(req);
  } else if (req.method === "POST" && url.pathname === "/send-message") {
    return await handleSendMessage(req);
  } else if (req.method === "GET" && url.pathname === "/messages") {
    return await handleGetMessages(req);
  }
  return new Response("Not Found", {
    status: 404
  });
}, {
  port: 8000
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvQ2hhdC1BcHAtU2VydmVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMi4wL2h0dHAvc2VydmVyLnRzXCI7XG5pbXBvcnQgeyBjcmVhdGUsIGdldE51bWVyaWNEYXRlLCB2ZXJpZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9kand0QHYyLjQvbW9kLnRzXCI7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvYmNyeXB0L21vZC50c1wiO1xuaW1wb3J0IFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9kb3RlbnZAdjMuMi4yL2xvYWQudHNcIjtcblxuY29uc3Qga3YgPSBhd2FpdCBEZW5vLm9wZW5LdigpO1xuY29uc3QgSldUX1NFQ1JFVF9LRVkgPSBEZW5vLmVudi5nZXQoXCJKV1RfU0VDUkVUX0tFWVwiKSB8fCBcImRlZmF1bHQtc2VjcmV0LWtleVwiO1xuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVRva2VuKHVzZXJuYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICBpc3M6IHVzZXJuYW1lLFxuICAgIGV4cDogZ2V0TnVtZXJpY0RhdGUoNjAgKiA2MCksXG4gIH07XG4gIHJldHVybiBhd2FpdCBjcmVhdGUoeyBhbGc6IFwiSFMyNTZcIiwgdHlwOiBcIkpXVFwiIH0sIHBheWxvYWQsIEpXVF9TRUNSRVRfS0VZKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0VXNlcm5hbWVGcm9tVG9rZW4odG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICBpZiAoIXRva2VuKSByZXR1cm4gbnVsbDtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdmVyaWZ5KHRva2VuLCBKV1RfU0VDUkVUX0tFWSwgXCJIUzI1NlwiKTtcbiAgICByZXR1cm4gcGF5bG9hZC5pc3MgYXMgc3RyaW5nO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWdudXAocmVxOiBSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSBhd2FpdCByZXEuanNvbigpO1xuICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBrdi5nZXQoW1widXNlcnNcIiwgdXNlcm5hbWVdKTtcblxuICBpZiAoZXhpc3RpbmdVc2VyLnZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIlVzZXIgYWxyZWFkeSBleGlzdHNcIiB9KSwgeyBzdGF0dXM6IDQwOSB9KTtcbiAgfVxuXG4gIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQpO1xuICBhd2FpdCBrdi5zZXQoW1widXNlcnNcIiwgdXNlcm5hbWVdLCB7IHVzZXJuYW1lLCBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQgfSk7XG5cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6IFwiVXNlciByZWdpc3RlcmVkIHN1Y2Nlc3NmdWxseVwiIH0pLCB7IHN0YXR1czogMjAxIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dpbihyZXE6IFJlcXVlc3QpIHtcbiAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBrdi5nZXQoW1widXNlcnNcIiwgdXNlcm5hbWVdKTtcblxuICBpZiAoIXVzZXIudmFsdWUgfHwgIShhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgdXNlci52YWx1ZS5wYXNzd29yZCkpKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludmFsaWQgdXNlcm5hbWUgb3IgcGFzc3dvcmRcIiB9KSwgeyBzdGF0dXM6IDQwMSB9KTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gYXdhaXQgZ2VuZXJhdGVUb2tlbih1c2VybmFtZSk7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIkxvZ2luIHN1Y2Nlc3NmdWxcIiwgdG9rZW4gfSksIHsgc3RhdHVzOiAyMDAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRNZXNzYWdlKHJlcTogUmVxdWVzdCkge1xuICBjb25zdCB7IGdyb3VwTmFtZSwgbWVzc2FnZSB9ID0gYXdhaXQgcmVxLmpzb24oKTtcbiAgY29uc3QgdG9rZW4gPSByZXEuaGVhZGVycy5nZXQoXCJBdXRob3JpemF0aW9uXCIpPy5zcGxpdChcIiBcIilbMV07XG4gIGNvbnN0IHVzZXJuYW1lID0gYXdhaXQgZ2V0VXNlcm5hbWVGcm9tVG9rZW4odG9rZW4pO1xuXG4gIGlmICghdXNlcm5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiSW52YWxpZCBvciBtaXNzaW5nIHRva2VuXCIgfSksIHsgc3RhdHVzOiA0MDEgfSk7XG4gIH1cblxuICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnN0IGtleSA9IFtcIm1lc3NhZ2VzXCIsIGdyb3VwTmFtZSwgdGltZXN0YW1wXTtcbiAgY29uc3QgdmFsdWUgPSB7IGZyb206IHVzZXJuYW1lLCBtZXNzYWdlLCB0aW1lc3RhbXAgfTtcblxuICBhd2FpdCBrdi5zZXQoa2V5LCB2YWx1ZSk7XG5cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6IFwiTWVzc2FnZSBzZW50IHN1Y2Nlc3NmdWxseVwiIH0pLCB7IHN0YXR1czogMjAwIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRNZXNzYWdlcyhyZXE6IFJlcXVlc3QpIHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgY29uc3QgZ3JvdXBOYW1lID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJncm91cE5hbWVcIik7XG4gIGNvbnN0IHRva2VuID0gcmVxLmhlYWRlcnMuZ2V0KFwiQXV0aG9yaXphdGlvblwiKT8uc3BsaXQoXCIgXCIpWzFdO1xuICBjb25zdCB1c2VybmFtZSA9IGF3YWl0IGdldFVzZXJuYW1lRnJvbVRva2VuKHRva2VuKTtcblxuICBpZiAoIXVzZXJuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludmFsaWQgb3IgbWlzc2luZyB0b2tlblwiIH0pLCB7IHN0YXR1czogNDAxIH0pO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiBrdi5saXN0KHsgcHJlZml4OiBbXCJtZXNzYWdlc1wiLCBncm91cE5hbWVdIH0pKSB7XG4gICAgbWVzc2FnZXMucHVzaChlbnRyeS52YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VzKSwgeyBzdGF0dXM6IDIwMCB9KTtcbn1cblxuc2VydmUoYXN5bmMgKHJlcSkgPT4ge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIiAmJiB1cmwucGF0aG5hbWUgPT09IFwiL3NpZ251cFwiKSB7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNpZ251cChyZXEpO1xuICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09IFwiUE9TVFwiICYmIHVybC5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xuICAgIHJldHVybiBhd2FpdCBoYW5kbGVMb2dpbihyZXEpO1xuICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09IFwiUE9TVFwiICYmIHVybC5wYXRobmFtZSA9PT0gXCIvc2VuZC1tZXNzYWdlXCIpIHtcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZE1lc3NhZ2UocmVxKTtcbiAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSBcIkdFVFwiICYmIHVybC5wYXRobmFtZSA9PT0gXCIvbWVzc2FnZXNcIikge1xuICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRNZXNzYWdlcyhyZXEpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcIk5vdCBGb3VuZFwiLCB7IHN0YXR1czogNDA0IH0pO1xufSwgeyBwb3J0OiA4MDAwIH0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxRQUFRLCtDQUErQztBQUNyRSxTQUFTLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLHVDQUF1QztBQUN0RixZQUFZLFlBQVksb0NBQW9DO0FBQzVELE9BQU8sNENBQTRDO0FBRW5ELE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTTtBQUM1QixNQUFNLGlCQUFpQixLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQXFCO0FBRXpELGVBQWUsY0FBYyxRQUFnQjtFQUMzQyxNQUFNLFVBQVU7SUFDZCxLQUFLO0lBQ0wsS0FBSyxlQUFlLEtBQUs7RUFDM0I7RUFDQSxPQUFPLE1BQU0sT0FBTztJQUFFLEtBQUs7SUFBUyxLQUFLO0VBQU0sR0FBRyxTQUFTO0FBQzdEO0FBRUEsZUFBZSxxQkFBcUIsS0FBeUI7RUFDM0QsSUFBSSxDQUFDLE9BQU8sT0FBTztFQUNuQixJQUFJO0lBQ0YsTUFBTSxVQUFVLE1BQU0sT0FBTyxPQUFPLGdCQUFnQjtJQUNwRCxPQUFPLFFBQVEsR0FBRztFQUNwQixFQUFFLE9BQU07SUFDTixPQUFPO0VBQ1Q7QUFDRjtBQUVBLGVBQWUsYUFBYSxHQUFZO0VBQ3RDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLElBQUk7RUFDN0MsTUFBTSxlQUFlLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFBQztJ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