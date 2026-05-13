(function () {
  // Read persisted state before any GSAP scripts run
  window.DEBUG = localStorage.getItem("gsap-debug") === "true";

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("debug-toggle");
    if (!btn) return;

    // Reflect current state on load
    syncBtn(btn);

    btn.addEventListener("click", function () {
      window.DEBUG = !window.DEBUG;
      localStorage.setItem("gsap-debug", window.DEBUG);
      location.reload();
    });
  });

  function syncBtn(btn) {
    const on = window.DEBUG;
    btn.textContent = "Markers " + (on ? "ON" : "OFF");
    btn.dataset.debugActive = on;
  }
})();
