// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
import { BufWriter } from "../io/bufio.ts";
import { TextProtoReader } from "../textproto/mod.ts";
import { assert } from "../_util/assert.ts";
import { ServerRequest } from "./server.ts";
import { STATUS_TEXT } from "./http_status.ts";
const encoder = new TextEncoder();
export function emptyReader() {
  return {
    read (_) {
      return Promise.resolve(null);
    }
  };
}
export function bodyReader(contentLength, r) {
  let totalRead = 0;
  let finished = false;
  async function read(buf) {
    if (finished) return null;
    let result;
    const remaining = contentLength - totalRead;
    if (remaining >= buf.byteLength) {
      result = await r.read(buf);
    } else {
      const readBuf = buf.subarray(0, remaining);
      result = await r.read(readBuf);
    }
    if (result !== null) {
      totalRead += result;
    }
    finished = totalRead === contentLength;
    return result;
  }
  return {
    read
  };
}
export function chunkedBodyReader(h, r) {
  // Based on https://tools.ietf.org/html/rfc2616#section-19.4.6
  const tp = new TextProtoReader(r);
  let finished = false;
  const chunks = [];
  async function read(buf) {
    if (finished) return null;
    const [chunk] = chunks;
    if (chunk) {
      const chunkRemaining = chunk.data.byteLength - chunk.offset;
      const readLength = Math.min(chunkRemaining, buf.byteLength);
      for(let i = 0; i < readLength; i++){
        buf[i] = chunk.data[chunk.offset + i];
      }
      chunk.offset += readLength;
      if (chunk.offset === chunk.data.byteLength) {
        chunks.shift();
        // Consume \r\n;
        if (await tp.readLine() === null) {
          throw new Deno.errors.UnexpectedEof();
        }
      }
      return readLength;
    }
    const line = await tp.readLine();
    if (line === null) throw new Deno.errors.UnexpectedEof();
    // TODO(bartlomieju): handle chunk extension
    const [chunkSizeString] = line.split(";");
    const chunkSize = parseInt(chunkSizeString, 16);
    if (Number.isNaN(chunkSize) || chunkSize < 0) {
      throw new Deno.errors.InvalidData("Invalid chunk size");
    }
    if (chunkSize > 0) {
      if (chunkSize > buf.byteLength) {
        let eof = await r.readFull(buf);
        if (eof === null) {
          throw new Deno.errors.UnexpectedEof();
        }
        const restChunk = new Uint8Array(chunkSize - buf.byteLength);
        eof = await r.readFull(restChunk);
        if (eof === null) {
          throw new Deno.errors.UnexpectedEof();
        } else {
          chunks.push({
            offset: 0,
            data: restChunk
          });
        }
        return buf.byteLength;
      } else {
        const bufToFill = buf.subarray(0, chunkSize);
        const eof = await r.readFull(bufToFill);
        if (eof === null) {
          throw new Deno.errors.UnexpectedEof();
        }
        // Consume \r\n
        if (await tp.readLine() === null) {
          throw new Deno.errors.UnexpectedEof();
        }
        return chunkSize;
      }
    } else {
      assert(chunkSize === 0);
      // Consume \r\n
      if (await r.readLine() === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      await readTrailers(h, r);
      finished = true;
      return null;
    }
  }
  return {
    read
  };
}
function isProhibidedForTrailer(key) {
  const s = new Set([
    "transfer-encoding",
    "content-length",
    "trailer"
  ]);
  return s.has(key.toLowerCase());
}
/** Read trailer headers from reader and append values to headers. "trailer"
 * field will be deleted. */ export async function readTrailers(headers, r) {
  const trailers = parseTrailer(headers.get("trailer"));
  if (trailers == null) return;
  const trailerNames = [
    ...trailers.keys()
  ];
  const tp = new TextProtoReader(r);
  const result = await tp.readMIMEHeader();
  if (result == null) {
    throw new Deno.errors.InvalidData("Missing trailer header.");
  }
  const undeclared = [
    ...result.keys()
  ].filter((k)=>!trailerNames.includes(k));
  if (undeclared.length > 0) {
    throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
  }
  for (const [k, v] of result){
    headers.append(k, v);
  }
  const missingTrailers = trailerNames.filter((k)=>!result.has(k));
  if (missingTrailers.length > 0) {
    throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
  }
  headers.delete("trailer");
}
function parseTrailer(field) {
  if (field == null) {
    return undefined;
  }
  const trailerNames = field.split(",").map((v)=>v.trim().toLowerCase());
  if (trailerNames.length === 0) {
    throw new Deno.errors.InvalidData("Empty trailer header.");
  }
  const prohibited = trailerNames.filter((k)=>isProhibidedForTrailer(k));
  if (prohibited.length > 0) {
    throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
  }
  return new Headers(trailerNames.map((key)=>[
      key,
      ""
    ]));
}
export async function writeChunkedBody(w, r) {
  for await (const chunk of Deno.iter(r)){
    if (chunk.byteLength <= 0) continue;
    const start = encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
    const end = encoder.encode("\r\n");
    await w.write(start);
    await w.write(chunk);
    await w.write(end);
    await w.flush();
  }
  const endChunk = encoder.encode("0\r\n\r\n");
  await w.write(endChunk);
}
/** Write trailer headers to writer. It should mostly should be called after
 * `writeResponse()`. */ export async function writeTrailers(w, headers, trailers) {
  const trailer = headers.get("trailer");
  if (trailer === null) {
    throw new TypeError("Missing trailer header.");
  }
  const transferEncoding = headers.get("transfer-encoding");
  if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
    throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
  }
  const writer = BufWriter.create(w);
  const trailerNames = trailer.split(",").map((s)=>s.trim().toLowerCase());
  const prohibitedTrailers = trailerNames.filter((k)=>isProhibidedForTrailer(k));
  if (prohibitedTrailers.length > 0) {
    throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
  }
  const undeclared = [
    ...trailers.keys()
  ].filter((k)=>!trailerNames.includes(k));
  if (undeclared.length > 0) {
    throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
  }
  for (const [key, value] of trailers){
    await writer.write(encoder.encode(`${key}: ${value}\r\n`));
  }
  await writer.write(encoder.encode("\r\n"));
  await writer.flush();
}
export async function writeResponse(w, r) {
  const protoMajor = 1;
  const protoMinor = 1;
  const statusCode = r.status || 200;
  const statusText = STATUS_TEXT.get(statusCode);
  const writer = BufWriter.create(w);
  if (!statusText) {
    throw new Deno.errors.InvalidData("Bad status code");
  }
  if (!r.body) {
    r.body = new Uint8Array();
  }
  if (typeof r.body === "string") {
    r.body = encoder.encode(r.body);
  }
  let out = `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;
  const headers = r.headers ?? new Headers();
  if (r.body && !headers.get("content-length")) {
    if (r.body instanceof Uint8Array) {
      out += `content-length: ${r.body.byteLength}\r\n`;
    } else if (!headers.get("transfer-encoding")) {
      out += "transfer-encoding: chunked\r\n";
    }
  }
  for (const [key, value] of headers){
    out += `${key}: ${value}\r\n`;
  }
  out += `\r\n`;
  const header = encoder.encode(out);
  const n = await writer.write(header);
  assert(n === header.byteLength);
  if (r.body instanceof Uint8Array) {
    const n = await writer.write(r.body);
    assert(n === r.body.byteLength);
  } else if (headers.has("content-length")) {
    const contentLength = headers.get("content-length");
    assert(contentLength != null);
    const bodyLength = parseInt(contentLength);
    const n = await Deno.copy(r.body, writer);
    assert(n === bodyLength);
  } else {
    await writeChunkedBody(writer, r.body);
  }
  if (r.trailers) {
    const t = await r.trailers();
    await writeTrailers(writer, headers, t);
  }
  await writer.flush();
}
/**
 * ParseHTTPVersion parses a HTTP version string.
 * "HTTP/1.0" returns (1, 0).
 * Ported from https://github.com/golang/go/blob/f5c43b9/src/net/http/request.go#L766-L792
 */ export function parseHTTPVersion(vers) {
  switch(vers){
    case "HTTP/1.1":
      return [
        1,
        1
      ];
    case "HTTP/1.0":
      return [
        1,
        0
      ];
    default:
      {
        const Big = 1000000; // arbitrary upper bound
        if (!vers.startsWith("HTTP/")) {
          break;
        }
        const dot = vers.indexOf(".");
        if (dot < 0) {
          break;
        }
        const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
        const major = Number(majorStr);
        if (!Number.isInteger(major) || major < 0 || major > Big) {
          break;
        }
        const minorStr = vers.substring(dot + 1);
        const minor = Number(minorStr);
        if (!Number.isInteger(minor) || minor < 0 || minor > Big) {
          break;
        }
        return [
          major,
          minor
        ];
      }
  }
  throw new Error(`malformed HTTP version ${vers}`);
}
export async function readRequest(conn, bufr) {
  const tp = new TextProtoReader(bufr);
  const firstLine = await tp.readLine(); // e.g. GET /index.html HTTP/1.0
  if (firstLine === null) return null;
  const headers = await tp.readMIMEHeader();
  if (headers === null) throw new Deno.errors.UnexpectedEof();
  const req = new ServerRequest();
  req.conn = conn;
  req.r = bufr;
  [req.method, req.url, req.proto] = firstLine.split(" ", 3);
  [req.protoMajor, req.protoMinor] = parseHTTPVersion(req.proto);
  req.headers = headers;
  fixLength(req);
  return req;
}
function fixLength(req) {
  const contentLength = req.headers.get("Content-Length");
  if (contentLength) {
    const arrClen = contentLength.split(",");
    if (arrClen.length > 1) {
      const distinct = [
        ...new Set(arrClen.map((e)=>e.trim()))
      ];
      if (distinct.length > 1) {
        throw Error("cannot contain multiple Content-Length headers");
      } else {
        req.headers.set("Content-Length", distinct[0]);
      }
    }
    const c = req.headers.get("Content-Length");
    if (req.method === "HEAD" && c && c !== "0") {
      throw Error("http: method cannot contain a Content-Length");
    }
    if (c && req.headers.has("transfer-encoding")) {
      // A sender MUST NOT send a Content-Length header field in any message
      // that contains a Transfer-Encoding header field.
      // rfc: https://tools.ietf.org/html/rfc7230#section-3.3.2
      throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvaHR0cC9faW8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmV3JpdGVyIH0gZnJvbSBcIi4uL2lvL2J1ZmlvLnRzXCI7XG5pbXBvcnQgeyBUZXh0UHJvdG9SZWFkZXIgfSBmcm9tIFwiLi4vdGV4dHByb3RvL21vZC50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4uL191dGlsL2Fzc2VydC50c1wiO1xuaW1wb3J0IHsgUmVzcG9uc2UsIFNlcnZlclJlcXVlc3QgfSBmcm9tIFwiLi9zZXJ2ZXIudHNcIjtcbmltcG9ydCB7IFNUQVRVU19URVhUIH0gZnJvbSBcIi4vaHR0cF9zdGF0dXMudHNcIjtcblxuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gZW1wdHlSZWFkZXIoKTogRGVuby5SZWFkZXIge1xuICByZXR1cm4ge1xuICAgIHJlYWQoXzogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9keVJlYWRlcihjb250ZW50TGVuZ3RoOiBudW1iZXIsIHI6IEJ1ZlJlYWRlcik6IERlbm8uUmVhZGVyIHtcbiAgbGV0IHRvdGFsUmVhZCA9IDA7XG4gIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICBhc3luYyBmdW5jdGlvbiByZWFkKGJ1ZjogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgIGlmIChmaW5pc2hlZCkgcmV0dXJuIG51bGw7XG4gICAgbGV0IHJlc3VsdDogbnVtYmVyIHwgbnVsbDtcbiAgICBjb25zdCByZW1haW5pbmcgPSBjb250ZW50TGVuZ3RoIC0gdG90YWxSZWFkO1xuICAgIGlmIChyZW1haW5pbmcgPj0gYnVmLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHJlc3VsdCA9IGF3YWl0IHIucmVhZChidWYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWFkQnVmID0gYnVmLnN1YmFycmF5KDAsIHJlbWFpbmluZyk7XG4gICAgICByZXN1bHQgPSBhd2FpdCByLnJlYWQocmVhZEJ1Zik7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgIHRvdGFsUmVhZCArPSByZXN1bHQ7XG4gICAgfVxuICAgIGZpbmlzaGVkID0gdG90YWxSZWFkID09PSBjb250ZW50TGVuZ3RoO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHsgcmVhZCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtlZEJvZHlSZWFkZXIoaDogSGVhZGVycywgcjogQnVmUmVhZGVyKTogRGVuby5SZWFkZXIge1xuICAvLyBCYXNlZCBvbiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjYxNiNzZWN0aW9uLTE5LjQuNlxuICBjb25zdCB0cCA9IG5ldyBUZXh0UHJvdG9SZWFkZXIocik7XG4gIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICBjb25zdCBjaHVua3M6IEFycmF5PHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBkYXRhOiBVaW50OEFycmF5O1xuICB9PiA9IFtdO1xuICBhc3luYyBmdW5jdGlvbiByZWFkKGJ1ZjogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgIGlmIChmaW5pc2hlZCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgW2NodW5rXSA9IGNodW5rcztcbiAgICBpZiAoY2h1bmspIHtcbiAgICAgIGNvbnN0IGNodW5rUmVtYWluaW5nID0gY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gY2h1bmsub2Zmc2V0O1xuICAgICAgY29uc3QgcmVhZExlbmd0aCA9IE1hdGgubWluKGNodW5rUmVtYWluaW5nLCBidWYuYnl0ZUxlbmd0aCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlYWRMZW5ndGg7IGkrKykge1xuICAgICAgICBidWZbaV0gPSBjaHVuay5kYXRhW2NodW5rLm9mZnNldCArIGldO1xuICAgICAgfVxuICAgICAgY2h1bmsub2Zmc2V0ICs9IHJlYWRMZW5ndGg7XG4gICAgICBpZiAoY2h1bmsub2Zmc2V0ID09PSBjaHVuay5kYXRhLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgY2h1bmtzLnNoaWZ0KCk7XG4gICAgICAgIC8vIENvbnN1bWUgXFxyXFxuO1xuICAgICAgICBpZiAoKGF3YWl0IHRwLnJlYWRMaW5lKCkpID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLlVuZXhwZWN0ZWRFb2YoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlYWRMZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IGxpbmUgPSBhd2FpdCB0cC5yZWFkTGluZSgpO1xuICAgIGlmIChsaW5lID09PSBudWxsKSB0aHJvdyBuZXcgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZigpO1xuICAgIC8vIFRPRE8oYmFydGxvbWllanUpOiBoYW5kbGUgY2h1bmsgZXh0ZW5zaW9uXG4gICAgY29uc3QgW2NodW5rU2l6ZVN0cmluZ10gPSBsaW5lLnNwbGl0KFwiO1wiKTtcbiAgICBjb25zdCBjaHVua1NpemUgPSBwYXJzZUludChjaHVua1NpemVTdHJpbmcsIDE2KTtcbiAgICBpZiAoTnVtYmVyLmlzTmFOKGNodW5rU2l6ZSkgfHwgY2h1bmtTaXplIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkludmFsaWREYXRhKFwiSW52YWxpZCBjaHVuayBzaXplXCIpO1xuICAgIH1cbiAgICBpZiAoY2h1bmtTaXplID4gMCkge1xuICAgICAgaWYgKGNodW5rU2l6ZSA+IGJ1Zi5ieXRlTGVuZ3RoKSB7XG4gICAgICAgIGxldCBlb2YgPSBhd2FpdCByLnJlYWRGdWxsKGJ1Zik7XG4gICAgICAgIGlmIChlb2YgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3RDaHVuayA9IG5ldyBVaW50OEFycmF5KGNodW5rU2l6ZSAtIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgZW9mID0gYXdhaXQgci5yZWFkRnVsbChyZXN0Q2h1bmspO1xuICAgICAgICBpZiAoZW9mID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLlVuZXhwZWN0ZWRFb2YoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaHVua3MucHVzaCh7XG4gICAgICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgICAgICBkYXRhOiByZXN0Q2h1bmssXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1Zi5ieXRlTGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYnVmVG9GaWxsID0gYnVmLnN1YmFycmF5KDAsIGNodW5rU2l6ZSk7XG4gICAgICAgIGNvbnN0IGVvZiA9IGF3YWl0IHIucmVhZEZ1bGwoYnVmVG9GaWxsKTtcbiAgICAgICAgaWYgKGVvZiA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29uc3VtZSBcXHJcXG5cbiAgICAgICAgaWYgKChhd2FpdCB0cC5yZWFkTGluZSgpKSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNodW5rU2l6ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXJ0KGNodW5rU2l6ZSA9PT0gMCk7XG4gICAgICAvLyBDb25zdW1lIFxcclxcblxuICAgICAgaWYgKChhd2FpdCByLnJlYWRMaW5lKCkpID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mKCk7XG4gICAgICB9XG4gICAgICBhd2FpdCByZWFkVHJhaWxlcnMoaCwgcik7XG4gICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgcmVhZCB9O1xufVxuXG5mdW5jdGlvbiBpc1Byb2hpYmlkZWRGb3JUcmFpbGVyKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHMgPSBuZXcgU2V0KFtcInRyYW5zZmVyLWVuY29kaW5nXCIsIFwiY29udGVudC1sZW5ndGhcIiwgXCJ0cmFpbGVyXCJdKTtcbiAgcmV0dXJuIHMuaGFzKGtleS50b0xvd2VyQ2FzZSgpKTtcbn1cblxuLyoqIFJlYWQgdHJhaWxlciBoZWFkZXJzIGZyb20gcmVhZGVyIGFuZCBhcHBlbmQgdmFsdWVzIHRvIGhlYWRlcnMuIFwidHJhaWxlclwiXG4gKiBmaWVsZCB3aWxsIGJlIGRlbGV0ZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFRyYWlsZXJzKFxuICBoZWFkZXJzOiBIZWFkZXJzLFxuICByOiBCdWZSZWFkZXIsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgdHJhaWxlcnMgPSBwYXJzZVRyYWlsZXIoaGVhZGVycy5nZXQoXCJ0cmFpbGVyXCIpKTtcbiAgaWYgKHRyYWlsZXJzID09IG51bGwpIHJldHVybjtcbiAgY29uc3QgdHJhaWxlck5hbWVzID0gWy4uLnRyYWlsZXJzLmtleXMoKV07XG4gIGNvbnN0IHRwID0gbmV3IFRleHRQcm90b1JlYWRlcihyKTtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHAucmVhZE1JTUVIZWFkZXIoKTtcbiAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkludmFsaWREYXRhKFwiTWlzc2luZyB0cmFpbGVyIGhlYWRlci5cIik7XG4gIH1cbiAgY29uc3QgdW5kZWNsYXJlZCA9IFsuLi5yZXN1bHQua2V5cygpXS5maWx0ZXIoXG4gICAgKGspID0+ICF0cmFpbGVyTmFtZXMuaW5jbHVkZXMoayksXG4gICk7XG4gIGlmICh1bmRlY2xhcmVkLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSW52YWxpZERhdGEoXG4gICAgICBgVW5kZWNsYXJlZCB0cmFpbGVyczogJHtEZW5vLmluc3BlY3QodW5kZWNsYXJlZCl9LmAsXG4gICAgKTtcbiAgfVxuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiByZXN1bHQpIHtcbiAgICBoZWFkZXJzLmFwcGVuZChrLCB2KTtcbiAgfVxuICBjb25zdCBtaXNzaW5nVHJhaWxlcnMgPSB0cmFpbGVyTmFtZXMuZmlsdGVyKChrKSA9PiAhcmVzdWx0LmhhcyhrKSk7XG4gIGlmIChtaXNzaW5nVHJhaWxlcnMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5JbnZhbGlkRGF0YShcbiAgICAgIGBNaXNzaW5nIHRyYWlsZXJzOiAke0Rlbm8uaW5zcGVjdChtaXNzaW5nVHJhaWxlcnMpfS5gLFxuICAgICk7XG4gIH1cbiAgaGVhZGVycy5kZWxldGUoXCJ0cmFpbGVyXCIpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVRyYWlsZXIoZmllbGQ6IHN0cmluZyB8IG51bGwpOiBIZWFkZXJzIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGZpZWxkID09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGNvbnN0IHRyYWlsZXJOYW1lcyA9IGZpZWxkLnNwbGl0KFwiLFwiKS5tYXAoKHYpID0+IHYudHJpbSgpLnRvTG93ZXJDYXNlKCkpO1xuICBpZiAodHJhaWxlck5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5JbnZhbGlkRGF0YShcIkVtcHR5IHRyYWlsZXIgaGVhZGVyLlwiKTtcbiAgfVxuICBjb25zdCBwcm9oaWJpdGVkID0gdHJhaWxlck5hbWVzLmZpbHRlcigoaykgPT4gaXNQcm9oaWJpZGVkRm9yVHJhaWxlcihrKSk7XG4gIGlmIChwcm9oaWJpdGVkLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSW52YWxpZERhdGEoXG4gICAgICBgUHJvaGliaXRlZCB0cmFpbGVyIG5hbWVzOiAke0Rlbm8uaW5zcGVjdChwcm9oaWJpdGVkKX0uYCxcbiAgICApO1xuICB9XG4gIHJldHVybiBuZXcgSGVhZGVycyh0cmFpbGVyTmFtZXMubWFwKChrZXkpID0+IFtrZXksIFwiXCJdKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUNodW5rZWRCb2R5KFxuICB3OiBCdWZXcml0ZXIsXG4gIHI6IERlbm8uUmVhZGVyLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgRGVuby5pdGVyKHIpKSB7XG4gICAgaWYgKGNodW5rLmJ5dGVMZW5ndGggPD0gMCkgY29udGludWU7XG4gICAgY29uc3Qgc3RhcnQgPSBlbmNvZGVyLmVuY29kZShgJHtjaHVuay5ieXRlTGVuZ3RoLnRvU3RyaW5nKDE2KX1cXHJcXG5gKTtcbiAgICBjb25zdCBlbmQgPSBlbmNvZGVyLmVuY29kZShcIlxcclxcblwiKTtcbiAgICBhd2FpdCB3LndyaXRlKHN0YXJ0KTtcbiAgICBhd2FpdCB3LndyaXRlKGNodW5rKTtcbiAgICBhd2FpdCB3LndyaXRlKGVuZCk7XG4gICAgYXdhaXQgdy5mbHVzaCgpO1xuICB9XG5cbiAgY29uc3QgZW5kQ2h1bmsgPSBlbmNvZGVyLmVuY29kZShcIjBcXHJcXG5cXHJcXG5cIik7XG4gIGF3YWl0IHcud3JpdGUoZW5kQ2h1bmspO1xufVxuXG4vKiogV3JpdGUgdHJhaWxlciBoZWFkZXJzIHRvIHdyaXRlci4gSXQgc2hvdWxkIG1vc3RseSBzaG91bGQgYmUgY2FsbGVkIGFmdGVyXG4gKiBgd3JpdGVSZXNwb25zZSgpYC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVRyYWlsZXJzKFxuICB3OiBEZW5vLldyaXRlcixcbiAgaGVhZGVyczogSGVhZGVycyxcbiAgdHJhaWxlcnM6IEhlYWRlcnMsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgdHJhaWxlciA9IGhlYWRlcnMuZ2V0KFwidHJhaWxlclwiKTtcbiAgaWYgKHRyYWlsZXIgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTWlzc2luZyB0cmFpbGVyIGhlYWRlci5cIik7XG4gIH1cbiAgY29uc3QgdHJhbnNmZXJFbmNvZGluZyA9IGhlYWRlcnMuZ2V0KFwidHJhbnNmZXItZW5jb2RpbmdcIik7XG4gIGlmICh0cmFuc2ZlckVuY29kaW5nID09PSBudWxsIHx8ICF0cmFuc2ZlckVuY29kaW5nLm1hdGNoKC9eY2h1bmtlZC8pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIGBUcmFpbGVycyBhcmUgb25seSBhbGxvd2VkIGZvciBcInRyYW5zZmVyLWVuY29kaW5nOiBjaHVua2VkXCIsIGdvdCBcInRyYW5zZmVyLWVuY29kaW5nOiAke3RyYW5zZmVyRW5jb2Rpbmd9XCIuYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IHdyaXRlciA9IEJ1ZldyaXRlci5jcmVhdGUodyk7XG4gIGNvbnN0IHRyYWlsZXJOYW1lcyA9IHRyYWlsZXIuc3BsaXQoXCIsXCIpLm1hcCgocykgPT4gcy50cmltKCkudG9Mb3dlckNhc2UoKSk7XG4gIGNvbnN0IHByb2hpYml0ZWRUcmFpbGVycyA9IHRyYWlsZXJOYW1lcy5maWx0ZXIoKGspID0+XG4gICAgaXNQcm9oaWJpZGVkRm9yVHJhaWxlcihrKVxuICApO1xuICBpZiAocHJvaGliaXRlZFRyYWlsZXJzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYFByb2hpYml0ZWQgdHJhaWxlciBuYW1lczogJHtEZW5vLmluc3BlY3QocHJvaGliaXRlZFRyYWlsZXJzKX0uYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IHVuZGVjbGFyZWQgPSBbLi4udHJhaWxlcnMua2V5cygpXS5maWx0ZXIoXG4gICAgKGspID0+ICF0cmFpbGVyTmFtZXMuaW5jbHVkZXMoayksXG4gICk7XG4gIGlmICh1bmRlY2xhcmVkLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmRlY2xhcmVkIHRyYWlsZXJzOiAke0Rlbm8uaW5zcGVjdCh1bmRlY2xhcmVkKX0uYCk7XG4gIH1cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdHJhaWxlcnMpIHtcbiAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoYCR7a2V5fTogJHt2YWx1ZX1cXHJcXG5gKSk7XG4gIH1cbiAgYXdhaXQgd3JpdGVyLndyaXRlKGVuY29kZXIuZW5jb2RlKFwiXFxyXFxuXCIpKTtcbiAgYXdhaXQgd3JpdGVyLmZsdXNoKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVJlc3BvbnNlKFxuICB3OiBEZW5vLldyaXRlcixcbiAgcjogUmVzcG9uc2UsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcHJvdG9NYWpvciA9IDE7XG4gIGNvbnN0IHByb3RvTWlub3IgPSAxO1xuICBjb25zdCBzdGF0dXNDb2RlID0gci5zdGF0dXMgfHwgMjAwO1xuICBjb25zdCBzdGF0dXNUZXh0ID0gU1RBVFVTX1RFWFQuZ2V0KHN0YXR1c0NvZGUpO1xuICBjb25zdCB3cml0ZXIgPSBCdWZXcml0ZXIuY3JlYXRlKHcpO1xuICBpZiAoIXN0YXR1c1RleHQpIHtcbiAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSW52YWxpZERhdGEoXCJCYWQgc3RhdHVzIGNvZGVcIik7XG4gIH1cbiAgaWYgKCFyLmJvZHkpIHtcbiAgICByLmJvZHkgPSBuZXcgVWludDhBcnJheSgpO1xuICB9XG4gIGlmICh0eXBlb2Ygci5ib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgci5ib2R5ID0gZW5jb2Rlci5lbmNvZGUoci5ib2R5KTtcbiAgfVxuXG4gIGxldCBvdXQgPSBgSFRUUC8ke3Byb3RvTWFqb3J9LiR7cHJvdG9NaW5vcn0gJHtzdGF0dXNDb2RlfSAke3N0YXR1c1RleHR9XFxyXFxuYDtcblxuICBjb25zdCBoZWFkZXJzID0gci5oZWFkZXJzID8/IG5ldyBIZWFkZXJzKCk7XG5cbiAgaWYgKHIuYm9keSAmJiAhaGVhZGVycy5nZXQoXCJjb250ZW50LWxlbmd0aFwiKSkge1xuICAgIGlmIChyLmJvZHkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICBvdXQgKz0gYGNvbnRlbnQtbGVuZ3RoOiAke3IuYm9keS5ieXRlTGVuZ3RofVxcclxcbmA7XG4gICAgfSBlbHNlIGlmICghaGVhZGVycy5nZXQoXCJ0cmFuc2Zlci1lbmNvZGluZ1wiKSkge1xuICAgICAgb3V0ICs9IFwidHJhbnNmZXItZW5jb2Rpbmc6IGNodW5rZWRcXHJcXG5cIjtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBoZWFkZXJzKSB7XG4gICAgb3V0ICs9IGAke2tleX06ICR7dmFsdWV9XFxyXFxuYDtcbiAgfVxuXG4gIG91dCArPSBgXFxyXFxuYDtcblxuICBjb25zdCBoZWFkZXIgPSBlbmNvZGVyLmVuY29kZShvdXQpO1xuICBjb25zdCBuID0gYXdhaXQgd3JpdGVyLndyaXRlKGhlYWRlcik7XG4gIGFzc2VydChuID09PSBoZWFkZXIuYnl0ZUxlbmd0aCk7XG5cbiAgaWYgKHIuYm9keSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICBjb25zdCBuID0gYXdhaXQgd3JpdGVyLndyaXRlKHIuYm9keSk7XG4gICAgYXNzZXJ0KG4gPT09IHIuYm9keS5ieXRlTGVuZ3RoKTtcbiAgfSBlbHNlIGlmIChoZWFkZXJzLmhhcyhcImNvbnRlbnQtbGVuZ3RoXCIpKSB7XG4gICAgY29uc3QgY29udGVudExlbmd0aCA9IGhlYWRlcnMuZ2V0KFwiY29udGVudC1sZW5ndGhcIik7XG4gICAgYXNzZXJ0KGNvbnRlbnRMZW5ndGggIT0gbnVsbCk7XG4gICAgY29uc3QgYm9keUxlbmd0aCA9IHBhcnNlSW50KGNvbnRlbnRMZW5ndGgpO1xuICAgIGNvbnN0IG4gPSBhd2FpdCBEZW5vLmNvcHkoci5ib2R5LCB3cml0ZXIpO1xuICAgIGFzc2VydChuID09PSBib2R5TGVuZ3RoKTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCB3cml0ZUNodW5rZWRCb2R5KHdyaXRlciwgci5ib2R5KTtcbiAgfVxuICBpZiAoci50cmFpbGVycykge1xuICAgIGNvbnN0IHQgPSBhd2FpdCByLnRyYWlsZXJzKCk7XG4gICAgYXdhaXQgd3JpdGVUcmFpbGVycyh3cml0ZXIsIGhlYWRlcnMsIHQpO1xuICB9XG4gIGF3YWl0IHdyaXRlci5mbHVzaCgpO1xufVxuXG4vKipcbiAqIFBhcnNlSFRUUFZlcnNpb24gcGFyc2VzIGEgSFRUUCB2ZXJzaW9uIHN0cmluZy5cbiAqIFwiSFRUUC8xLjBcIiByZXR1cm5zICgxLCAwKS5cbiAqIFBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi9mNWM0M2I5L3NyYy9uZXQvaHR0cC9yZXF1ZXN0LmdvI0w3NjYtTDc5MlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VIVFRQVmVyc2lvbih2ZXJzOiBzdHJpbmcpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgc3dpdGNoICh2ZXJzKSB7XG4gICAgY2FzZSBcIkhUVFAvMS4xXCI6XG4gICAgICByZXR1cm4gWzEsIDFdO1xuXG4gICAgY2FzZSBcIkhUVFAvMS4wXCI6XG4gICAgICByZXR1cm4gWzEsIDBdO1xuXG4gICAgZGVmYXVsdDoge1xuICAgICAgY29uc3QgQmlnID0gMTAwMDAwMDsgLy8gYXJiaXRyYXJ5IHVwcGVyIGJvdW5kXG5cbiAgICAgIGlmICghdmVycy5zdGFydHNXaXRoKFwiSFRUUC9cIikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRvdCA9IHZlcnMuaW5kZXhPZihcIi5cIik7XG4gICAgICBpZiAoZG90IDwgMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWFqb3JTdHIgPSB2ZXJzLnN1YnN0cmluZyh2ZXJzLmluZGV4T2YoXCIvXCIpICsgMSwgZG90KTtcbiAgICAgIGNvbnN0IG1ham9yID0gTnVtYmVyKG1ham9yU3RyKTtcbiAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihtYWpvcikgfHwgbWFqb3IgPCAwIHx8IG1ham9yID4gQmlnKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaW5vclN0ciA9IHZlcnMuc3Vic3RyaW5nKGRvdCArIDEpO1xuICAgICAgY29uc3QgbWlub3IgPSBOdW1iZXIobWlub3JTdHIpO1xuICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG1pbm9yKSB8fCBtaW5vciA8IDAgfHwgbWlub3IgPiBCaWcpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbbWFqb3IsIG1pbm9yXTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYG1hbGZvcm1lZCBIVFRQIHZlcnNpb24gJHt2ZXJzfWApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFJlcXVlc3QoXG4gIGNvbm46IERlbm8uQ29ubixcbiAgYnVmcjogQnVmUmVhZGVyLFxuKTogUHJvbWlzZTxTZXJ2ZXJSZXF1ZXN0IHwgbnVsbD4ge1xuICBjb25zdCB0cCA9IG5ldyBUZXh0UHJvdG9SZWFkZXIoYnVmcik7XG4gIGNvbnN0IGZpcnN0TGluZSA9IGF3YWl0IHRwLnJlYWRMaW5lKCk7IC8vIGUuZy4gR0VUIC9pbmRleC5odG1sIEhUVFAvMS4wXG4gIGlmIChmaXJzdExpbmUgPT09IG51bGwpIHJldHVybiBudWxsO1xuICBjb25zdCBoZWFkZXJzID0gYXdhaXQgdHAucmVhZE1JTUVIZWFkZXIoKTtcbiAgaWYgKGhlYWRlcnMgPT09IG51bGwpIHRocm93IG5ldyBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mKCk7XG5cbiAgY29uc3QgcmVxID0gbmV3IFNlcnZlclJlcXVlc3QoKTtcbiAgcmVxLmNvbm4gPSBjb25uO1xuICByZXEuciA9IGJ1ZnI7XG4gIFtyZXEubWV0aG9kLCByZXEudXJsLCByZXEucHJvdG9dID0gZmlyc3RMaW5lLnNwbGl0KFwiIFwiLCAzKTtcbiAgW3JlcS5wcm90b01ham9yLCByZXEucHJvdG9NaW5vcl0gPSBwYXJzZUhUVFBWZXJzaW9uKHJlcS5wcm90byk7XG4gIHJlcS5oZWFkZXJzID0gaGVhZGVycztcbiAgZml4TGVuZ3RoKHJlcSk7XG4gIHJldHVybiByZXE7XG59XG5cbmZ1bmN0aW9uIGZpeExlbmd0aChyZXE6IFNlcnZlclJlcXVlc3QpOiB2b2lkIHtcbiAgY29uc3QgY29udGVudExlbmd0aCA9IHJlcS5oZWFkZXJzLmdldChcIkNvbnRlbnQtTGVuZ3RoXCIpO1xuICBpZiAoY29udGVudExlbmd0aCkge1xuICAgIGNvbnN0IGFyckNsZW4gPSBjb250ZW50TGVuZ3RoLnNwbGl0KFwiLFwiKTtcbiAgICBpZiAoYXJyQ2xlbi5sZW5ndGggPiAxKSB7XG4gICAgICBjb25zdCBkaXN0aW5jdCA9IFsuLi5uZXcgU2V0KGFyckNsZW4ubWFwKChlKTogc3RyaW5nID0+IGUudHJpbSgpKSldO1xuICAgICAgaWYgKGRpc3RpbmN0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW5ub3QgY29udGFpbiBtdWx0aXBsZSBDb250ZW50LUxlbmd0aCBoZWFkZXJzXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxLmhlYWRlcnMuc2V0KFwiQ29udGVudC1MZW5ndGhcIiwgZGlzdGluY3RbMF0pO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjID0gcmVxLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1MZW5ndGhcIik7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09IFwiSEVBRFwiICYmIGMgJiYgYyAhPT0gXCIwXCIpIHtcbiAgICAgIHRocm93IEVycm9yKFwiaHR0cDogbWV0aG9kIGNhbm5vdCBjb250YWluIGEgQ29udGVudC1MZW5ndGhcIik7XG4gICAgfVxuICAgIGlmIChjICYmIHJlcS5oZWFkZXJzLmhhcyhcInRyYW5zZmVyLWVuY29kaW5nXCIpKSB7XG4gICAgICAvLyBBIHNlbmRlciBNVVNUIE5PVCBzZW5kIGEgQ29udGVudC1MZW5ndGggaGVhZGVyIGZpZWxkIGluIGFueSBtZXNzYWdlXG4gICAgICAvLyB0aGF0IGNvbnRhaW5zIGEgVHJhbnNmZXItRW5jb2RpbmcgaGVhZGVyIGZpZWxkLlxuICAgICAgLy8gcmZjOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzIzMCNzZWN0aW9uLTMuMy4yXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiaHR0cDogVHJhbnNmZXItRW5jb2RpbmcgYW5kIENvbnRlbnQtTGVuZ3RoIGNhbm5vdCBiZSBzZW5kIHRvZ2V0aGVyXCIsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFvQixTQUFTLFFBQVEsaUJBQWlCO0FBQ3RELFNBQVMsZUFBZSxRQUFRLHNCQUFzQjtBQUN0RCxTQUFTLE1BQU0sUUFBUSxxQkFBcUI7QUFDNUMsU0FBbUIsYUFBYSxRQUFRLGNBQWM7QUFDdEQsU0FBUyxXQUFXLFFBQVEsbUJBQW1CO0FBRS9DLE1BQU0sVUFBVSxJQUFJO0FBRXBCLE9BQU8sU0FBUztFQUNkLE9BQU87SUFDTCxNQUFLLENBQWE7TUFDaEIsT0FBTyxRQUFRLE9BQU8sQ0FBQztJQUN6QjtFQUNGO0FBQ0Y7QUFFQSxPQUFPLFNBQVMsV0FBVyxhQUFxQixFQUFFLENBQVk7RUFDNUQsSUFBSSxZQUFZO0VBQ2hCLElBQUksV0FBVztFQUNmLGVBQWUsS0FBSyxHQUFlO0lBQ2pDLElBQUksVUFBVSxPQUFPO0lBQ3JCLElBQUk7SUFDSixNQUFNLFlBQVksZ0JBQWdCO0lB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