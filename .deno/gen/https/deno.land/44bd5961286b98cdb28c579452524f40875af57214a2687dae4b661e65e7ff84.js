import { base64url } from "./deps.ts";
import { create as createSignature, verify as verifySignature } from "./signature.ts";
import { verify as verifyAlgorithm } from "./algorithm.ts";
export const encoder = new TextEncoder();
export const decoder = new TextDecoder();
/*
 * JWT §4.1.4: Implementers MAY provide for some small leeway to account for
 * clock skew.
 */ function isExpired(exp, leeway = 0) {
  return exp + leeway < Date.now() / 1000;
}
function isTooEarly(nbf, leeway = 0) {
  return nbf - leeway > Date.now() / 1000;
}
function isObject(obj) {
  return obj !== null && typeof obj === "object" && Array.isArray(obj) === false;
}
function is3Tuple(arr) {
  return arr.length === 3;
}
function hasInvalidTimingClaims(...claimValues) {
  return claimValues.some((claimValue)=>claimValue !== undefined ? typeof claimValue !== "number" : false);
}
export function decode(jwt) {
  try {
    const arr = jwt.split(".").map(base64url.decode).map((uint8Array, index)=>index === 0 || index === 1 ? JSON.parse(decoder.decode(uint8Array)) : uint8Array);
    if (is3Tuple(arr)) return arr;
    else throw new Error();
  } catch  {
    throw Error("The serialization of the jwt is invalid.");
  }
}
export function validate([header, payload, signature]) {
  if (typeof header?.alg !== "string") {
    throw new Error(`The jwt's alg header parameter value must be a string.`);
  }
  /*
   * JWT §7.2: Verify that the resulting octet sequence is a UTF-8-encoded
   * representation of a completely valid JSON object conforming to RFC 7159;
   * let the JWT Claims Set be this JSON object.
   */ if (isObject(payload)) {
    if (hasInvalidTimingClaims(payload.exp, payload.nbf)) {
      throw new Error(`The jwt has an invalid 'exp' or 'nbf' claim.`);
    }
    if (typeof payload.exp === "number" && isExpired(payload.exp, 1)) {
      throw RangeError("The jwt is expired.");
    }
    if (typeof payload.nbf === "number" && isTooEarly(payload.nbf, 1)) {
      throw RangeError("The jwt is used too early.");
    }
    return {
      header,
      payload,
      signature
    };
  } else {
    throw new Error(`The jwt claims set is not a JSON object.`);
  }
}
export async function verify(jwt, key) {
  const { header, payload, signature } = validate(decode(jwt));
  if (verifyAlgorithm(header.alg, key)) {
    if (!await verifySignature(signature, key, header.alg, jwt.slice(0, jwt.lastIndexOf(".")))) {
      throw new Error("The jwt's signature does not match the verification signature.");
    }
    return payload;
  } else {
    throw new Error(`The jwt's alg '${header.alg}' does not match the key's algorithm.`);
  }
}
/*
 * JWT §3: JWTs represent a set of claims as a JSON object that is encoded in
 * a JWS and/or JWE structure. This JSON object is the JWT Claims Set.
 * JSW §7.1: The JWS Compact Serialization represents digitally signed or MACed
 * content as a compact, URL-safe string. This string is:
 *       BASE64URL(UTF8(JWS Protected Header)) || '.' ||
 *       BASE64URL(JWS Payload) || '.' ||
 *       BASE64URL(JWS Signature)
 */ function createSigningInput(header, payload) {
  return `${base64url.encode(encoder.encode(JSON.stringify(header)))}.${base64url.encode(encoder.encode(JSON.stringify(payload)))}`;
}
export async function create(header, payload, key) {
  if (verifyAlgorithm(header.alg, key)) {
    const signingInput = createSigningInput(header, payload);
    const signature = await createSignature(header.alg, key, signingInput);
    return `${signingInput}.${signature}`;
  } else {
    throw new Error(`The jwt's alg '${header.alg}' does not match the key's algorithm.`);
  }
}
/*
 * Helper function: getNumericDate()
 * returns the number of seconds since January 1, 1970, 00:00:00 UTC
 */ export function getNumericDate(exp) {
  return Math.round((exp instanceof Date ? exp.getTime() : Date.now() + exp * 1000) / 1000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGp3dEB2Mi40L21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlNjR1cmwgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGUgYXMgY3JlYXRlU2lnbmF0dXJlLFxuICB2ZXJpZnkgYXMgdmVyaWZ5U2lnbmF0dXJlLFxufSBmcm9tIFwiLi9zaWduYXR1cmUudHNcIjtcbmltcG9ydCB7IHZlcmlmeSBhcyB2ZXJpZnlBbGdvcml0aG0gfSBmcm9tIFwiLi9hbGdvcml0aG0udHNcIjtcblxuaW1wb3J0IHR5cGUgeyBBbGdvcml0aG0gfSBmcm9tIFwiLi9hbGdvcml0aG0udHNcIjtcblxuLypcbiAqIEpXVCDCpzQuMTogVGhlIGZvbGxvd2luZyBDbGFpbSBOYW1lcyBhcmUgcmVnaXN0ZXJlZCBpbiB0aGUgSUFOQVxuICogXCJKU09OIFdlYiBUb2tlbiBDbGFpbXNcIiByZWdpc3RyeSBlc3RhYmxpc2hlZCBieSBTZWN0aW9uIDEwLjEuIE5vbmUgb2YgdGhlXG4gKiBjbGFpbXMgZGVmaW5lZCBiZWxvdyBhcmUgaW50ZW5kZWQgdG8gYmUgbWFuZGF0b3J5IHRvIHVzZSBvciBpbXBsZW1lbnQgaW4gYWxsXG4gKiBjYXNlcywgYnV0IHJhdGhlciB0aGV5IHByb3ZpZGUgYSBzdGFydGluZyBwb2ludCBmb3IgYSBzZXQgb2YgdXNlZnVsLFxuICogaW50ZXJvcGVyYWJsZSBjbGFpbXMuXG4gKiBBcHBsaWNhdGlvbnMgdXNpbmcgSldUcyBzaG91bGQgZGVmaW5lIHdoaWNoIHNwZWNpZmljIGNsYWltcyB0aGV5IHVzZSBhbmQgd2hlblxuICogdGhleSBhcmUgcmVxdWlyZWQgb3Igb3B0aW9uYWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZCB7XG4gIGlzcz86IHN0cmluZztcbiAgc3ViPzogc3RyaW5nO1xuICBhdWQ/OiBzdHJpbmdbXSB8IHN0cmluZztcbiAgZXhwPzogbnVtYmVyO1xuICBuYmY/OiBudW1iZXI7XG4gIGlhdD86IG51bWJlcjtcbiAganRpPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKlxuICogSldTIMKnNC4xLjE6IFRoZSBcImFsZ1wiIHZhbHVlIGlzIGEgY2FzZS1zZW5zaXRpdmUgQVNDSUkgc3RyaW5nIGNvbnRhaW5pbmcgYVxuICogU3RyaW5nT3JVUkkgdmFsdWUuIFRoaXMgSGVhZGVyIFBhcmFtZXRlciBNVVNUIGJlIHByZXNlbnQgYW5kIE1VU1QgYmVcbiAqIHVuZGVyc3Rvb2QgYW5kIHByb2Nlc3NlZCBieSBpbXBsZW1lbnRhdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGVhZGVyIHtcbiAgYWxnOiBBbGdvcml0aG07XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbmV4cG9ydCBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5leHBvcnQgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG4vKlxuICogSldUIMKnNC4xLjQ6IEltcGxlbWVudGVycyBNQVkgcHJvdmlkZSBmb3Igc29tZSBzbWFsbCBsZWV3YXkgdG8gYWNjb3VudCBmb3JcbiAqIGNsb2NrIHNrZXcuXG4gKi9cbmZ1bmN0aW9uIGlzRXhwaXJlZChleHA6IG51bWJlciwgbGVld2F5ID0gMCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZXhwICsgbGVld2F5IDwgRGF0ZS5ub3coKSAvIDEwMDA7XG59XG5cbmZ1bmN0aW9uIGlzVG9vRWFybHkobmJmOiBudW1iZXIsIGxlZXdheSA9IDApOiBib29sZWFuIHtcbiAgcmV0dXJuIG5iZiAtIGxlZXdheSA+IERhdGUubm93KCkgLyAxMDAwO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChvYmo6IHVua25vd24pOiBvYmogaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gKFxuICAgIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIEFycmF5LmlzQXJyYXkob2JqKSA9PT0gZmFsc2VcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXMzVHVwbGUoYXJyOiBhbnlbXSk6IGFyciBpcyBbdW5rbm93biwgdW5rbm93biwgVWludDhBcnJheV0ge1xuICByZXR1cm4gYXJyLmxlbmd0aCA9PT0gMztcbn1cblxuZnVuY3Rpb24gaGFzSW52YWxpZFRpbWluZ0NsYWltcyguLi5jbGFpbVZhbHVlczogdW5rbm93bltdKTogYm9vbGVhbiB7XG4gIHJldHVybiBjbGFpbVZhbHVlcy5zb21lKChjbGFpbVZhbHVlKSA9PlxuICAgIGNsYWltVmFsdWUgIT09IHVuZGVmaW5lZCA/IHR5cGVvZiBjbGFpbVZhbHVlICE9PSBcIm51bWJlclwiIDogZmFsc2VcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShcbiAgand0OiBzdHJpbmcsXG4pOiBbaGVhZGVyOiB1bmtub3duLCBwYXlsb2FkOiB1bmtub3duLCBzaWduYXR1cmU6IFVpbnQ4QXJyYXldIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhcnIgPSBqd3RcbiAgICAgIC5zcGxpdChcIi5cIilcbiAgICAgIC5tYXAoYmFzZTY0dXJsLmRlY29kZSlcbiAgICAgIC5tYXAoKHVpbnQ4QXJyYXksIGluZGV4KSA9PlxuICAgICAgICBpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gMVxuICAgICAgICAgID8gSlNPTi5wYXJzZShkZWNvZGVyLmRlY29kZSh1aW50OEFycmF5KSlcbiAgICAgICAgICA6IHVpbnQ4QXJyYXlcbiAgICAgICk7XG4gICAgaWYgKGlzM1R1cGxlKGFycikpIHJldHVybiBhcnI7XG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgRXJyb3IoXCJUaGUgc2VyaWFsaXphdGlvbiBvZiB0aGUgand0IGlzIGludmFsaWQuXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZShcbiAgW2hlYWRlciwgcGF5bG9hZCwgc2lnbmF0dXJlXTogW2FueSwgYW55LCBVaW50OEFycmF5XSxcbik6IHtcbiAgaGVhZGVyOiBIZWFkZXI7XG4gIHBheWxvYWQ6IFBheWxvYWQ7XG4gIHNpZ25hdHVyZTogVWludDhBcnJheTtcbn0ge1xuICBpZiAodHlwZW9mIGhlYWRlcj8uYWxnICE9PSBcInN0cmluZ1wiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgand0J3MgYWxnIGhlYWRlciBwYXJhbWV0ZXIgdmFsdWUgbXVzdCBiZSBhIHN0cmluZy5gKTtcbiAgfVxuXG4gIC8qXG4gICAqIEpXVCDCpzcuMjogVmVyaWZ5IHRoYXQgdGhlIHJlc3VsdGluZyBvY3RldCBzZXF1ZW5jZSBpcyBhIFVURi04LWVuY29kZWRcbiAgICogcmVwcmVzZW50YXRpb24gb2YgYSBjb21wbGV0ZWx5IHZhbGlkIEpTT04gb2JqZWN0IGNvbmZvcm1pbmcgdG8gUkZDIDcxNTk7XG4gICAqIGxldCB0aGUgSldUIENsYWltcyBTZXQgYmUgdGhpcyBKU09OIG9iamVjdC5cbiAgICovXG4gIGlmIChpc09iamVjdChwYXlsb2FkKSkge1xuICAgIGlmIChoYXNJbnZhbGlkVGltaW5nQ2xhaW1zKHBheWxvYWQuZXhwLCBwYXlsb2FkLm5iZikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGp3dCBoYXMgYW4gaW52YWxpZCAnZXhwJyBvciAnbmJmJyBjbGFpbS5gKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBheWxvYWQuZXhwID09PSBcIm51bWJlclwiICYmIGlzRXhwaXJlZChwYXlsb2FkLmV4cCwgMSkpIHtcbiAgICAgIHRocm93IFJhbmdlRXJyb3IoXCJUaGUgand0IGlzIGV4cGlyZWQuXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGF5bG9hZC5uYmYgPT09IFwibnVtYmVyXCIgJiYgaXNUb29FYXJseShwYXlsb2FkLm5iZiwgMSkpIHtcbiAgICAgIHRocm93IFJhbmdlRXJyb3IoXCJUaGUgand0IGlzIHVzZWQgdG9vIGVhcmx5LlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaGVhZGVyLFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHNpZ25hdHVyZSxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGp3dCBjbGFpbXMgc2V0IGlzIG5vdCBhIEpTT04gb2JqZWN0LmApO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnkoXG4gIGp3dDogc3RyaW5nLFxuICBrZXk6IENyeXB0b0tleSB8IG51bGwsXG4pOiBQcm9taXNlPFBheWxvYWQ+IHtcbiAgY29uc3QgeyBoZWFkZXIsIHBheWxvYWQsIHNpZ25hdHVyZSB9ID0gdmFsaWRhdGUoZGVjb2RlKGp3dCkpO1xuICBpZiAodmVyaWZ5QWxnb3JpdGhtKGhlYWRlci5hbGcsIGtleSkpIHtcbiAgICBpZiAoXG4gICAgICAhKGF3YWl0IHZlcmlmeVNpZ25hdHVyZShcbiAgICAgICAgc2lnbmF0dXJlLFxuICAgICAgICBrZXksXG4gICAgICAgIGhlYWRlci5hbGcsXG4gICAgICAgIGp3dC5zbGljZSgwLCBqd3QubGFzdEluZGV4T2YoXCIuXCIpKSxcbiAgICAgICkpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiVGhlIGp3dCdzIHNpZ25hdHVyZSBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyaWZpY2F0aW9uIHNpZ25hdHVyZS5cIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBheWxvYWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRoZSBqd3QncyBhbGcgJyR7aGVhZGVyLmFsZ30nIGRvZXMgbm90IG1hdGNoIHRoZSBrZXkncyBhbGdvcml0aG0uYCxcbiAgICApO1xuICB9XG59XG5cbi8qXG4gKiBKV1QgwqczOiBKV1RzIHJlcHJlc2VudCBhIHNldCBvZiBjbGFpbXMgYXMgYSBKU09OIG9iamVjdCB0aGF0IGlzIGVuY29kZWQgaW5cbiAqIGEgSldTIGFuZC9vciBKV0Ugc3RydWN0dXJlLiBUaGlzIEpTT04gb2JqZWN0IGlzIHRoZSBKV1QgQ2xhaW1zIFNldC5cbiAqIEpTVyDCpzcuMTogVGhlIEpXUyBDb21wYWN0IFNlcmlhbGl6YXRpb24gcmVwcmVzZW50cyBkaWdpdGFsbHkgc2lnbmVkIG9yIE1BQ2VkXG4gKiBjb250ZW50IGFzIGEgY29tcGFjdCwgVVJMLXNhZmUgc3RyaW5nLiBUaGlzIHN0cmluZyBpczpcbiAqICAgICAgIEJBU0U2NFVSTChVVEY4KEpXUyBQcm90ZWN0ZWQgSGVhZGVyKSkgfHwgJy4nIHx8XG4gKiAgICAgICBCQVNFNjRVUkwoSldTIFBheWxvYWQpIHx8ICcuJyB8fFxuICogICAgICAgQkFTRTY0VVJMKEpXUyBTaWduYXR1cmUpXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNpZ25pbmdJbnB1dChoZWFkZXI6IEhlYWRlciwgcGF5bG9hZDogUGF5bG9hZCk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtiYXNlNjR1cmwuZW5jb2RlKGVuY29kZXIuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGhlYWRlcikpKX0uJHtcbiAgICBiYXNlNjR1cmwuZW5jb2RlKGVuY29kZXIuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKSlcbiAgfWA7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGUoXG4gIGhlYWRlcjogSGVhZGVyLFxuICBwYXlsb2FkOiBQYXlsb2FkLFxuICBrZXk6IENyeXB0b0tleSB8IG51bGwsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAodmVyaWZ5QWxnb3JpdGhtKGhlYWRlci5hbGcsIGtleSkpIHtcbiAgICBjb25zdCBzaWduaW5nSW5wdXQgPSBjcmVhdGVTaWduaW5nSW5wdXQoaGVhZGVyLCBwYXlsb2FkKTtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBjcmVhdGVTaWduYXR1cmUoaGVhZGVyLmFsZywga2V5LCBzaWduaW5nSW5wdXQpO1xuXG4gICAgcmV0dXJuIGAke3NpZ25pbmdJbnB1dH0uJHtzaWduYXR1cmV9YDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVGhlIGp3dCdzIGFsZyAnJHtoZWFkZXIuYWxnfScgZG9lcyBub3QgbWF0Y2ggdGhlIGtleSdzIGFsZ29yaXRobS5gLFxuICAgICk7XG4gIH1cbn1cblxuLypcbiAqIEhlbHBlciBmdW5jdGlvbjogZ2V0TnVtZXJpY0RhdGUoKVxuICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgc2luY2UgSmFudWFyeSAxLCAxOTcwLCAwMDowMDowMCBVVENcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWVyaWNEYXRlKGV4cDogbnVtYmVyIHwgRGF0ZSk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnJvdW5kKFxuICAgIChleHAgaW5zdGFuY2VvZiBEYXRlID8gZXhwLmdldFRpbWUoKSA6IERhdGUubm93KCkgKyBleHAgKiAxMDAwKSAvIDEwMDAsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxTQUFTLFFBQVEsWUFBWTtBQUN0QyxTQUNFLFVBQVUsZUFBZSxFQUN6QixVQUFVLGVBQWUsUUFDcEIsaUJBQWlCO0FBQ3hCLFNBQVMsVUFBVSxlQUFlLFFBQVEsaUJBQWlCO0FBa0MzRCxPQUFPLE1BQU0sVUFBVSxJQUFJLGNBQWM7QUFDekMsT0FBTyxNQUFNLFVBQVUsSUFBSSxjQUFjO0FBRXpDOzs7Q0FHQyxHQUNELFNBQVMsVUFBVSxHQUFXLEVBQUUsU0FBUyxDQUFDO0VBQ3hDLE9BQU8sTUFBTSxTQUFTLEtBQUssR0FBRyxLQUFLO0FBQ3JDO0FBRUEsU0FBUyxXQUFXLEdBQVcsRUFBRSxTQUFTLENBQUM7RUFDekMsT0FBTyxNQUFNLFNBQVMsS0FBSyxHQUFHLEtBQUs7QUFDckM7QUFFQSxTQUFTLFNBQVMsR0FBWTtFQUM1QixPQUNFLFFBQVEsUUFBUSxPQUFPLFFBQVEsWUFBWSxNQUFNLE9BQU8sQ0FBQyxTQUFTO0FBRXRFO0FBRUEsU0FBUyxTQUFTLEdBQVU7RUFDMUIsT0FBTyxJ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