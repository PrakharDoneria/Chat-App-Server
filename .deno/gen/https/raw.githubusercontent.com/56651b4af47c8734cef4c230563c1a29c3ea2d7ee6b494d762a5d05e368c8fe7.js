import { path } from "../../deps.ts";
export function static_(dir, ext = "html") {
  return async (req, res, next)=>{
    try {
      await res.file(path.join(dir, req.url.slice(1) || "index." + ext));
    } catch (e) {
      // console.error(e)
      await next();
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9OTWF0aGFyL2Rlbm8tZXhwcmVzcy9tYXN0ZXIvc3JjL2Z1bmN0aW9ucy9zdGF0aWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNaWRkbGV3YXJlLCBOZXh0fSBmcm9tIFwiLi4vLi4vdHlwZXMvaW5kZXgudHNcIlxuaW1wb3J0IHtwYXRofSBmcm9tIFwiLi4vLi4vZGVwcy50c1wiXG5pbXBvcnQge1JlcXVlc3R9IGZyb20gXCIuLi9SZXF1ZXN0LnRzXCJcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gXCIuLi9SZXNwb25zZS50c1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNfKGRpcjogc3RyaW5nLCBleHQgPSBcImh0bWxcIik6IE1pZGRsZXdhcmUge1xuICAgIHJldHVybiBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCByZXMuZmlsZShwYXRoLmpvaW4oZGlyLCByZXEudXJsLnNsaWNlKDEpIHx8IFwiaW5kZXguXCIgKyBleHQpKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKGUpXG4gICAgICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFRLElBQUksUUFBTyxnQkFBZTtBQUlsQyxPQUFPLFNBQVMsUUFBUSxHQUFXLEVBQUUsTUFBTSxNQUFNO0VBQzdDLE9BQU8sT0FBTyxLQUFjLEtBQWU7SUFDdkMsSUFBSTtNQUNBLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxXQUFXO0lBQ2pFLEVBQUUsT0FBTyxHQUFHO01BQ1IsbUJBQW1CO01BQ25CLE1BQU07SUFDVjtFQUNKO0FBQ0oifQ==