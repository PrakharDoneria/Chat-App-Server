// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// deno-fmt-ignore
const base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
/**
 * CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
 * Encodes a given Uint8Array, ArrayBuffer or string into RFC4648 base64 representation
 * @param data
 */ export function encode(data) {
  const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  let result = "", i;
  const l = uint8.length;
  for(i = 2; i < l; i += 3){
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
    result += base64abc[uint8[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}
/**
 * Decodes a given RFC4648 base64 encoded string
 * @param b64
 */ export function decode(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for(let i = 0; i < size; i++){
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEwNS4wL2VuY29kaW5nL2Jhc2U2NC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vLyBkZW5vLWZtdC1pZ25vcmVcbmNvbnN0IGJhc2U2NGFiYyA9IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIiwgXCJLXCIsIFwiTFwiLCBcbiAgXCJNXCIsIFwiTlwiLCBcIk9cIiwgXCJQXCIsIFwiUVwiLCBcIlJcIiwgXCJTXCIsIFwiVFwiLCBcIlVcIiwgXCJWXCIsIFwiV1wiLCBcIlhcIiwgXCJZXCIsIFwiWlwiLCBcImFcIiwgXG4gIFwiYlwiLCBcImNcIiwgXCJkXCIsIFwiZVwiLCBcImZcIiwgXCJnXCIsIFwiaFwiLCBcImlcIiwgXCJqXCIsIFwia1wiLCBcImxcIiwgXCJtXCIsIFwiblwiLCBcIm9cIiwgXCJwXCIsIFxuICBcInFcIiwgXCJyXCIsIFwic1wiLCBcInRcIiwgXCJ1XCIsIFwidlwiLCBcIndcIiwgXCJ4XCIsIFwieVwiLCBcInpcIiwgXCIwXCIsIFwiMVwiLCBcIjJcIiwgXCIzXCIsIFwiNFwiLCBcbiAgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiLCBcIitcIiwgXCIvXCJdO1xuXG4vKipcbiAqIENSRURJVDogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZW5lcG9tbnlhc2NoaWgvNzJjNDIzZjcyN2QzOTVlZWFhMDk2OTcwNTgyMzg3MjdcbiAqIEVuY29kZXMgYSBnaXZlbiBVaW50OEFycmF5LCBBcnJheUJ1ZmZlciBvciBzdHJpbmcgaW50byBSRkM0NjQ4IGJhc2U2NCByZXByZXNlbnRhdGlvblxuICogQHBhcmFtIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShkYXRhOiBBcnJheUJ1ZmZlciB8IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHVpbnQ4ID0gdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCJcbiAgICA/IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShkYXRhKVxuICAgIDogZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXlcbiAgICA/IGRhdGFcbiAgICA6IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICBsZXQgcmVzdWx0ID0gXCJcIixcbiAgICBpO1xuICBjb25zdCBsID0gdWludDgubGVuZ3RoO1xuICBmb3IgKGkgPSAyOyBpIDwgbDsgaSArPSAzKSB7XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1t1aW50OFtpIC0gMl0gPj4gMl07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1soKHVpbnQ4W2kgLSAyXSAmIDB4MDMpIDw8IDQpIHwgKHVpbnQ4W2kgLSAxXSA+PiA0KV07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1soKHVpbnQ4W2kgLSAxXSAmIDB4MGYpIDw8IDIpIHwgKHVpbnQ4W2ldID4+IDYpXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW3VpbnQ4W2ldICYgMHgzZl07XG4gIH1cbiAgaWYgKGkgPT09IGwgKyAxKSB7XG4gICAgLy8gMSBvY3RldCB5ZXQgdG8gd3JpdGVcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW3VpbnQ4W2kgLSAyXSA+PiAyXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWyh1aW50OFtpIC0gMl0gJiAweDAzKSA8PCA0XTtcbiAgICByZXN1bHQgKz0gXCI9PVwiO1xuICB9XG4gIGlmIChpID09PSBsKSB7XG4gICAgLy8gMiBvY3RldHMgeWV0IHRvIHdyaXRlXG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1t1aW50OFtpIC0gMl0gPj4gMl07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1soKHVpbnQ4W2kgLSAyXSAmIDB4MDMpIDw8IDQpIHwgKHVpbnQ4W2kgLSAxXSA+PiA0KV07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1sodWludDhbaSAtIDFdICYgMHgwZikgPDwgMl07XG4gICAgcmVzdWx0ICs9IFwiPVwiO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGVjb2RlcyBhIGdpdmVuIFJGQzQ2NDggYmFzZTY0IGVuY29kZWQgc3RyaW5nXG4gKiBAcGFyYW0gYjY0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoYjY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgYmluU3RyaW5nID0gYXRvYihiNjQpO1xuICBjb25zdCBzaXplID0gYmluU3RyaW5nLmxlbmd0aDtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IGJpblN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBieXRlcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsa0JBQWtCO0FBQ2xCLE1BQU0sWUFBWTtFQUFDO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUN4RTtFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFDdEU7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQ3RFO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztFQUN0RTtFQUFLO0VBQUs7RUFBSztFQUFLO0VBQUs7RUFBSztDQUFJO0FBRXBDOzs7O0NBSUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxJQUEwQjtFQUMvQyxNQUFNLFFBQVEsT0FBTyxTQUFTLFdBQzFCLElBQUksY0FBYyxNQUFNLENBQUMsUUFDekIsZ0JBQWdCLGFBQ2hCLE9BQ0EsSUFBSSxXQUFXO0VBQ25CLElBQUksU0FBUyxJQUNYO0VBQ0YsTUFBTSxJQUFJLE1BQU0sTUFBTTtFQUN0QixJQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxFQUFHO0lBQ3pCLFVBQVUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0lBQ3RDLFVBQVUsU0FBUyxDQUFDLEFBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQU0sS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUc7SUFDdkUsVUFBVSxTQUFTLENBQUMsQUFBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBTSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUc7SUFDbkUsVUFBVSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxLQUFLO0VBQ3RDO0VBQ0EsSUFBSSxNQUFNLElBQUksR0FBRztJQUNmLHVCQUF1QjtJQUN2QixVQUFVLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtJQUN0QyxVQUFVLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLEtBQUssRUFBRTtJQUMvQyxVQUFVO0VBQ1o7RUFDQSxJQUFJLE1BQU0sR0FBRztJQUNYLHdCQUF3QjtJQUN4QixVQUFVLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtJQUN0QyxVQUFVLFNBQVMsQ0FBQyxBQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksS0FBSyxJQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFHO0lBQ3ZFLFVBQVUsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksS0FBSyxFQUFFO0lBQy9DLFVBQVU7RUFDWjtFQUNBLE9BQU87QUFDVDtBQUVBOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsTUFBTSxZQUFZLEtBQUs7RUFDdkIsTUFBTSxPQUFPLFVBQVUsTUFBTTtFQUM3QixNQUFNLFFBQVEsSUFBSSxXQUFXO0VBQzdCLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLElBQUs7SUFDN0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxVQUFVLFVBQVUsQ0FBQztFQUNsQztFQUNBLE9BQU87QUFDVCJ9