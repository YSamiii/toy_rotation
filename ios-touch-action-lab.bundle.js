// ios-touch-action-lab.js
var events = [];
var output = document.querySelector("#log");
var viewport = window.visualViewport;
var snapshot = () => ({ scale: viewport?.scale ?? 1, width: viewport?.width ?? innerWidth, height: viewport?.height ?? innerHeight, offsetLeft: viewport?.offsetLeft ?? 0, offsetTop: viewport?.offsetTop ?? 0, innerWidth, innerHeight, scrollX, scrollY, documentWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth });
var chain = (target) => {
  const rows = [];
  for (let node = target; node instanceof Element; node = node.parentElement) {
    rows.push({ tag: node.tagName, id: node.id || null, condition: node.dataset?.condition || null, touchAction: getComputedStyle(node).touchAction });
    if (node === document.documentElement) break;
  }
  return rows;
};
var record = (name, event = null, detail = {}) => {
  const target = event?.target instanceof Element ? event.target : null;
  const touch = event?.changedTouches?.[0] || event?.touches?.[0] || null;
  events.push({ name, at: Date.now(), performanceNow: performance.now(), eventTimeStamp: event?.timeStamp ?? null, cancelable: event?.cancelable ?? null, defaultPrevented: event?.defaultPrevented ?? null, eventPhase: event?.eventPhase ?? null, touches: event?.touches?.length ?? 0, changedTouches: event?.changedTouches?.length ?? 0, target: target ? { tag: target.tagName, id: target.id || null, condition: target.dataset.condition || null, computedTouchAction: getComputedStyle(target).touchAction, ancestors: chain(target) } : null, touch: touch ? { identifier: touch.identifier, x: Math.round(touch.clientX), y: Math.round(touch.clientY) } : null, viewport: snapshot(), ...detail });
  if (events.length > 300) events.shift();
  output.textContent = JSON.stringify(events.slice(-18), null, 2);
};
for (const type of ["touchstart", "touchend", "click", "dblclick"]) document.addEventListener(type, (event) => record(type, event), { capture: true, passive: true });
viewport?.addEventListener("resize", () => record("visualviewport_resize"), { passive: true });
viewport?.addEventListener("scroll", () => record("visualviewport_scroll"), { passive: true });
document.querySelector("#scroll-probe").addEventListener("scroll", () => record("scroll_probe"), { passive: true });
document.querySelector('[data-condition="click-cancel"]').addEventListener("click", (event) => {
  const enabled = document.querySelector("#enable-click-cancel").checked;
  if (enabled && event.cancelable) event.preventDefault();
  record("click_cancel_experiment", event, { enabled });
});
var config = window.TOY_ROTATION_CONFIG || {};
var standalone = matchMedia?.("(display-mode: standalone)").matches === true || navigator.standalone === true;
var cacheKeys = await caches.keys().catch(() => []);
document.querySelector("#identity").textContent = `${config.buildId || "unknown build"} \xB7 ${standalone ? "standalone PWA" : "browser tab"}`;
document.querySelector("#environment").textContent = JSON.stringify({ buildId: config.buildId || null, release: config.RELEASE || null, standalone, serviceWorkerController: Boolean(navigator.serviceWorker?.controller), cacheKeys, htmlTouchAction: getComputedStyle(document.documentElement).touchAction, viewport: snapshot() }, null, 2);
record("lab_ready", null, { buildId: config.buildId || null, standalone, cacheKeys, htmlTouchAction: getComputedStyle(document.documentElement).touchAction });
document.querySelector("#clear").addEventListener("click", () => {
  events.length = 0;
  output.textContent = "No events yet.";
  record("log_cleared");
});
document.querySelector("#export").addEventListener("click", () => {
  const payload = { kind: "toy_rotation_ios_touch_action_lab", version: 1, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), buildId: config.buildId || null, standalone, privacy: { appData: false, inputValues: false, networkTransmission: false }, events };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ios-touch-action-lab.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
});
