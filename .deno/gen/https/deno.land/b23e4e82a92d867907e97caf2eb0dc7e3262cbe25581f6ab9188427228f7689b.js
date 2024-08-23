// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
/** HTTP status codes */ export var Status;
(function(Status) {
  /** RFC 7231, 6.2.1 */ Status[Status["Continue"] = 100] = "Continue";
  /** RFC 7231, 6.2.2 */ Status[Status["SwitchingProtocols"] = 101] = "SwitchingProtocols";
  /** RFC 2518, 10.1 */ Status[Status["Processing"] = 102] = "Processing";
  /** RFC 8297 **/ Status[Status["EarlyHints"] = 103] = "EarlyHints";
  /** RFC 7231, 6.3.1 */ Status[Status["OK"] = 200] = "OK";
  /** RFC 7231, 6.3.2 */ Status[Status["Created"] = 201] = "Created";
  /** RFC 7231, 6.3.3 */ Status[Status["Accepted"] = 202] = "Accepted";
  /** RFC 7231, 6.3.4 */ Status[Status["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
  /** RFC 7231, 6.3.5 */ Status[Status["NoContent"] = 204] = "NoContent";
  /** RFC 7231, 6.3.6 */ Status[Status["ResetContent"] = 205] = "ResetContent";
  /** RFC 7233, 4.1 */ Status[Status["PartialContent"] = 206] = "PartialContent";
  /** RFC 4918, 11.1 */ Status[Status["MultiStatus"] = 207] = "MultiStatus";
  /** RFC 5842, 7.1 */ Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
  /** RFC 3229, 10.4.1 */ Status[Status["IMUsed"] = 226] = "IMUsed";
  /** RFC 7231, 6.4.1 */ Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
  /** RFC 7231, 6.4.2 */ Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
  /** RFC 7231, 6.4.3 */ Status[Status["Found"] = 302] = "Found";
  /** RFC 7231, 6.4.4 */ Status[Status["SeeOther"] = 303] = "SeeOther";
  /** RFC 7232, 4.1 */ Status[Status["NotModified"] = 304] = "NotModified";
  /** RFC 7231, 6.4.5 */ Status[Status["UseProxy"] = 305] = "UseProxy";
  /** RFC 7231, 6.4.7 */ Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  /** RFC 7538, 3 */ Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
  /** RFC 7231, 6.5.1 */ Status[Status["BadRequest"] = 400] = "BadRequest";
  /** RFC 7235, 3.1 */ Status[Status["Unauthorized"] = 401] = "Unauthorized";
  /** RFC 7231, 6.5.2 */ Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
  /** RFC 7231, 6.5.3 */ Status[Status["Forbidden"] = 403] = "Forbidden";
  /** RFC 7231, 6.5.4 */ Status[Status["NotFound"] = 404] = "NotFound";
  /** RFC 7231, 6.5.5 */ Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  /** RFC 7231, 6.5.6 */ Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
  /** RFC 7235, 3.2 */ Status[Status["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
  /** RFC 7231, 6.5.7 */ Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
  /** RFC 7231, 6.5.8 */ Status[Status["Conflict"] = 409] = "Conflict";
  /** RFC 7231, 6.5.9 */ Status[Status["Gone"] = 410] = "Gone";
  /** RFC 7231, 6.5.10 */ Status[Status["LengthRequired"] = 411] = "LengthRequired";
  /** RFC 7232, 4.2 */ Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
  /** RFC 7231, 6.5.11 */ Status[Status["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
  /** RFC 7231, 6.5.12 */ Status[Status["RequestURITooLong"] = 414] = "RequestURITooLong";
  /** RFC 7231, 6.5.13 */ Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
  /** RFC 7233, 4.4 */ Status[Status["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
  /** RFC 7231, 6.5.14 */ Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
  /** RFC 7168, 2.3.3 */ Status[Status["Teapot"] = 418] = "Teapot";
  /** RFC 7540, 9.1.2 */ Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
  /** RFC 4918, 11.2 */ Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  /** RFC 4918, 11.3 */ Status[Status["Locked"] = 423] = "Locked";
  /** RFC 4918, 11.4 */ Status[Status["FailedDependency"] = 424] = "FailedDependency";
  /** RFC 8470, 5.2 */ Status[Status["TooEarly"] = 425] = "TooEarly";
  /** RFC 7231, 6.5.15 */ Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
  /** RFC 6585, 3 */ Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
  /** RFC 6585, 4 */ Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
  /** RFC 6585, 5 */ Status[Status["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
  /** RFC 7725, 3 */ Status[Status["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
  /** RFC 7231, 6.6.1 */ Status[Status["InternalServerError"] = 500] = "InternalServerError";
  /** RFC 7231, 6.6.2 */ Status[Status["NotImplemented"] = 501] = "NotImplemented";
  /** RFC 7231, 6.6.3 */ Status[Status["BadGateway"] = 502] = "BadGateway";
  /** RFC 7231, 6.6.4 */ Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  /** RFC 7231, 6.6.5 */ Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
  /** RFC 7231, 6.6.6 */ Status[Status["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
  /** RFC 2295, 8.1 */ Status[Status["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
  /** RFC 4918, 11.5 */ Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
  /** RFC 5842, 7.2 */ Status[Status["LoopDetected"] = 508] = "LoopDetected";
  /** RFC 2774, 7 */ Status[Status["NotExtended"] = 510] = "NotExtended";
  /** RFC 6585, 6 */ Status[Status["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {}));
export const STATUS_TEXT = new Map([
  [
    Status.Continue,
    "Continue"
  ],
  [
    Status.SwitchingProtocols,
    "Switching Protocols"
  ],
  [
    Status.Processing,
    "Processing"
  ],
  [
    Status.EarlyHints,
    "Early Hints"
  ],
  [
    Status.OK,
    "OK"
  ],
  [
    Status.Created,
    "Created"
  ],
  [
    Status.Accepted,
    "Accepted"
  ],
  [
    Status.NonAuthoritativeInfo,
    "Non-Authoritative Information"
  ],
  [
    Status.NoContent,
    "No Content"
  ],
  [
    Status.ResetContent,
    "Reset Content"
  ],
  [
    Status.PartialContent,
    "Partial Content"
  ],
  [
    Status.MultiStatus,
    "Multi-Status"
  ],
  [
    Status.AlreadyReported,
    "Already Reported"
  ],
  [
    Status.IMUsed,
    "IM Used"
  ],
  [
    Status.MultipleChoices,
    "Multiple Choices"
  ],
  [
    Status.MovedPermanently,
    "Moved Permanently"
  ],
  [
    Status.Found,
    "Found"
  ],
  [
    Status.SeeOther,
    "See Other"
  ],
  [
    Status.NotModified,
    "Not Modified"
  ],
  [
    Status.UseProxy,
    "Use Proxy"
  ],
  [
    Status.TemporaryRedirect,
    "Temporary Redirect"
  ],
  [
    Status.PermanentRedirect,
    "Permanent Redirect"
  ],
  [
    Status.BadRequest,
    "Bad Request"
  ],
  [
    Status.Unauthorized,
    "Unauthorized"
  ],
  [
    Status.PaymentRequired,
    "Payment Required"
  ],
  [
    Status.Forbidden,
    "Forbidden"
  ],
  [
    Status.NotFound,
    "Not Found"
  ],
  [
    Status.MethodNotAllowed,
    "Method Not Allowed"
  ],
  [
    Status.NotAcceptable,
    "Not Acceptable"
  ],
  [
    Status.ProxyAuthRequired,
    "Proxy Authentication Required"
  ],
  [
    Status.RequestTimeout,
    "Request Timeout"
  ],
  [
    Status.Conflict,
    "Conflict"
  ],
  [
    Status.Gone,
    "Gone"
  ],
  [
    Status.LengthRequired,
    "Length Required"
  ],
  [
    Status.PreconditionFailed,
    "Precondition Failed"
  ],
  [
    Status.RequestEntityTooLarge,
    "Request Entity Too Large"
  ],
  [
    Status.RequestURITooLong,
    "Request URI Too Long"
  ],
  [
    Status.UnsupportedMediaType,
    "Unsupported Media Type"
  ],
  [
    Status.RequestedRangeNotSatisfiable,
    "Requested Range Not Satisfiable"
  ],
  [
    Status.ExpectationFailed,
    "Expectation Failed"
  ],
  [
    Status.Teapot,
    "I'm a teapot"
  ],
  [
    Status.MisdirectedRequest,
    "Misdirected Request"
  ],
  [
    Status.UnprocessableEntity,
    "Unprocessable Entity"
  ],
  [
    Status.Locked,
    "Locked"
  ],
  [
    Status.FailedDependency,
    "Failed Dependency"
  ],
  [
    Status.TooEarly,
    "Too Early"
  ],
  [
    Status.UpgradeRequired,
    "Upgrade Required"
  ],
  [
    Status.PreconditionRequired,
    "Precondition Required"
  ],
  [
    Status.TooManyRequests,
    "Too Many Requests"
  ],
  [
    Status.RequestHeaderFieldsTooLarge,
    "Request Header Fields Too Large"
  ],
  [
    Status.UnavailableForLegalReasons,
    "Unavailable For Legal Reasons"
  ],
  [
    Status.InternalServerError,
    "Internal Server Error"
  ],
  [
    Status.NotImplemented,
    "Not Implemented"
  ],
  [
    Status.BadGateway,
    "Bad Gateway"
  ],
  [
    Status.ServiceUnavailable,
    "Service Unavailable"
  ],
  [
    Status.GatewayTimeout,
    "Gateway Timeout"
  ],
  [
    Status.HTTPVersionNotSupported,
    "HTTP Version Not Supported"
  ],
  [
    Status.VariantAlsoNegotiates,
    "Variant Also Negotiates"
  ],
  [
    Status.InsufficientStorage,
    "Insufficient Storage"
  ],
  [
    Status.LoopDetected,
    "Loop Detected"
  ],
  [
    Status.NotExtended,
    "Not Extended"
  ],
  [
    Status.NetworkAuthenticationRequired,
    "Network Authentication Required"
  ]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvaHR0cC9odHRwX3N0YXR1cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogSFRUUCBzdGF0dXMgY29kZXMgKi9cbmV4cG9ydCBlbnVtIFN0YXR1cyB7XG4gIC8qKiBSRkMgNzIzMSwgNi4yLjEgKi9cbiAgQ29udGludWUgPSAxMDAsXG4gIC8qKiBSRkMgNzIzMSwgNi4yLjIgKi9cbiAgU3dpdGNoaW5nUHJvdG9jb2xzID0gMTAxLFxuICAvKiogUkZDIDI1MTgsIDEwLjEgKi9cbiAgUHJvY2Vzc2luZyA9IDEwMixcbiAgLyoqIFJGQyA4Mjk3ICoqL1xuICBFYXJseUhpbnRzID0gMTAzLFxuICAvKiogUkZDIDcyMzEsIDYuMy4xICovXG4gIE9LID0gMjAwLFxuICAvKiogUkZDIDcyMzEsIDYuMy4yICovXG4gIENyZWF0ZWQgPSAyMDEsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjMgKi9cbiAgQWNjZXB0ZWQgPSAyMDIsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjQgKi9cbiAgTm9uQXV0aG9yaXRhdGl2ZUluZm8gPSAyMDMsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjUgKi9cbiAgTm9Db250ZW50ID0gMjA0LFxuICAvKiogUkZDIDcyMzEsIDYuMy42ICovXG4gIFJlc2V0Q29udGVudCA9IDIwNSxcbiAgLyoqIFJGQyA3MjMzLCA0LjEgKi9cbiAgUGFydGlhbENvbnRlbnQgPSAyMDYsXG4gIC8qKiBSRkMgNDkxOCwgMTEuMSAqL1xuICBNdWx0aVN0YXR1cyA9IDIwNyxcbiAgLyoqIFJGQyA1ODQyLCA3LjEgKi9cbiAgQWxyZWFkeVJlcG9ydGVkID0gMjA4LFxuICAvKiogUkZDIDMyMjksIDEwLjQuMSAqL1xuICBJTVVzZWQgPSAyMjYsXG5cbiAgLyoqIFJGQyA3MjMxLCA2LjQuMSAqL1xuICBNdWx0aXBsZUNob2ljZXMgPSAzMDAsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjIgKi9cbiAgTW92ZWRQZXJtYW5lbnRseSA9IDMwMSxcbiAgLyoqIFJGQyA3MjMxLCA2LjQuMyAqL1xuICBGb3VuZCA9IDMwMixcbiAgLyoqIFJGQyA3MjMxLCA2LjQuNCAqL1xuICBTZWVPdGhlciA9IDMwMyxcbiAgLyoqIFJGQyA3MjMyLCA0LjEgKi9cbiAgTm90TW9kaWZpZWQgPSAzMDQsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjUgKi9cbiAgVXNlUHJveHkgPSAzMDUsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjcgKi9cbiAgVGVtcG9yYXJ5UmVkaXJlY3QgPSAzMDcsXG4gIC8qKiBSRkMgNzUzOCwgMyAqL1xuICBQZXJtYW5lbnRSZWRpcmVjdCA9IDMwOCxcblxuICAvKiogUkZDIDcyMzEsIDYuNS4xICovXG4gIEJhZFJlcXVlc3QgPSA0MDAsXG4gIC8qKiBSRkMgNzIzNSwgMy4xICovXG4gIFVuYXV0aG9yaXplZCA9IDQwMSxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMiAqL1xuICBQYXltZW50UmVxdWlyZWQgPSA0MDIsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjMgKi9cbiAgRm9yYmlkZGVuID0gNDAzLFxuICAvKiogUkZDIDcyMzEsIDYuNS40ICovXG4gIE5vdEZvdW5kID0gNDA0LFxuICAvKiogUkZDIDcyMzEsIDYuNS41ICovXG4gIE1ldGhvZE5vdEFsbG93ZWQgPSA0MDUsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjYgKi9cbiAgTm90QWNjZXB0YWJsZSA9IDQwNixcbiAgLyoqIFJGQyA3MjM1LCAzLjIgKi9cbiAgUHJveHlBdXRoUmVxdWlyZWQgPSA0MDcsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjcgKi9cbiAgUmVxdWVzdFRpbWVvdXQgPSA0MDgsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjggKi9cbiAgQ29uZmxpY3QgPSA0MDksXG4gIC8qKiBSRkMgNzIzMSwgNi41LjkgKi9cbiAgR29uZSA9IDQxMCxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTAgKi9cbiAgTGVuZ3RoUmVxdWlyZWQgPSA0MTEsXG4gIC8qKiBSRkMgNzIzMiwgNC4yICovXG4gIFByZWNvbmRpdGlvbkZhaWxlZCA9IDQxMixcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTEgKi9cbiAgUmVxdWVzdEVudGl0eVRvb0xhcmdlID0gNDEzLFxuICAvKiogUkZDIDcyMzEsIDYuNS4xMiAqL1xuICBSZXF1ZXN0VVJJVG9vTG9uZyA9IDQxNCxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTMgKi9cbiAgVW5zdXBwb3J0ZWRNZWRpYVR5cGUgPSA0MTUsXG4gIC8qKiBSRkMgNzIzMywgNC40ICovXG4gIFJlcXVlc3RlZFJhbmdlTm90U2F0aXNmaWFibGUgPSA0MTYsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjE0ICovXG4gIEV4cGVjdGF0aW9uRmFpbGVkID0gNDE3LFxuICAvKiogUkZDIDcxNjgsIDIuMy4zICovXG4gIFRlYXBvdCA9IDQxOCxcbiAgLyoqIFJGQyA3NTQwLCA5LjEuMiAqL1xuICBNaXNkaXJlY3RlZFJlcXVlc3QgPSA0MjEsXG4gIC8qKiBSRkMgNDkxOCwgMTEuMiAqL1xuICBVbnByb2Nlc3NhYmxlRW50aXR5ID0gNDIyLFxuICAvKiogUkZDIDQ5MTgsIDExLjMgKi9cbiAgTG9ja2VkID0gNDIzLFxuICAvKiogUkZDIDQ5MTgsIDExLjQgKi9cbiAgRmFpbGVkRGVwZW5kZW5jeSA9IDQyNCxcbiAgLyoqIFJGQyA4NDcwLCA1LjIgKi9cbiAgVG9vRWFybHkgPSA0MjUsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjE1ICovXG4gIFVwZ3JhZGVSZXF1aXJlZCA9IDQyNixcbiAgLyoqIFJGQyA2NTg1LCAzICovXG4gIFByZWNvbmRpdGlvblJlcXVpcmVkID0gNDI4LFxuICAvKiogUkZDIDY1ODUsIDQgKi9cbiAgVG9vTWFueVJlcXVlc3RzID0gNDI5LFxuICAvKiogUkZDIDY1ODUsIDUgKi9cbiAgUmVxdWVzdEhlYWRlckZpZWxkc1Rvb0xhcmdlID0gNDMxLFxuICAvKiogUkZDIDc3MjUsIDMgKi9cbiAgVW5hdmFpbGFibGVGb3JMZWdhbFJlYXNvbnMgPSA0NTEsXG5cbiAgLyoqIFJGQyA3MjMxLCA2LjYuMSAqL1xuICBJbnRlcm5hbFNlcnZlckVycm9yID0gNTAwLFxuICAvKiogUkZDIDcyMzEsIDYuNi4yICovXG4gIE5vdEltcGxlbWVudGVkID0gNTAxLFxuICAvKiogUkZDIDcyMzEsIDYuNi4zICovXG4gIEJhZEdhdGV3YXkgPSA1MDIsXG4gIC8qKiBSRkMgNzIzMSwgNi42LjQgKi9cbiAgU2VydmljZVVuYXZhaWxhYmxlID0gNTAzLFxuICAvKiogUkZDIDcyMzEsIDYuNi41ICovXG4gIEdhdGV3YXlUaW1lb3V0ID0gNTA0LFxuICAvKiogUkZDIDcyMzEsIDYuNi42ICovXG4gIEhUVFBWZXJzaW9uTm90U3VwcG9ydGVkID0gNTA1LFxuICAvKiogUkZDIDIyOTUsIDguMSAqL1xuICBWYXJpYW50QWxzb05lZ290aWF0ZXMgPSA1MDYsXG4gIC8qKiBSRkMgNDkxOCwgMTEuNSAqL1xuICBJbnN1ZmZpY2llbnRTdG9yYWdlID0gNTA3LFxuICAvKiogUkZDIDU4NDIsIDcuMiAqL1xuICBMb29wRGV0ZWN0ZWQgPSA1MDgsXG4gIC8qKiBSRkMgMjc3NCwgNyAqL1xuICBOb3RFeHRlbmRlZCA9IDUxMCxcbiAgLyoqIFJGQyA2NTg1LCA2ICovXG4gIE5ldHdvcmtBdXRoZW50aWNhdGlvblJlcXVpcmVkID0gNTExLFxufVxuXG5leHBvcnQgY29uc3QgU1RBVFVTX1RFWFQgPSBuZXcgTWFwPFN0YXR1cywgc3RyaW5nPihbXG4gIFtTdGF0dXMuQ29udGludWUsIFwiQ29udGludWVcIl0sXG4gIFtTdGF0dXMuU3dpdGNoaW5nUHJvdG9jb2xzLCBcIlN3aXRjaGluZyBQcm90b2NvbHNcIl0sXG4gIFtTdGF0dXMuUHJvY2Vzc2luZywgXCJQcm9jZXNzaW5nXCJdLFxuICBbU3RhdHVzLkVhcmx5SGludHMsIFwiRWFybHkgSGludHNcIl0sXG4gIFtTdGF0dXMuT0ssIFwiT0tcIl0sXG4gIFtTdGF0dXMuQ3JlYXRlZCwgXCJDcmVhdGVkXCJdLFxuICBbU3RhdHVzLkFjY2VwdGVkLCBcIkFjY2VwdGVkXCJdLFxuICBbU3RhdHVzLk5vbkF1dGhvcml0YXRpdmVJbmZvLCBcIk5vbi1BdXRob3JpdGF0aXZlIEluZm9ybWF0aW9uXCJdLFxuICBbU3RhdHVzLk5vQ29udGVudCwgXCJObyBDb250ZW50XCJdLFxuICBbU3RhdHVzLlJlc2V0Q29udGVudCwgXCJSZXNldCBDb250ZW50XCJdLFxuICBbU3RhdHVzLlBhcnRpYWxDb250ZW50LCBcIlBhcnRpYWwgQ29udGVudFwiXSxcbiAgW1N0YXR1cy5NdWx0aVN0YXR1cywgXCJNdWx0aS1TdGF0dXNcIl0sXG4gIFtTdGF0dXMuQWxyZWFkeVJlcG9ydGVkLCBcIkFscmVhZHkgUmVwb3J0ZWRcIl0sXG4gIFtTdGF0dXMuSU1Vc2VkLCBcIklNIFVzZWRcIl0sXG4gIFtTdGF0dXMuTXVsdGlwbGVDaG9pY2VzLCBcIk11bHRpcGxlIENob2ljZXNcIl0sXG4gIFtTdGF0dXMuTW92ZWRQZXJtYW5lbnRseSwgXCJNb3ZlZCBQZXJtYW5lbnRseVwiXSxcbiAgW1N0YXR1cy5Gb3VuZCwgXCJGb3VuZFwiXSxcbiAgW1N0YXR1cy5TZWVPdGhlciwgXCJTZWUgT3RoZXJcIl0sXG4gIFtTdGF0dXMuTm90TW9kaWZpZWQsIFwiTm90IE1vZGlmaWVkXCJdLFxuICBbU3RhdHVzLlVzZVByb3h5LCBcIlVzZSBQcm94eVwiXSxcbiAgW1N0YXR1cy5UZW1wb3JhcnlSZWRpcmVjdCwgXCJUZW1wb3JhcnkgUmVkaXJlY3RcIl0sXG4gIFtTdGF0dXMuUGVybWFuZW50UmVkaXJlY3QsIFwiUGVybWFuZW50IFJlZGlyZWN0XCJdLFxuICBbU3RhdHVzLkJhZFJlcXVlc3QsIFwiQmFkIFJlcXVlc3RcIl0sXG4gIFtTdGF0dXMuVW5hdXRob3JpemVkLCBcIlVuYXV0aG9yaXplZFwiXSxcbiAgW1N0YXR1cy5QYXltZW50UmVxdWlyZWQsIFwiUGF5bWVudCBSZXF1aXJlZFwiXSxcbiAgW1N0YXR1cy5Gb3JiaWRkZW4sIFwiRm9yYmlkZGVuXCJdLFxuICBbU3RhdHVzLk5vdEZvdW5kLCBcIk5vdCBGb3VuZFwiXSxcbiAgW1N0YXR1cy5NZXRob2ROb3RBbGxvd2VkLCBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiXSxcbiAgW1N0YXR1cy5Ob3RBY2NlcHRhYmxlLCBcIk5vdCBBY2NlcHRhYmxlXCJdLFxuICBbU3RhdHVzLlByb3h5QXV0aFJlcXVpcmVkLCBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlJlcXVlc3RUaW1lb3V0LCBcIlJlcXVlc3QgVGltZW91dFwiXSxcbiAgW1N0YXR1cy5Db25mbGljdCwgXCJDb25mbGljdFwiXSxcbiAgW1N0YXR1cy5Hb25lLCBcIkdvbmVcIl0sXG4gIFtTdGF0dXMuTGVuZ3RoUmVxdWlyZWQsIFwiTGVuZ3RoIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlByZWNvbmRpdGlvbkZhaWxlZCwgXCJQcmVjb25kaXRpb24gRmFpbGVkXCJdLFxuICBbU3RhdHVzLlJlcXVlc3RFbnRpdHlUb29MYXJnZSwgXCJSZXF1ZXN0IEVudGl0eSBUb28gTGFyZ2VcIl0sXG4gIFtTdGF0dXMuUmVxdWVzdFVSSVRvb0xvbmcsIFwiUmVxdWVzdCBVUkkgVG9vIExvbmdcIl0sXG4gIFtTdGF0dXMuVW5zdXBwb3J0ZWRNZWRpYVR5cGUsIFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiXSxcbiAgW1N0YXR1cy5SZXF1ZXN0ZWRSYW5nZU5vdFNhdGlzZmlhYmxlLCBcIlJlcXVlc3RlZCBSYW5nZSBOb3QgU2F0aXNmaWFibGVcIl0sXG4gIFtTdGF0dXMuRXhwZWN0YXRpb25GYWlsZWQsIFwiRXhwZWN0YXRpb24gRmFpbGVkXCJdLFxuICBbU3RhdHVzLlRlYXBvdCwgXCJJJ20gYSB0ZWFwb3RcIl0sXG4gIFtTdGF0dXMuTWlzZGlyZWN0ZWRSZXF1ZXN0LCBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIl0sXG4gIFtTdGF0dXMuVW5wcm9jZXNzYWJsZUVudGl0eSwgXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiXSxcbiAgW1N0YXR1cy5Mb2NrZWQsIFwiTG9ja2VkXCJdLFxuICBbU3RhdHVzLkZhaWxlZERlcGVuZGVuY3ksIFwiRmFpbGVkIERlcGVuZGVuY3lcIl0sXG4gIFtTdGF0dXMuVG9vRWFybHksIFwiVG9vIEVhcmx5XCJdLFxuICBbU3RhdHVzLlVwZ3JhZGVSZXF1aXJlZCwgXCJVcGdyYWRlIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlByZWNvbmRpdGlvblJlcXVpcmVkLCBcIlByZWNvbmRpdGlvbiBSZXF1aXJlZFwiXSxcbiAgW1N0YXR1cy5Ub29NYW55UmVxdWVzdHMsIFwiVG9vIE1hbnkgUmVxdWVzdHNcIl0sXG4gIFtTdGF0dXMuUmVxdWVzdEhlYWRlckZpZWxkc1Rvb0xhcmdlLCBcIlJlcXVlc3QgSGVhZGVyIEZpZWxkcyBUb28gTGFyZ2VcIl0sXG4gIFtTdGF0dXMuVW5hdmFpbGFibGVGb3JMZWdhbFJlYXNvbnMsIFwiVW5hdmFpbGFibGUgRm9yIExlZ2FsIFJlYXNvbnNcIl0sXG4gIFtTdGF0dXMuSW50ZXJuYWxTZXJ2ZXJFcnJvciwgXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIl0sXG4gIFtTdGF0dXMuTm90SW1wbGVtZW50ZWQsIFwiTm90IEltcGxlbWVudGVkXCJdLFxuICBbU3RhdHVzLkJhZEdhdGV3YXksIFwiQmFkIEdhdGV3YXlcIl0sXG4gIFtTdGF0dXMuU2VydmljZVVuYXZhaWxhYmxlLCBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIl0sXG4gIFtTdGF0dXMuR2F0ZXdheVRpbWVvdXQsIFwiR2F0ZXdheSBUaW1lb3V0XCJdLFxuICBbU3RhdHVzLkhUVFBWZXJzaW9uTm90U3VwcG9ydGVkLCBcIkhUVFAgVmVyc2lvbiBOb3QgU3VwcG9ydGVkXCJdLFxuICBbU3RhdHVzLlZhcmlhbnRBbHNvTmVnb3RpYXRlcywgXCJWYXJpYW50IEFsc28gTmVnb3RpYXRlc1wiXSxcbiAgW1N0YXR1cy5JbnN1ZmZpY2llbnRTdG9yYWdlLCBcIkluc3VmZmljaWVudCBTdG9yYWdlXCJdLFxuICBbU3RhdHVzLkxvb3BEZXRlY3RlZCwgXCJMb29wIERldGVjdGVkXCJdLFxuICBbU3RhdHVzLk5vdEV4dGVuZGVkLCBcIk5vdCBFeHRlbmRlZFwiXSxcbiAgW1N0YXR1cy5OZXR3b3JrQXV0aGVudGljYXRpb25SZXF1aXJlZCwgXCJOZXR3b3JrIEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJdLFxuXSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLHNCQUFzQjtVQUNWO0VBQ1Ysb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixtQkFBbUI7RUFFbkIsY0FBYztFQUVkLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsb0JBQW9CO0VBRXBCLGtCQUFrQjtFQUVsQixtQkFBbUI7RUFFbkIsa0JBQWtCO0VBRWxCLHFCQUFxQjtFQUdyQixvQkFBb0I7RUFFcEIsb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsa0JBQWtCO0VBRWxCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsZ0JBQWdCO0VBR2hCLG9CQUFvQjtFQUVwQixrQkFBa0I7RUFFbEIsb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixrQkFBa0I7RUFFbEIsb0JBQW9CO0VBRXBCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIscUJBQXFCO0VBRXJCLGtCQUFrQjtFQUVsQixxQkFBcUI7RUFFckIscUJBQXFCO0VBRXJCLHFCQUFxQjtFQUVyQixrQkFBa0I7RUFFbEIscUJBQXFCO0VBRXJCLG9CQUFvQjtFQUVwQixvQkFBb0I7RUFFcEIsbUJBQW1CO0VBRW5CLG1CQUFtQjtFQUVuQixtQkFBbUI7RUFFbkIsa0JBQWtCO0VBRWxCLHFCQUFxQjtFQUVyQixnQkFBZ0I7RUFFaEIsZ0JBQWdCO0VBRWhCLGdCQUFnQjtFQUVoQixnQkFB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