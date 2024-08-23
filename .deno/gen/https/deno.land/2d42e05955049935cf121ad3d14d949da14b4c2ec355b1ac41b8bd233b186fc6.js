import { assert } from "../_util/assert.ts";
// MIN_READ is the minimum ArrayBuffer size passed to a read call by
// buffer.ReadFrom. As long as the Buffer has at least MIN_READ bytes beyond
// what is required to hold the contents of r, readFrom() will not grow the
// underlying buffer.
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
// `off` is the offset into `dst` where it will at which to begin writing values
// from `src`.
// Returns the number of bytes copied.
function copyBytes(src, dst, off = 0) {
  const r = dst.byteLength - off;
  if (src.byteLength > r) {
    src = src.subarray(0, r);
  }
  dst.set(src, off);
  return src.byteLength;
}
/** A variable-sized buffer of bytes with `read()` and `write()` methods.
 *
 * Buffer is almost always used with some I/O like files and sockets. It allows
 * one to buffer up a download from a socket. Buffer grows and shrinks as
 * necessary.
 *
 * Buffer is NOT the same thing as Node's Buffer. Node's Buffer was created in
 * 2009 before JavaScript had the concept of ArrayBuffers. It's simply a
 * non-standard ArrayBuffer.
 *
 * ArrayBuffer is a fixed memory allocation. Buffer is implemented on top of
 * ArrayBuffer.
 *
 * Based on [Go Buffer](https://golang.org/pkg/bytes/#Buffer). */ export class Buffer {
  #buf;
  #off = 0;
  constructor(ab){
    if (ab === undefined) {
      this.#buf = new Uint8Array(0);
      return;
    }
    this.#buf = new Uint8Array(ab);
  }
  /** Returns a slice holding the unread portion of the buffer.
   *
   * The slice is valid for use only until the next buffer modification (that
   * is, only until the next call to a method like `read()`, `write()`,
   * `reset()`, or `truncate()`). If `options.copy` is false the slice aliases the buffer content at
   * least until the next buffer modification, so immediate changes to the
   * slice will affect the result of future reads.
   * @param options Defaults to `{ copy: true }`
   */ bytes(options = {
    copy: true
  }) {
    if (options.copy === false) return this.#buf.subarray(this.#off);
    return this.#buf.slice(this.#off);
  }
  /** Returns whether the unread portion of the buffer is empty. */ empty() {
    return this.#buf.byteLength <= this.#off;
  }
  /** A read only number of bytes of the unread portion of the buffer. */ get length() {
    return this.#buf.byteLength - this.#off;
  }
  /** The read only capacity of the buffer's underlying byte slice, that is,
   * the total space allocated for the buffer's data. */ get capacity() {
    return this.#buf.buffer.byteLength;
  }
  /** Discards all but the first `n` unread bytes from the buffer but
   * continues to use the same allocated storage. It throws if `n` is
   * negative or greater than the length of the buffer. */ truncate(n) {
    if (n === 0) {
      this.reset();
      return;
    }
    if (n < 0 || n > this.length) {
      throw Error("bytes.Buffer: truncation out of range");
    }
    this.#reslice(this.#off + n);
  }
  reset() {
    this.#reslice(0);
    this.#off = 0;
  }
  #tryGrowByReslice = (n)=>{
    const l = this.#buf.byteLength;
    if (n <= this.capacity - l) {
      this.#reslice(l + n);
      return l;
    }
    return -1;
  };
  #reslice = (len)=>{
    assert(len <= this.#buf.buffer.byteLength);
    this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
  };
  /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Returns the number of bytes read. If the buffer has no data to
   * return, the return is EOF (`null`). */ readSync(p) {
    if (this.empty()) {
      // Buffer is empty, reset to recover space.
      this.reset();
      if (p.byteLength === 0) {
        // this edge case is tested in 'bufferReadEmptyAtEOF' test
        return 0;
      }
      return null;
    }
    const nread = copyBytes(this.#buf.subarray(this.#off), p);
    this.#off += nread;
    return nread;
  }
  /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Resolves to the number of bytes read. If the buffer has no
   * data to return, resolves to EOF (`null`).
   *
   * NOTE: This methods reads bytes synchronously; it's provided for
   * compatibility with `Reader` interfaces.
   */ read(p) {
    const rr = this.readSync(p);
    return Promise.resolve(rr);
  }
  writeSync(p) {
    const m = this.#grow(p.byteLength);
    return copyBytes(p, this.#buf, m);
  }
  /** NOTE: This methods writes bytes synchronously; it's provided for
   * compatibility with `Writer` interface. */ write(p) {
    const n = this.writeSync(p);
    return Promise.resolve(n);
  }
  #grow = (n)=>{
    const m = this.length;
    // If buffer is empty, reset to recover space.
    if (m === 0 && this.#off !== 0) {
      this.reset();
    }
    // Fast: Try to grow by means of a reslice.
    const i = this.#tryGrowByReslice(n);
    if (i >= 0) {
      return i;
    }
    const c = this.capacity;
    if (n <= Math.floor(c / 2) - m) {
      // We can slide things down instead of allocating a new
      // ArrayBuffer. We only need m+n <= c to slide, but
      // we instead let capacity get twice as large so we
      // don't spend all our time copying.
      copyBytes(this.#buf.subarray(this.#off), this.#buf);
    } else if (c + n > MAX_SIZE) {
      throw new Error("The buffer cannot be grown beyond the maximum size.");
    } else {
      // Not enough space anywhere, we need to allocate.
      const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
      copyBytes(this.#buf.subarray(this.#off), buf);
      this.#buf = buf;
    }
    // Restore this.#off and len(this.#buf).
    this.#off = 0;
    this.#reslice(Math.min(m + n, MAX_SIZE));
    return m;
  };
  /** Grows the buffer's capacity, if necessary, to guarantee space for
   * another `n` bytes. After `.grow(n)`, at least `n` bytes can be written to
   * the buffer without another allocation. If `n` is negative, `.grow()` will
   * throw. If the buffer can't grow it will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow). */ grow(n) {
    if (n < 0) {
      throw Error("Buffer.grow: negative count");
    }
    const m = this.#grow(n);
    this.#reslice(m);
  }
  /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It resolves to the number of bytes read.
   * If the buffer becomes too large, `.readFrom()` will reject with an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */ async readFrom(r) {
    let n = 0;
    const tmp = new Uint8Array(MIN_READ);
    while(true){
      const shouldGrow = this.capacity - this.length < MIN_READ;
      // read into tmp buffer if there's not enough room
      // otherwise read directly into the internal buffer
      const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
      const nread = await r.read(buf);
      if (nread === null) {
        return n;
      }
      // write will grow if needed
      if (shouldGrow) this.writeSync(buf.subarray(0, nread));
      else this.#reslice(this.length + nread);
      n += nread;
    }
  }
  /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It returns the number of bytes read. If the
   * buffer becomes too large, `.readFromSync()` will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */ readFromSync(r) {
    let n = 0;
    const tmp = new Uint8Array(MIN_READ);
    while(true){
      const shouldGrow = this.capacity - this.length < MIN_READ;
      // read into tmp buffer if there's not enough room
      // otherwise read directly into the internal buffer
      const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
      const nread = r.readSync(buf);
      if (nread === null) {
        return n;
      }
      // write will grow if needed
      if (shouldGrow) this.writeSync(buf.subarray(0, nread));
      else this.#reslice(this.length + nread);
      n += nread;
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvaW8vYnVmZmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuLi9fdXRpbC9hc3NlcnQudHNcIjtcblxuLy8gTUlOX1JFQUQgaXMgdGhlIG1pbmltdW0gQXJyYXlCdWZmZXIgc2l6ZSBwYXNzZWQgdG8gYSByZWFkIGNhbGwgYnlcbi8vIGJ1ZmZlci5SZWFkRnJvbS4gQXMgbG9uZyBhcyB0aGUgQnVmZmVyIGhhcyBhdCBsZWFzdCBNSU5fUkVBRCBieXRlcyBiZXlvbmRcbi8vIHdoYXQgaXMgcmVxdWlyZWQgdG8gaG9sZCB0aGUgY29udGVudHMgb2YgciwgcmVhZEZyb20oKSB3aWxsIG5vdCBncm93IHRoZVxuLy8gdW5kZXJseWluZyBidWZmZXIuXG5jb25zdCBNSU5fUkVBRCA9IDMyICogMTAyNDtcbmNvbnN0IE1BWF9TSVpFID0gMiAqKiAzMiAtIDI7XG5cbi8vIGBvZmZgIGlzIHRoZSBvZmZzZXQgaW50byBgZHN0YCB3aGVyZSBpdCB3aWxsIGF0IHdoaWNoIHRvIGJlZ2luIHdyaXRpbmcgdmFsdWVzXG4vLyBmcm9tIGBzcmNgLlxuLy8gUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ5dGVzIGNvcGllZC5cbmZ1bmN0aW9uIGNvcHlCeXRlcyhzcmM6IFVpbnQ4QXJyYXksIGRzdDogVWludDhBcnJheSwgb2ZmID0gMCkge1xuICBjb25zdCByID0gZHN0LmJ5dGVMZW5ndGggLSBvZmY7XG4gIGlmIChzcmMuYnl0ZUxlbmd0aCA+IHIpIHtcbiAgICBzcmMgPSBzcmMuc3ViYXJyYXkoMCwgcik7XG4gIH1cbiAgZHN0LnNldChzcmMsIG9mZik7XG4gIHJldHVybiBzcmMuYnl0ZUxlbmd0aDtcbn1cblxuLyoqIEEgdmFyaWFibGUtc2l6ZWQgYnVmZmVyIG9mIGJ5dGVzIHdpdGggYHJlYWQoKWAgYW5kIGB3cml0ZSgpYCBtZXRob2RzLlxuICpcbiAqIEJ1ZmZlciBpcyBhbG1vc3QgYWx3YXlzIHVzZWQgd2l0aCBzb21lIEkvTyBsaWtlIGZpbGVzIGFuZCBzb2NrZXRzLiBJdCBhbGxvd3NcbiAqIG9uZSB0byBidWZmZXIgdXAgYSBkb3dubG9hZCBmcm9tIGEgc29ja2V0LiBCdWZmZXIgZ3Jvd3MgYW5kIHNocmlua3MgYXNcbiAqIG5lY2Vzc2FyeS5cbiAqXG4gKiBCdWZmZXIgaXMgTk9UIHRoZSBzYW1lIHRoaW5nIGFzIE5vZGUncyBCdWZmZXIuIE5vZGUncyBCdWZmZXIgd2FzIGNyZWF0ZWQgaW5cbiAqIDIwMDkgYmVmb3JlIEphdmFTY3JpcHQgaGFkIHRoZSBjb25jZXB0IG9mIEFycmF5QnVmZmVycy4gSXQncyBzaW1wbHkgYVxuICogbm9uLXN0YW5kYXJkIEFycmF5QnVmZmVyLlxuICpcbiAqIEFycmF5QnVmZmVyIGlzIGEgZml4ZWQgbWVtb3J5IGFsbG9jYXRpb24uIEJ1ZmZlciBpcyBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAqIEFycmF5QnVmZmVyLlxuICpcbiAqIEJhc2VkIG9uIFtHbyBCdWZmZXJdKGh0dHBzOi8vZ29sYW5nLm9yZy9wa2cvYnl0ZXMvI0J1ZmZlcikuICovXG5cbmV4cG9ydCBjbGFzcyBCdWZmZXIge1xuICAjYnVmOiBVaW50OEFycmF5OyAvLyBjb250ZW50cyBhcmUgdGhlIGJ5dGVzIGJ1ZltvZmYgOiBsZW4oYnVmKV1cbiAgI29mZiA9IDA7IC8vIHJlYWQgYXQgYnVmW29mZl0sIHdyaXRlIGF0IGJ1ZltidWYuYnl0ZUxlbmd0aF1cblxuICBjb25zdHJ1Y3RvcihhYj86IEFycmF5QnVmZmVyKSB7XG4gICAgaWYgKGFiID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuI2J1ZiA9IG5ldyBVaW50OEFycmF5KDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiNidWYgPSBuZXcgVWludDhBcnJheShhYik7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIHNsaWNlIGhvbGRpbmcgdGhlIHVucmVhZCBwb3J0aW9uIG9mIHRoZSBidWZmZXIuXG4gICAqXG4gICAqIFRoZSBzbGljZSBpcyB2YWxpZCBmb3IgdXNlIG9ubHkgdW50aWwgdGhlIG5leHQgYnVmZmVyIG1vZGlmaWNhdGlvbiAodGhhdFxuICAgKiBpcywgb25seSB1bnRpbCB0aGUgbmV4dCBjYWxsIHRvIGEgbWV0aG9kIGxpa2UgYHJlYWQoKWAsIGB3cml0ZSgpYCxcbiAgICogYHJlc2V0KClgLCBvciBgdHJ1bmNhdGUoKWApLiBJZiBgb3B0aW9ucy5jb3B5YCBpcyBmYWxzZSB0aGUgc2xpY2UgYWxpYXNlcyB0aGUgYnVmZmVyIGNvbnRlbnQgYXRcbiAgICogbGVhc3QgdW50aWwgdGhlIG5leHQgYnVmZmVyIG1vZGlmaWNhdGlvbiwgc28gaW1tZWRpYXRlIGNoYW5nZXMgdG8gdGhlXG4gICAqIHNsaWNlIHdpbGwgYWZmZWN0IHRoZSByZXN1bHQgb2YgZnV0dXJlIHJlYWRzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBEZWZhdWx0cyB0byBgeyBjb3B5OiB0cnVlIH1gXG4gICAqL1xuICBieXRlcyhvcHRpb25zID0geyBjb3B5OiB0cnVlIH0pOiBVaW50OEFycmF5IHtcbiAgICBpZiAob3B0aW9ucy5jb3B5ID09PSBmYWxzZSkgcmV0dXJuIHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpO1xuICAgIHJldHVybiB0aGlzLiNidWYuc2xpY2UodGhpcy4jb2ZmKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHVucmVhZCBwb3J0aW9uIG9mIHRoZSBidWZmZXIgaXMgZW1wdHkuICovXG4gIGVtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNidWYuYnl0ZUxlbmd0aCA8PSB0aGlzLiNvZmY7XG4gIH1cblxuICAvKiogQSByZWFkIG9ubHkgbnVtYmVyIG9mIGJ5dGVzIG9mIHRoZSB1bnJlYWQgcG9ydGlvbiBvZiB0aGUgYnVmZmVyLiAqL1xuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI2J1Zi5ieXRlTGVuZ3RoIC0gdGhpcy4jb2ZmO1xuICB9XG5cbiAgLyoqIFRoZSByZWFkIG9ubHkgY2FwYWNpdHkgb2YgdGhlIGJ1ZmZlcidzIHVuZGVybHlpbmcgYnl0ZSBzbGljZSwgdGhhdCBpcyxcbiAgICogdGhlIHRvdGFsIHNwYWNlIGFsbG9jYXRlZCBmb3IgdGhlIGJ1ZmZlcidzIGRhdGEuICovXG4gIGdldCBjYXBhY2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLiNidWYuYnVmZmVyLmJ5dGVMZW5ndGg7XG4gIH1cblxuICAvKiogRGlzY2FyZHMgYWxsIGJ1dCB0aGUgZmlyc3QgYG5gIHVucmVhZCBieXRlcyBmcm9tIHRoZSBidWZmZXIgYnV0XG4gICAqIGNvbnRpbnVlcyB0byB1c2UgdGhlIHNhbWUgYWxsb2NhdGVkIHN0b3JhZ2UuIEl0IHRocm93cyBpZiBgbmAgaXNcbiAgICogbmVnYXRpdmUgb3IgZ3JlYXRlciB0aGFuIHRoZSBsZW5ndGggb2YgdGhlIGJ1ZmZlci4gKi9cbiAgdHJ1bmNhdGUobjogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG4gPCAwIHx8IG4gPiB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJieXRlcy5CdWZmZXI6IHRydW5jYXRpb24gb3V0IG9mIHJhbmdlXCIpO1xuICAgIH1cbiAgICB0aGlzLiNyZXNsaWNlKHRoaXMuI29mZiArIG4pO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy4jcmVzbGljZSgwKTtcbiAgICB0aGlzLiNvZmYgPSAwO1xuICB9XG5cbiAgI3RyeUdyb3dCeVJlc2xpY2UgPSAobjogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgbCA9IHRoaXMuI2J1Zi5ieXRlTGVuZ3RoO1xuICAgIGlmIChuIDw9IHRoaXMuY2FwYWNpdHkgLSBsKSB7XG4gICAgICB0aGlzLiNyZXNsaWNlKGwgKyBuKTtcbiAgICAgIHJldHVybiBsO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgI3Jlc2xpY2UgPSAobGVuOiBudW1iZXIpID0+IHtcbiAgICBhc3NlcnQobGVuIDw9IHRoaXMuI2J1Zi5idWZmZXIuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy4jYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYnVmLmJ1ZmZlciwgMCwgbGVuKTtcbiAgfTtcblxuICAvKiogUmVhZHMgdGhlIG5leHQgYHAubGVuZ3RoYCBieXRlcyBmcm9tIHRoZSBidWZmZXIgb3IgdW50aWwgdGhlIGJ1ZmZlciBpc1xuICAgKiBkcmFpbmVkLiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYnl0ZXMgcmVhZC4gSWYgdGhlIGJ1ZmZlciBoYXMgbm8gZGF0YSB0b1xuICAgKiByZXR1cm4sIHRoZSByZXR1cm4gaXMgRU9GIChgbnVsbGApLiAqL1xuICByZWFkU3luYyhwOiBVaW50OEFycmF5KTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuZW1wdHkoKSkge1xuICAgICAgLy8gQnVmZmVyIGlzIGVtcHR5LCByZXNldCB0byByZWNvdmVyIHNwYWNlLlxuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgaWYgKHAuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyB0aGlzIGVkZ2UgY2FzZSBpcyB0ZXN0ZWQgaW4gJ2J1ZmZlclJlYWRFbXB0eUF0RU9GJyB0ZXN0XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG5yZWFkID0gY29weUJ5dGVzKHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpLCBwKTtcbiAgICB0aGlzLiNvZmYgKz0gbnJlYWQ7XG4gICAgcmV0dXJuIG5yZWFkO1xuICB9XG5cbiAgLyoqIFJlYWRzIHRoZSBuZXh0IGBwLmxlbmd0aGAgYnl0ZXMgZnJvbSB0aGUgYnVmZmVyIG9yIHVudGlsIHRoZSBidWZmZXIgaXNcbiAgICogZHJhaW5lZC4gUmVzb2x2ZXMgdG8gdGhlIG51bWJlciBvZiBieXRlcyByZWFkLiBJZiB0aGUgYnVmZmVyIGhhcyBub1xuICAgKiBkYXRhIHRvIHJldHVybiwgcmVzb2x2ZXMgdG8gRU9GIChgbnVsbGApLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1ldGhvZHMgcmVhZHMgYnl0ZXMgc3luY2hyb25vdXNseTsgaXQncyBwcm92aWRlZCBmb3JcbiAgICogY29tcGF0aWJpbGl0eSB3aXRoIGBSZWFkZXJgIGludGVyZmFjZXMuXG4gICAqL1xuICByZWFkKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBjb25zdCByciA9IHRoaXMucmVhZFN5bmMocCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShycik7XG4gIH1cblxuICB3cml0ZVN5bmMocDogVWludDhBcnJheSk6IG51bWJlciB7XG4gICAgY29uc3QgbSA9IHRoaXMuI2dyb3cocC5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4gY29weUJ5dGVzKHAsIHRoaXMuI2J1ZiwgbSk7XG4gIH1cblxuICAvKiogTk9URTogVGhpcyBtZXRob2RzIHdyaXRlcyBieXRlcyBzeW5jaHJvbm91c2x5OyBpdCdzIHByb3ZpZGVkIGZvclxuICAgKiBjb21wYXRpYmlsaXR5IHdpdGggYFdyaXRlcmAgaW50ZXJmYWNlLiAqL1xuICB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBuID0gdGhpcy53cml0ZVN5bmMocCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuKTtcbiAgfVxuXG4gICNncm93ID0gKG46IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IG0gPSB0aGlzLmxlbmd0aDtcbiAgICAvLyBJZiBidWZmZXIgaXMgZW1wdHksIHJlc2V0IHRvIHJlY292ZXIgc3BhY2UuXG4gICAgaWYgKG0gPT09IDAgJiYgdGhpcy4jb2ZmICE9PSAwKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxuICAgIC8vIEZhc3Q6IFRyeSB0byBncm93IGJ5IG1lYW5zIG9mIGEgcmVzbGljZS5cbiAgICBjb25zdCBpID0gdGhpcy4jdHJ5R3Jvd0J5UmVzbGljZShuKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gICAgY29uc3QgYyA9IHRoaXMuY2FwYWNpdHk7XG4gICAgaWYgKG4gPD0gTWF0aC5mbG9vcihjIC8gMikgLSBtKSB7XG4gICAgICAvLyBXZSBjYW4gc2xpZGUgdGhpbmdzIGRvd24gaW5zdGVhZCBvZiBhbGxvY2F0aW5nIGEgbmV3XG4gICAgICAvLyBBcnJheUJ1ZmZlci4gV2Ugb25seSBuZWVkIG0rbiA8PSBjIHRvIHNsaWRlLCBidXRcbiAgICAgIC8vIHdlIGluc3RlYWQgbGV0IGNhcGFjaXR5IGdldCB0d2ljZSBhcyBsYXJnZSBzbyB3ZVxuICAgICAgLy8gZG9uJ3Qgc3BlbmQgYWxsIG91ciB0aW1lIGNvcHlpbmcuXG4gICAgICBjb3B5Qnl0ZXModGhpcy4jYnVmLnN1YmFycmF5KHRoaXMuI29mZiksIHRoaXMuI2J1Zik7XG4gICAgfSBlbHNlIGlmIChjICsgbiA+IE1BWF9TSVpFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYnVmZmVyIGNhbm5vdCBiZSBncm93biBiZXlvbmQgdGhlIG1heGltdW0gc2l6ZS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdCBlbm91Z2ggc3BhY2UgYW55d2hlcmUsIHdlIG5lZWQgdG8gYWxsb2NhdGUuXG4gICAgICBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheShNYXRoLm1pbigyICogYyArIG4sIE1BWF9TSVpFKSk7XG4gICAgICBjb3B5Qnl0ZXModGhpcy4jYnVmLnN1YmFycmF5KHRoaXMuI29mZiksIGJ1Zik7XG4gICAgICB0aGlzLiNidWYgPSBidWY7XG4gICAgfVxuICAgIC8vIFJlc3RvcmUgdGhpcy4jb2ZmIGFuZCBsZW4odGhpcy4jYnVmKS5cbiAgICB0aGlzLiNvZmYgPSAwO1xuICAgIHRoaXMuI3Jlc2xpY2UoTWF0aC5taW4obSArIG4sIE1BWF9TSVpFKSk7XG4gICAgcmV0dXJuIG07XG4gIH07XG5cbiAgLyoqIEdyb3dzIHRoZSBidWZmZXIncyBjYXBhY2l0eSwgaWYgbmVjZXNzYXJ5LCB0byBndWFyYW50ZWUgc3BhY2UgZm9yXG4gICAqIGFub3RoZXIgYG5gIGJ5dGVzLiBBZnRlciBgLmdyb3cobilgLCBhdCBsZWFzdCBgbmAgYnl0ZXMgY2FuIGJlIHdyaXR0ZW4gdG9cbiAgICogdGhlIGJ1ZmZlciB3aXRob3V0IGFub3RoZXIgYWxsb2NhdGlvbi4gSWYgYG5gIGlzIG5lZ2F0aXZlLCBgLmdyb3coKWAgd2lsbFxuICAgKiB0aHJvdy4gSWYgdGhlIGJ1ZmZlciBjYW4ndCBncm93IGl0IHdpbGwgdGhyb3cgYW4gZXJyb3IuXG4gICAqXG4gICAqIEJhc2VkIG9uIEdvIExhbmcnc1xuICAgKiBbQnVmZmVyLkdyb3ddKGh0dHBzOi8vZ29sYW5nLm9yZy9wa2cvYnl0ZXMvI0J1ZmZlci5Hcm93KS4gKi9cbiAgZ3JvdyhuOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAobiA8IDApIHtcbiAgICAgIHRocm93IEVycm9yKFwiQnVmZmVyLmdyb3c6IG5lZ2F0aXZlIGNvdW50XCIpO1xuICAgIH1cbiAgICBjb25zdCBtID0gdGhpcy4jZ3JvdyhuKTtcbiAgICB0aGlzLiNyZXNsaWNlKG0pO1xuICB9XG5cbiAgLyoqIFJlYWRzIGRhdGEgZnJvbSBgcmAgdW50aWwgRU9GIChgbnVsbGApIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBidWZmZXIsXG4gICAqIGdyb3dpbmcgdGhlIGJ1ZmZlciBhcyBuZWVkZWQuIEl0IHJlc29sdmVzIHRvIHRoZSBudW1iZXIgb2YgYnl0ZXMgcmVhZC5cbiAgICogSWYgdGhlIGJ1ZmZlciBiZWNvbWVzIHRvbyBsYXJnZSwgYC5yZWFkRnJvbSgpYCB3aWxsIHJlamVjdCB3aXRoIGFuIGVycm9yLlxuICAgKlxuICAgKiBCYXNlZCBvbiBHbyBMYW5nJ3NcbiAgICogW0J1ZmZlci5SZWFkRnJvbV0oaHR0cHM6Ly9nb2xhbmcub3JnL3BrZy9ieXRlcy8jQnVmZmVyLlJlYWRGcm9tKS4gKi9cbiAgYXN5bmMgcmVhZEZyb20ocjogRGVuby5SZWFkZXIpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBuID0gMDtcbiAgICBjb25zdCB0bXAgPSBuZXcgVWludDhBcnJheShNSU5fUkVBRCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHNob3VsZEdyb3cgPSB0aGlzLmNhcGFjaXR5IC0gdGhpcy5sZW5ndGggPCBNSU5fUkVBRDtcbiAgICAgIC8vIHJlYWQgaW50byB0bXAgYnVmZmVyIGlmIHRoZXJlJ3Mgbm90IGVub3VnaCByb29tXG4gICAgICAvLyBvdGhlcndpc2UgcmVhZCBkaXJlY3RseSBpbnRvIHRoZSBpbnRlcm5hbCBidWZmZXJcbiAgICAgIGNvbnN0IGJ1ZiA9IHNob3VsZEdyb3dcbiAgICAgICAgPyB0bXBcbiAgICAgICAgOiBuZXcgVWludDhBcnJheSh0aGlzLiNidWYuYnVmZmVyLCB0aGlzLmxlbmd0aCk7XG5cbiAgICAgIGNvbnN0IG5yZWFkID0gYXdhaXQgci5yZWFkKGJ1Zik7XG4gICAgICBpZiAobnJlYWQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG47XG4gICAgICB9XG5cbiAgICAgIC8vIHdyaXRlIHdpbGwgZ3JvdyBpZiBuZWVkZWRcbiAgICAgIGlmIChzaG91bGRHcm93KSB0aGlzLndyaXRlU3luYyhidWYuc3ViYXJyYXkoMCwgbnJlYWQpKTtcbiAgICAgIGVsc2UgdGhpcy4jcmVzbGljZSh0aGlzLmxlbmd0aCArIG5yZWFkKTtcblxuICAgICAgbiArPSBucmVhZDtcbiAgICB9XG4gIH1cblxuICAvKiogUmVhZHMgZGF0YSBmcm9tIGByYCB1bnRpbCBFT0YgKGBudWxsYCkgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIGJ1ZmZlcixcbiAgICogZ3Jvd2luZyB0aGUgYnVmZmVyIGFzIG5lZWRlZC4gSXQgcmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHJlYWQuIElmIHRoZVxuICAgKiBidWZmZXIgYmVjb21lcyB0b28gbGFyZ2UsIGAucmVhZEZyb21TeW5jKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IuXG4gICAqXG4gICAqIEJhc2VkIG9uIEdvIExhbmcnc1xuICAgKiBbQnVmZmVyLlJlYWRGcm9tXShodHRwczovL2dvbGFuZy5vcmcvcGtnL2J5dGVzLyNCdWZmZXIuUmVhZEZyb20pLiAqL1xuICByZWFkRnJvbVN5bmMocjogRGVuby5SZWFkZXJTeW5jKTogbnVtYmVyIHtcbiAgICBsZXQgbiA9IDA7XG4gICAgY29uc3QgdG1wID0gbmV3IFVpbnQ4QXJyYXkoTUlOX1JFQUQpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBzaG91bGRHcm93ID0gdGhpcy5jYXBhY2l0eSAtIHRoaXMubGVuZ3RoIDwgTUlOX1JFQUQ7XG4gICAgICAvLyByZWFkIGludG8gdG1wIGJ1ZmZlciBpZiB0aGVyZSdzIG5vdCBlbm91Z2ggcm9vbVxuICAgICAgLy8gb3RoZXJ3aXNlIHJlYWQgZGlyZWN0bHkgaW50byB0aGUgaW50ZXJuYWwgYnVmZmVyXG4gICAgICBjb25zdCBidWYgPSBzaG91bGRHcm93XG4gICAgICAgID8gdG1wXG4gICAgICAgIDogbmV3IFVpbnQ4QXJyYXkodGhpcy4jYnVmLmJ1ZmZlciwgdGhpcy5sZW5ndGgpO1xuXG4gICAgICBjb25zdCBucmVhZCA9IHIucmVhZFN5bmMoYnVmKTtcbiAgICAgIGlmIChucmVhZCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbjtcbiAgICAgIH1cblxuICAgICAgLy8gd3JpdGUgd2lsbCBncm93IGlmIG5lZWRlZFxuICAgICAgaWYgKHNob3VsZEdyb3cpIHRoaXMud3JpdGVTeW5jKGJ1Zi5zdWJhcnJheSgwLCBucmVhZCkpO1xuICAgICAgZWxzZSB0aGlzLiNyZXNsaWNlKHRoaXMubGVuZ3RoICsgbnJlYWQpO1xuXG4gICAgICBuICs9IG5yZWFkO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNB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