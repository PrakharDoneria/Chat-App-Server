import * as bcrypt from "./bcrypt/bcrypt.ts";
/**
 * Generate a hash for the plaintext password
 * Requires the --allow-net flag
 *
 * @export
 * @param {string} plaintext The password to hash
 * @param {(string | undefined)} [salt=undefined] The salt to use when hashing. Recommended to leave this undefined.
 * @returns {Promise<string>} The hashed password
 */ export async function hash(plaintext, salt = undefined) {
  let worker = new Worker(new URL("worker.ts", import.meta.url).toString(), {
    type: "module"
  });
  worker.postMessage({
    action: "hash",
    payload: {
      plaintext,
      salt
    }
  });
  return new Promise((resolve)=>{
    worker.onmessage = (event)=>{
      resolve(event.data);
      worker.terminate();
    };
  });
}
/**
 * Generates a salt using a number of log rounds
 * Requires the --allow-net flag
 *
 * @export
 * @param {(number | undefined)} [log_rounds=undefined] Number of log rounds to use. Recommended to leave this undefined.
 * @returns {Promise<string>} The generated salt
 */ export async function genSalt(log_rounds = undefined) {
  let worker = new Worker(new URL("worker.ts", import.meta.url).toString(), {
    type: "module"
  });
  worker.postMessage({
    action: "genSalt",
    payload: {
      log_rounds
    }
  });
  return new Promise((resolve)=>{
    worker.onmessage = (event)=>{
      resolve(event.data);
      worker.terminate();
    };
  });
}
/**
 * Check if a plaintext password matches a hash
 * Requires the --allow-net flag
 *
 * @export
 * @param {string} plaintext The plaintext password to check
 * @param {string} hash The hash to compare to
 * @returns {Promise<boolean>} Whether the password matches the hash
 */ export async function compare(plaintext, hash) {
  let worker = new Worker(new URL("worker.ts", import.meta.url).toString(), {
    type: "module"
  });
  worker.postMessage({
    action: "compare",
    payload: {
      plaintext,
      hash
    }
  });
  return new Promise((resolve)=>{
    worker.onmessage = (event)=>{
      resolve(event.data);
      worker.terminate();
    };
  });
}
/**
 * Check if a plaintext password matches a hash
 * This function is blocking and computationally expensive but requires no additonal flags.
 * Using the async variant is highly recommended.
 *
 * @export
 * @param {string} plaintext The plaintext password to check
 * @param {string} hash The hash to compare to
 * @returns {boolean} Whether the password matches the hash
 */ export function compareSync(plaintext, hash) {
  try {
    return bcrypt.checkpw(plaintext, hash);
  } catch  {
    return false;
  }
}
/**
 * Generates a salt using a number of log rounds
 * This function is blocking and computationally expensive but requires no additonal flags.
 * Using the async variant is highly recommended.
 *
 * @export
 * @param {(number | undefined)} [log_rounds=undefined] Number of log rounds to use. Recommended to leave this undefined.
 * @returns {string} The generated salt
 */ export function genSaltSync(log_rounds = undefined) {
  return bcrypt.gensalt(log_rounds);
}
/**
 * Generate a hash for the plaintext password
 * This function is blocking and computationally expensive but requires no additonal flags.
 * Using the async variant is highly recommended.
 *
 * @export
 * @param {string} plaintext The password to hash
 * @param {(string | undefined)} [salt=undefined] The salt to use when hashing. Recommended to leave this undefined.
 * @returns {string} The hashed password
 */ export function hashSync(plaintext, salt = undefined) {
  return bcrypt.hashpw(plaintext, salt);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvYmNyeXB0QHYwLjQuMS9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSBcIi4vYmNyeXB0L2JjcnlwdC50c1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgaGFzaCBmb3IgdGhlIHBsYWludGV4dCBwYXNzd29yZFxuICogUmVxdWlyZXMgdGhlIC0tYWxsb3ctbmV0IGZsYWdcbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IFRoZSBwYXNzd29yZCB0byBoYXNoXG4gKiBAcGFyYW0geyhzdHJpbmcgfCB1bmRlZmluZWQpfSBbc2FsdD11bmRlZmluZWRdIFRoZSBzYWx0IHRvIHVzZSB3aGVuIGhhc2hpbmcuIFJlY29tbWVuZGVkIHRvIGxlYXZlIHRoaXMgdW5kZWZpbmVkLlxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIGhhc2hlZCBwYXNzd29yZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaChcbiAgcGxhaW50ZXh0OiBzdHJpbmcsXG4gIHNhbHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCB3b3JrZXIgPSBuZXcgV29ya2VyKFxuICAgIG5ldyBVUkwoXCJ3b3JrZXIudHNcIiwgaW1wb3J0Lm1ldGEudXJsKS50b1N0cmluZygpLFxuICAgIHsgdHlwZTogXCJtb2R1bGVcIiB9LFxuICApO1xuXG4gIHdvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgYWN0aW9uOiBcImhhc2hcIixcbiAgICBwYXlsb2FkOiB7XG4gICAgICBwbGFpbnRleHQsXG4gICAgICBzYWx0LFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHJlc29sdmUoZXZlbnQuZGF0YSk7XG4gICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2FsdCB1c2luZyBhIG51bWJlciBvZiBsb2cgcm91bmRzXG4gKiBSZXF1aXJlcyB0aGUgLS1hbGxvdy1uZXQgZmxhZ1xuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7KG51bWJlciB8IHVuZGVmaW5lZCl9IFtsb2dfcm91bmRzPXVuZGVmaW5lZF0gTnVtYmVyIG9mIGxvZyByb3VuZHMgdG8gdXNlLiBSZWNvbW1lbmRlZCB0byBsZWF2ZSB0aGlzIHVuZGVmaW5lZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBnZW5lcmF0ZWQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuU2FsdChcbiAgbG9nX3JvdW5kczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgbGV0IHdvcmtlciA9IG5ldyBXb3JrZXIoXG4gICAgbmV3IFVSTChcIndvcmtlci50c1wiLCBpbXBvcnQubWV0YS51cmwpLnRvU3RyaW5nKCksXG4gICAgeyB0eXBlOiBcIm1vZHVsZVwiIH0sXG4gICk7XG5cbiAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICBhY3Rpb246IFwiZ2VuU2FsdFwiLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGxvZ19yb3VuZHMsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgcmVzb2x2ZShldmVudC5kYXRhKTtcbiAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBsYWludGV4dCBwYXNzd29yZCBtYXRjaGVzIGEgaGFzaFxuICogUmVxdWlyZXMgdGhlIC0tYWxsb3ctbmV0IGZsYWdcbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IFRoZSBwbGFpbnRleHQgcGFzc3dvcmQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoIFRoZSBoYXNoIHRvIGNvbXBhcmUgdG9cbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBXaGV0aGVyIHRoZSBwYXNzd29yZCBtYXRjaGVzIHRoZSBoYXNoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wYXJlKFxuICBwbGFpbnRleHQ6IHN0cmluZyxcbiAgaGFzaDogc3RyaW5nLFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGxldCB3b3JrZXIgPSBuZXcgV29ya2VyKFxuICAgIG5ldyBVUkwoXCJ3b3JrZXIudHNcIiwgaW1wb3J0Lm1ldGEudXJsKS50b1N0cmluZygpLFxuICAgIHsgdHlwZTogXCJtb2R1bGVcIiB9LFxuICApO1xuXG4gIHdvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgYWN0aW9uOiBcImNvbXBhcmVcIixcbiAgICBwYXlsb2FkOiB7XG4gICAgICBwbGFpbnRleHQsXG4gICAgICBoYXNoLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHJlc29sdmUoZXZlbnQuZGF0YSk7XG4gICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwbGFpbnRleHQgcGFzc3dvcmQgbWF0Y2hlcyBhIGhhc2hcbiAqIFRoaXMgZnVuY3Rpb24gaXMgYmxvY2tpbmcgYW5kIGNvbXB1dGF0aW9uYWxseSBleHBlbnNpdmUgYnV0IHJlcXVpcmVzIG5vIGFkZGl0b25hbCBmbGFncy5cbiAqIFVzaW5nIHRoZSBhc3luYyB2YXJpYW50IGlzIGhpZ2hseSByZWNvbW1lbmRlZC5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IFRoZSBwbGFpbnRleHQgcGFzc3dvcmQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoIFRoZSBoYXNoIHRvIGNvbXBhcmUgdG9cbiAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBwYXNzd29yZCBtYXRjaGVzIHRoZSBoYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlU3luYyhwbGFpbnRleHQ6IHN0cmluZywgaGFzaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGJjcnlwdC5jaGVja3B3KHBsYWludGV4dCwgaGFzaCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNhbHQgdXNpbmcgYSBudW1iZXIgb2YgbG9nIHJvdW5kc1xuICogVGhpcyBmdW5jdGlvbiBpcyBibG9ja2luZyBhbmQgY29tcHV0YXRpb25hbGx5IGV4cGVuc2l2ZSBidXQgcmVxdWlyZXMgbm8gYWRkaXRvbmFsIGZsYWdzLlxuICogVXNpbmcgdGhlIGFzeW5jIHZhcmlhbnQgaXMgaGlnaGx5IHJlY29tbWVuZGVkLlxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7KG51bWJlciB8IHVuZGVmaW5lZCl9IFtsb2dfcm91bmRzPXVuZGVmaW5lZF0gTnVtYmVyIG9mIGxvZyByb3VuZHMgdG8gdXNlLiBSZWNvbW1lbmRlZCB0byBsZWF2ZSB0aGlzIHVuZGVmaW5lZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBnZW5lcmF0ZWQgc2FsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuU2FsdFN5bmMoXG4gIGxvZ19yb3VuZHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbik6IHN0cmluZyB7XG4gIHJldHVybiBiY3J5cHQuZ2Vuc2FsdChsb2dfcm91bmRzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIGhhc2ggZm9yIHRoZSBwbGFpbnRleHQgcGFzc3dvcmRcbiAqIFRoaXMgZnVuY3Rpb24gaXMgYmxvY2tpbmcgYW5kIGNvbXB1dGF0aW9uYWxseSBleHBlbnNpdmUgYnV0IHJlcXVpcmVzIG5vIGFkZGl0b25hbCBmbGFncy5cbiAqIFVzaW5nIHRoZSBhc3luYyB2YXJpYW50IGlzIGhpZ2hseSByZWNvbW1lbmRlZC5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IFRoZSBwYXNzd29yZCB0byBoYXNoXG4gKiBAcGFyYW0geyhzdHJpbmcgfCB1bmRlZmluZWQpfSBbc2FsdD11bmRlZmluZWRdIFRoZSBzYWx0IHRvIHVzZSB3aGVuIGhhc2hpbmcuIFJlY29tbWVuZGVkIHRvIGxlYXZlIHRoaXMgdW5kZWZpbmVkLlxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGhhc2hlZCBwYXNzd29yZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzaFN5bmMoXG4gIHBsYWludGV4dDogc3RyaW5nLFxuICBzYWx0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4pOiBzdHJpbmcge1xuICByZXR1cm4gYmNyeXB0Lmhhc2hwdyhwbGFpbnRleHQsIHNhbHQpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksWUFBWSxxQkFBcUI7QUFFN0M7Ozs7Ozs7O0NBUUMsR0FDRCxPQUFPLGVBQWUsS0FDcEIsU0FBaUIsRUFDakIsT0FBMkIsU0FBUztFQUVwQyxJQUFJLFNBQVMsSUFBSSxPQUNmLElBQUksSUFBSSxhQUFhLFlBQVksR0FBRyxFQUFFLFFBQVEsSUFDOUM7SUFBRSxNQUFNO0VBQVM7RUFHbkIsT0FBTyxXQUFXLENBQUM7SUFDakIsUUFBUTtJQUNSLFNBQVM7TUFDUDtNQUNBO0lBQ0Y7RUFDRjtFQUVBLE9BQU8sSUFBSSxRQUFRLENBQUM7SUFDbEIsT0FBTyxTQUFTLEdBQUcsQ0FBQztNQUNsQixRQUFRLE1BQU0sSUFBSTtNQUNsQixPQUFPLFNBQVM7SUFDbEI7RUFDRjtBQUNGO0FBRUE7Ozs7Ozs7Q0FPQyxHQUNELE9BQU8sZUFBZSxRQUNwQixhQUFpQyxTQUFTO0VBRTFDLElBQUksU0FBUyxJQUFJLE9BQ2YsSUFBSSxJQUFJLGFBQWEsWUFBWSxHQUFHLEVBQUUsUUFBUSxJQUM5QztJQUFFLE1BQU07RUFBUztFQUduQixPQUFPLFdBQVcsQ0FBQztJQUNqQixRQUFRO0lBQ1IsU0FBUztNQUNQO0lBQ0Y7RUFDRjtFQUVBLE9BQU8sSUFBSSxRQUFRLENBQUM7SUFDbEIsT0FBTyxTQUFTLEdBQUcsQ0FBQztNQUNsQixRQUFRLE1BQU0sSUFBSTtNQUNsQixPQUFPLFNBQVM7SUFDbEI7RUFDRjtBQUNGO0FBRUE7Ozs7Ozs7O0NBUUMsR0FDRCxPQUFPLGVBQWUsUUFDcEIsU0FBaUIsRUFDakIsSUFBWTtFQUVaLElBQUksU0FBUyxJQUFJLE9BQ2YsSUFBSSxJQUFJLGFBQWEsWUFBWSxHQUFHLEVBQUUsUUFBUSxJQUM5QztJQUFFLE1BQU07RUFBUztFQUduQixPQUFPLFdBQVcsQ0FBQztJQUNqQixRQUFRO0lBQ1IsU0FBUztNQUNQO01BQ0E7SUFDRjtFQUNGO0VBRUEsT0FBTyxJQUFJLFFBQVEsQ0FBQztJQUNsQixPQUFPLFNBQVMsR0FBRyxDQUFDO01BQ2xCLFFBQVEsTUFBTSxJQUFJO01BQ2xCLE9BQU8sU0FBUztJQUNsQjtFQUNGO0FBQ0Y7QUFFQTs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLFNBQVMsWUFBWSxTQUFpQixFQUFFLElBQVk7RUFDekQsSUFBSTtJQUNGLE9BQU8sT0FBTyxPQUFPLENBQUMsV0FBVztFQUNuQyxFQUFFLE9BQU07SUFDTixPQUFPO0VBQ1Q7QUFDRjtBQUVBOzs7Ozs7OztDQVFDLEdBQ0QsT0FBTyxTQUFTLFlBQ2QsYUFBaUMsU0FBUztFQUUxQyxPQUFPLE9BQU8sT0FBTyxDQUFDO0FBQ3hCO0FBRUE7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxTQUFTLFNBQ2QsU0FBaUIsRUFDakIsT0FBMkIsU0FBUztFQUVwQyxPQUFPLE9BQU8sTUFBTSxDQUFDLFdBQVc7QUFDbEMifQ==