import { fromEvent, merge } from "rxjs";
import { mergeMap } from "rxjs/operators";

async function sha256(message: string, output: "hex" | "base64" = "hex") {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hash = hashArray
    .map(b => {
      let str = b.toString(16).padStart(2, "0");
      if (output === "base64") {
        str = String.fromCharCode(parseInt(str, 16));
      }
      return str;
    })
    .join(""); // convert bytes to string
  if (output === "base64") {
    return btoa(hash);
  }
  return hash;
}

merge(
  fromEvent(document.querySelector("textarea"), "keyup"),
  ...Array.from(document.querySelectorAll<HTMLInputElement>("input")).map(i =>
    fromEvent(i, "click")
  )
)
  .pipe(
    mergeMap(async () => {
      const form = document.querySelector("form");
      const data = new FormData(form);
      const encoding = data.get("encoding").toString() as "hex" | "base64";
      const input = data.get("input").toString();
      return await sha256(input, encoding);
    })
  )
  .subscribe(result => (document.querySelector("#result").innerHTML = result));
