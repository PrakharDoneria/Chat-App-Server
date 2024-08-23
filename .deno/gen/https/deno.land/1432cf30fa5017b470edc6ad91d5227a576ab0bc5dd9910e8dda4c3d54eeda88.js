import { getAlgorithm } from "./algorithm.ts";
import { base64url } from "./deps.ts";
import { encoder } from "./mod.ts";
export async function verify(signature, key, alg, signingInput) {
  return key === null ? signature.length === 0 : await crypto.subtle.verify(getAlgorithm(alg), key, signature, encoder.encode(signingInput));
}
export async function create(alg, key, signingInput) {
  return key === null ? "" : base64url.encode(new Uint8Array(await crypto.subtle.sign(getAlgorithm(alg), key, encoder.encode(signingInput))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGp3dEB2Mi40L3NpZ25hdHVyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBbGdvcml0aG0gfSBmcm9tIFwiLi9hbGdvcml0aG0udHNcIjtcbmltcG9ydCB7IGJhc2U2NHVybCB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IGVuY29kZXIgfSBmcm9tIFwiLi9tb2QudHNcIjtcblxuaW1wb3J0IHR5cGUgeyBBbGdvcml0aG0gfSBmcm9tIFwiLi9hbGdvcml0aG0udHNcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeShcbiAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICBrZXk6IENyeXB0b0tleSB8IG51bGwsXG4gIGFsZzogQWxnb3JpdGhtLFxuICBzaWduaW5nSW5wdXQ6IHN0cmluZyxcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4ga2V5ID09PSBudWxsID8gc2lnbmF0dXJlLmxlbmd0aCA9PT0gMCA6IGF3YWl0IGNyeXB0by5zdWJ0bGUudmVyaWZ5KFxuICAgIGdldEFsZ29yaXRobShhbGcpLFxuICAgIGtleSxcbiAgICBzaWduYXR1cmUsXG4gICAgZW5jb2Rlci5lbmNvZGUoc2lnbmluZ0lucHV0KSxcbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZShcbiAgYWxnOiBBbGdvcml0aG0sXG4gIGtleTogQ3J5cHRvS2V5IHwgbnVsbCxcbiAgc2lnbmluZ0lucHV0OiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4ga2V5ID09PSBudWxsID8gXCJcIiA6IGJhc2U2NHVybC5lbmNvZGUoXG4gICAgbmV3IFVpbnQ4QXJyYXkoXG4gICAgICBhd2FpdCBjcnlwdG8uc3VidGxlLnNpZ24oXG4gICAgICAgIGdldEFsZ29yaXRobShhbGcpLFxuICAgICAgICBrZXksXG4gICAgICAgIGVuY29kZXIuZW5jb2RlKHNpZ25pbmdJbnB1dCksXG4gICAgICApLFxuICAgICksXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsaUJBQWlCO0FBQzlDLFNBQVMsU0FBUyxRQUFRLFlBQVk7QUFDdEMsU0FBUyxPQUFPLFFBQVEsV0FBVztBQUluQyxPQUFPLGVBQWUsT0FDcEIsU0FBcUIsRUFDckIsR0FBcUIsRUFDckIsR0FBYyxFQUNkLFlBQW9CO0VBRXBCLE9BQU8sUUFBUSxPQUFPLFVBQVUsTUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQ3ZFLGFBQWEsTUFDYixLQUNBLFdBQ0EsUUFBUSxNQUFNLENBQUM7QUFFbkI7QUFFQSxPQUFPLGVBQWUsT0FDcEIsR0FBYyxFQUNkLEdBQXFCLEVBQ3JCLFlBQW9CO0VBRXBCLE9BQU8sUUFBUSxPQUFPLEtBQUssVUFBVSxNQUFNLENBQ3pDLElBQUksV0FDRixNQUFNLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FDdEIsYUFBYSxNQUNiLEtBQ0EsUUFBUSxNQUFNLENBQUM7QUFJdkIifQ==