/*
 * JSW §1: Cryptographic algorithms and identifiers for use with this specification
 * are described in the separate JSON Web Algorithms (JWA) specification:
 * https://www.rfc-editor.org/rfc/rfc7518
 */ function isHashedKeyAlgorithm(algorithm) {
  return typeof algorithm.hash?.name === "string";
}
function isEcKeyAlgorithm(algorithm) {
  return typeof algorithm.namedCurve === "string";
}
export function verify(alg, key) {
  if (alg === "none") {
    if (key !== null) throw new Error(`The alg '${alg}' does not allow a key.`);
    else return true;
  } else {
    if (!key) throw new Error(`The alg '${alg}' demands a key.`);
    const keyAlgorithm = key.algorithm;
    const algAlgorithm = getAlgorithm(alg);
    if (keyAlgorithm.name === algAlgorithm.name) {
      if (isHashedKeyAlgorithm(keyAlgorithm)) {
        return keyAlgorithm.hash.name === algAlgorithm.hash.name;
      } else if (isEcKeyAlgorithm(keyAlgorithm)) {
        return keyAlgorithm.namedCurve === algAlgorithm.namedCurve;
      }
    }
    return false;
  }
}
export function getAlgorithm(alg) {
  switch(alg){
    case "HS256":
      return {
        hash: {
          name: "SHA-256"
        },
        name: "HMAC"
      };
    case "HS384":
      return {
        hash: {
          name: "SHA-384"
        },
        name: "HMAC"
      };
    case "HS512":
      return {
        hash: {
          name: "SHA-512"
        },
        name: "HMAC"
      };
    case "PS256":
      return {
        hash: {
          name: "SHA-256"
        },
        name: "RSA-PSS",
        saltLength: 256 >> 3
      };
    case "PS384":
      return {
        hash: {
          name: "SHA-384"
        },
        name: "RSA-PSS",
        saltLength: 384 >> 3
      };
    case "PS512":
      return {
        hash: {
          name: "SHA-512"
        },
        name: "RSA-PSS",
        saltLength: 512 >> 3
      };
    case "RS256":
      return {
        hash: {
          name: "SHA-256"
        },
        name: "RSASSA-PKCS1-v1_5"
      };
    case "RS384":
      return {
        hash: {
          name: "SHA-384"
        },
        name: "RSASSA-PKCS1-v1_5"
      };
    case "RS512":
      return {
        hash: {
          name: "SHA-512"
        },
        name: "RSASSA-PKCS1-v1_5"
      };
    case "ES256":
      return {
        hash: {
          name: "SHA-256"
        },
        name: "ECDSA",
        namedCurve: "P-256"
      };
    case "ES384":
      return {
        hash: {
          name: "SHA-384"
        },
        name: "ECDSA",
        namedCurve: "P-384"
      };
    // case "ES512":
    // return { hash: { name: "SHA-512" }, name: "ECDSA", namedCurve: "P-521" };
    default:
      throw new Error(`The jwt's alg '${alg}' is not supported.`);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGp3dEB2Mi40L2FsZ29yaXRobS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogSlNXIMKnMTogQ3J5cHRvZ3JhcGhpYyBhbGdvcml0aG1zIGFuZCBpZGVudGlmaWVycyBmb3IgdXNlIHdpdGggdGhpcyBzcGVjaWZpY2F0aW9uXG4gKiBhcmUgZGVzY3JpYmVkIGluIHRoZSBzZXBhcmF0ZSBKU09OIFdlYiBBbGdvcml0aG1zIChKV0EpIHNwZWNpZmljYXRpb246XG4gKiBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNzUxOFxuICovXG5leHBvcnQgdHlwZSBBbGdvcml0aG0gPVxuICB8IFwiSFMyNTZcIlxuICB8IFwiSFMzODRcIlxuICB8IFwiSFM1MTJcIlxuICB8IFwiUFMyNTZcIlxuICB8IFwiUFMzODRcIlxuICB8IFwiUFM1MTJcIlxuICB8IFwiUlMyNTZcIlxuICB8IFwiUlMzODRcIlxuICB8IFwiUlM1MTJcIlxuICB8IFwiRVMyNTZcIlxuICB8IFwiRVMzODRcIlxuICAvLyBOb3Qgc3VwcG9ydGVkIHlldDpcbiAgLy8gfCBcIkVTNTEyXCJcbiAgfCBcIm5vbmVcIjtcblxuZnVuY3Rpb24gaXNIYXNoZWRLZXlBbGdvcml0aG0oXG4gIGFsZ29yaXRobTogYW55LFxuKTogYWxnb3JpdGhtIGlzIEhtYWNLZXlBbGdvcml0aG0gfCBSc2FIYXNoZWRLZXlBbGdvcml0aG0ge1xuICByZXR1cm4gdHlwZW9mIGFsZ29yaXRobS5oYXNoPy5uYW1lID09PSBcInN0cmluZ1wiO1xufVxuXG5mdW5jdGlvbiBpc0VjS2V5QWxnb3JpdGhtKFxuICBhbGdvcml0aG06IGFueSxcbik6IGFsZ29yaXRobSBpcyBFY0tleUFsZ29yaXRobSB7XG4gIHJldHVybiB0eXBlb2YgYWxnb3JpdGhtLm5hbWVkQ3VydmUgPT09IFwic3RyaW5nXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoXG4gIGFsZzogQWxnb3JpdGhtLFxuICBrZXk6IENyeXB0b0tleSB8IG51bGwsXG4pOiBib29sZWFuIHtcbiAgaWYgKGFsZyA9PT0gXCJub25lXCIpIHtcbiAgICBpZiAoa2V5ICE9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoYFRoZSBhbGcgJyR7YWxnfScgZG9lcyBub3QgYWxsb3cgYSBrZXkuYCk7XG4gICAgZWxzZSByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWtleSkgdGhyb3cgbmV3IEVycm9yKGBUaGUgYWxnICcke2FsZ30nIGRlbWFuZHMgYSBrZXkuYCk7XG4gICAgY29uc3Qga2V5QWxnb3JpdGhtID0ga2V5LmFsZ29yaXRobTtcbiAgICBjb25zdCBhbGdBbGdvcml0aG0gPSBnZXRBbGdvcml0aG0oYWxnKTtcbiAgICBpZiAoa2V5QWxnb3JpdGhtLm5hbWUgPT09IGFsZ0FsZ29yaXRobS5uYW1lKSB7XG4gICAgICBpZiAoaXNIYXNoZWRLZXlBbGdvcml0aG0oa2V5QWxnb3JpdGhtKSkge1xuICAgICAgICByZXR1cm4ga2V5QWxnb3JpdGhtLmhhc2gubmFtZSA9PT0gYWxnQWxnb3JpdGhtLmhhc2gubmFtZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNFY0tleUFsZ29yaXRobShrZXlBbGdvcml0aG0pKSB7XG4gICAgICAgIHJldHVybiBrZXlBbGdvcml0aG0ubmFtZWRDdXJ2ZSA9PT0gYWxnQWxnb3JpdGhtLm5hbWVkQ3VydmU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxnb3JpdGhtKFxuICBhbGc6IEFsZ29yaXRobSxcbikge1xuICBzd2l0Y2ggKGFsZykge1xuICAgIGNhc2UgXCJIUzI1NlwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS0yNTZcIiB9LCBuYW1lOiBcIkhNQUNcIiB9O1xuICAgIGNhc2UgXCJIUzM4NFwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS0zODRcIiB9LCBuYW1lOiBcIkhNQUNcIiB9O1xuICAgIGNhc2UgXCJIUzUxMlwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS01MTJcIiB9LCBuYW1lOiBcIkhNQUNcIiB9O1xuICAgIGNhc2UgXCJQUzI1NlwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogeyBuYW1lOiBcIlNIQS0yNTZcIiB9LFxuICAgICAgICBuYW1lOiBcIlJTQS1QU1NcIixcbiAgICAgICAgc2FsdExlbmd0aDogMjU2ID4+IDMsXG4gICAgICB9O1xuICAgIGNhc2UgXCJQUzM4NFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogeyBuYW1lOiBcIlNIQS0zODRcIiB9LFxuICAgICAgICBuYW1lOiBcIlJTQS1QU1NcIixcbiAgICAgICAgc2FsdExlbmd0aDogMzg0ID4+IDMsXG4gICAgICB9O1xuICAgIGNhc2UgXCJQUzUxMlwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogeyBuYW1lOiBcIlNIQS01MTJcIiB9LFxuICAgICAgICBuYW1lOiBcIlJTQS1QU1NcIixcbiAgICAgICAgc2FsdExlbmd0aDogNTEyID4+IDMsXG4gICAgICB9O1xuICAgIGNhc2UgXCJSUzI1NlwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS0yNTZcIiB9LCBuYW1lOiBcIlJTQVNTQS1QS0NTMS12MV81XCIgfTtcbiAgICBjYXNlIFwiUlMzODRcIjpcbiAgICAgIHJldHVybiB7IGhhc2g6IHsgbmFtZTogXCJTSEEtMzg0XCIgfSwgbmFtZTogXCJSU0FTU0EtUEtDUzEtdjFfNVwiIH07XG4gICAgY2FzZSBcIlJTNTEyXCI6XG4gICAgICByZXR1cm4geyBoYXNoOiB7IG5hbWU6IFwiU0hBLTUxMlwiIH0sIG5hbWU6IFwiUlNBU1NBLVBLQ1MxLXYxXzVcIiB9O1xuICAgIGNhc2UgXCJFUzI1NlwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS0yNTZcIiB9LCBuYW1lOiBcIkVDRFNBXCIsIG5hbWVkQ3VydmU6IFwiUC0yNTZcIiB9O1xuICAgIGNhc2UgXCJFUzM4NFwiOlxuICAgICAgcmV0dXJuIHsgaGFzaDogeyBuYW1lOiBcIlNIQS0zODRcIiB9LCBuYW1lOiBcIkVDRFNBXCIsIG5hbWVkQ3VydmU6IFwiUC0zODRcIiB9O1xuICAgIC8vIGNhc2UgXCJFUzUxMlwiOlxuICAgIC8vIHJldHVybiB7IGhhc2g6IHsgbmFtZTogXCJTSEEtNTEyXCIgfSwgbmFtZTogXCJFQ0RTQVwiLCBuYW1lZEN1cnZlOiBcIlAtNTIxXCIgfTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgand0J3MgYWxnICcke2FsZ30nIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztDQUlDLEdBaUJELFNBQVMscUJBQ1AsU0FBYztFQUVkLE9BQU8sT0FBTyxVQUFVLElBQUksRUFBRSxTQUFTO0FBQ3pDO0FBRUEsU0FBUyxpQkFDUCxTQUFjO0VBRWQsT0FBTyxPQUFPLFVBQVUsVUFBVSxLQUFLO0FBQ3pDO0FBRUEsT0FBTyxTQUFTLE9BQ2QsR0FBYyxFQUNkLEdBQXFCO0VBRXJCLElBQUksUUFBUSxRQUFRO0lBQ2xCLElBQUksUUFBUSxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksdUJBQXVCLENBQUM7U0FDckUsT0FBTztFQUNkLE9BQU87SUFDTCxJQUFJLENBQUMsS0FBSyxNQUFNLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLGdCQUFnQixDQUFDO0lBQzNELE1BQU0sZUFBZSxJQUFJLFNBQVM7SUFDbEMsTUFBTSxlQUFlLGFBQWE7SUFDbEMsSUFBSSxhQUFhLElBQUksS0FBSyxhQUFhLElBQUksRUFBRTtNQUMzQyxJQUFJLHFCQUFxQixlQUFlO1FBQ3RDLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxLQUFLLGFBQWEsSUFBSSxDQUFDLElBQUk7TUFDMUQsT0FBTyxJQUFJLGlCQUFpQixlQUFlO1FBQ3pDLE9BQU8sYUFBYSxVQUFVLEtBQUssYUFBYSxVQUFVO01BQzVEO0lBQ0Y7SUFDQSxPQUFPO0VBQ1Q7QUFDRjtBQUVBLE9BQU8sU0FBUyxhQUNkLEdBQWM7RUFFZCxPQUFRO0lBQ04sS0FBSztNQUNILE9BQU87UUFBRSxNQUFNO1VBQUUsTUFBTTtRQUFVO1FBQUcsTUFBTTtNQUFPO0lBQ25ELEtBQUs7TUFDSCxPQUFPO1FBQUUsTUFBTTtVQUFFLE1BQU07UUFBVTtRQUFHLE1BQU07TUFBTztJQUNuRCxLQUFLO01BQ0gsT0FBTztRQUFFLE1BQU07VUFBRSxNQUFNO1FBQVU7UUFBRyxNQUFNO01BQU87SUFDbkQsS0FBSztNQUNILE9BQU87UUFDTCxNQUFNO1VBQUUsTUFBTTtRQUFVO1FBQ3hCLE1BQU07UUFDTixZQUFZLE9BQU87TUFDckI7SUFDRixLQUFLO01BQ0gsT0FBTztRQUNMLE1BQU07VUFBRSxNQUFNO1FBQVU7UUFDeEIsTUFBTTtRQUNOLFlBQVksT0FBTztNQUNyQjtJQUNGLEtBQUs7TUFDSCxPQUFPO1FBQ0wsTUFBTTtVQUFFLE1BQU07UUFBVTtRQUN4QixNQUFNO1FBQ04sWUFBWSxPQUFPO01BQ3JCO0lBQ0YsS0FBSztNQUNILE9BQU87UUFBRSxNQUFNO1VBQUUsTUFBTTtRQUFVO1FBQUcsTUFBTTtNQUFvQjtJQUNoRSxLQUFLO01BQ0gsT0FBTztRQUFFLE1BQU07VUFBRSxNQUFNO1FBQVU7UUFBRyxNQUFNO01BQW9CO0lBQ2hFLEtBQUs7TUFDSCxPQUFPO1FBQUUsTUFBTTtVQUFFLE1BQU07UUFBVTtRQUFHLE1BQU07TUFBb0I7SUFDaEUsS0FBSztNQUNILE9BQU87UUFBRSxNQUFNO1VBQUUsTUFBTTtRQUFVO1FBQUcsTUFBTTtRQUFTLFlBQVk7TUFBUTtJQUN6RSxLQUFLO01BQ0gsT0FBTztRQUFFLE1BQU07VUFBRSxNQUFNO1FBQVU7UUFBRyxNQUFNO1FBQVMsWUFBWTtNQUFRO0lBQ3pFLGdCQUFnQjtJQUNoQiw0RUFBNEU7SUFDNUU7TUFDRSxNQUFNLElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLG1CQUFtQixDQUFDO0VBQzlEO0FBQ0YifQ==