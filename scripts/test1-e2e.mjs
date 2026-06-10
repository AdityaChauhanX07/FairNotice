// TEST 1: full browser E2E with the eviction sample.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9410;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), "cdp-t1-"));
const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--no-sandbox","--no-first-run",`--remote-debugging-port=${PORT}`,`--user-data-dir=${userDir}`,"about:blank"]);
for (let i = 0; i < 40; i++) { try { await fetch(`http://localhost:${PORT}/json/version`); break; } catch { await sleep(250); } }

const target = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  else if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails?.exception?.description || "exception");
  else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    const t = m.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
    if (!/favicon|DevTools/i.test(t)) errors.push("console: " + t.slice(0, 160));
  }
};
const send = (method, params = {}) => new Promise((res) => { const myId = ++id; pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); });
await new Promise((res) => (ws.onopen = res));
await send("Page.enable"); await send("Runtime.enable");
const evalJs = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.value;

console.log("1. navigating to /upload");
await send("Page.navigate", { url: "http://localhost:3000/upload" });
await sleep(3500);
console.log("2. clicking 'Eviction Notice' sample");
await evalJs(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Eviction Notice');b&&b.click();return 1;})()`);
await sleep(2500);
const loaded = await evalJs(`[...document.querySelectorAll('p')].some(p=>p.textContent.includes('eviction-notice-ca.txt'))`);
console.log("   sample loaded:", loaded);
console.log("3. clicking 'Analyze My Document'");
const t0 = Date.now();
await evalJs(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Analyze My Document'));b&&b.click();return 1;})()`);

console.log("4. waiting up to 120s for /results ...");
let navigated = false;
for (let i = 0; i < 60; i++) {
  await sleep(2000);
  const url = await evalJs(`location.pathname`);
  if (url === "/results") { navigated = true; break; }
  // surface any error toast if the pipeline failed
  const toast = await evalJs(`(()=>{const e=[...document.querySelectorAll('div')].map(d=>d.textContent).find(t=>t&&/Step \\d|failed|rate limit/i.test(t)&&t.length<260);return e||null;})()`);
  if (toast) { console.log(`   [t+${Math.round((Date.now()-t0)/1000)}s] ERROR TOAST: ${toast}`); break; }
}
const elapsed = Math.round((Date.now() - t0) / 1000);

console.log(`\n=== TEST 1 RESULTS ===`);
console.log(`6. navigated to /results: ${navigated ? "PASS" : "FAIL"} (after ${elapsed}s)`);
if (navigated) {
  await sleep(3000);
  await evalJs(`(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);})()`);
  const txt = await evalJs(`document.body.innerText`);
  const markers = ["Sunset Property Management","David Chen","Oak Street","administrative fee","3-day","unpaid rent"].filter(m => new RegExp(m,"i").test(txt));
  const real = markers.length > 0;
  console.log(`7. real data rendered: ${real ? "PASS" : "FAIL"} | markers found: ${JSON.stringify(markers)}`);
  // show the document summary excerpt
  const summary = await evalJs(`(()=>{const m=document.body.innerText.match(/What You Received[\\s\\S]{0,400}/);return m?m[0].replace(/\\s+/g,' ').slice(0,300):null;})()`);
  console.log("   summary excerpt:", summary);
}
console.log(`   console errors: ${errors.length ? JSON.stringify(errors.slice(0,4)) : "(none)"}`);
ws.close(); chrome.kill(); process.exit(0);
