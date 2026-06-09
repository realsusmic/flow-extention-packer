(function () {
  "use strict";

  const root = self.flow.ui.root;

  function setStatus(message, tone) {
    const status = document.querySelector(".packer-status");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone || "default";
  }

  self.activate = function () {
    document.head.insertAdjacentHTML("beforeend", `<style>
      body { background:var(--bg); color:var(--text); }
      #flow-extension-root { min-height:100vh; padding:34px; background:var(--bg); }
      .packer-card { width:min(680px,100%); margin:0 auto; padding:26px; background:var(--card); border:1px solid var(--border); border-radius:10px; }
      .packer-head { display:flex; gap:13px; align-items:center; margin-bottom:14px; }
      .packer-mark { width:40px; height:40px; display:grid; place-items:center; color:var(--accent); border:1px solid var(--accent); border-radius:8px; font:700 12px ui-monospace,monospace; }
      h1 { margin:0; font-size:19px; } p { color:var(--dim); line-height:1.55; }
      button { width:100%; padding:10px 14px; color:white; background:var(--accent); border:0; border-radius:6px; cursor:pointer; }
      button:disabled { opacity:.6; cursor:wait; }
      .packer-rules { margin:18px 0; padding:14px 18px; color:var(--dim); background:var(--card2); border:1px solid var(--border); border-radius:7px; font:11px/1.65 ui-monospace,monospace; }
      .packer-status { margin-top:15px; color:var(--dim); overflow-wrap:anywhere; }
      .packer-status[data-tone="ok"] { color:var(--accent-bright); }
      .packer-status[data-tone="error"] { color:var(--bad); }
    </style>`);

    root.innerHTML = `<main class="packer-card">
      <div class="packer-head"><div class="packer-mark">.flow</div><div><h1>Extension Packer</h1><p>Package a Flow extension folder.</p></div></div>
      <div class="packer-rules">Requires manifest.json, its entry file, and an exact 32x32 SVG, ICO, or BMP icon. Flow generates signature.json and validates the package before saving.</div>
      <button class="packer-button">choose folder and pack</button>
      <div class="packer-status">No folder selected.</div>
    </main>`;

    const button = root.querySelector(".packer-button");
    button.onclick = async function () {
      button.disabled = true;
      button.textContent = "packing...";
      setStatus("Choose the extension source folder.", "default");
      try {
        const result = await self.flow.extensions.packFolder();
        if (!result) {
          setStatus("Packing cancelled.", "default");
        } else if (!result.ok) {
          setStatus(result.error || "Flow could not pack this extension.", "error");
        } else {
          setStatus(`Packed ${result.manifest.extensions[0].name} to ${result.outputPath} (${result.size.toLocaleString()} bytes).`, "ok");
        }
      } catch (error) {
        setStatus(error && error.message ? error.message : String(error), "error");
      } finally {
        button.disabled = false;
        button.textContent = "choose folder and pack";
      }
    };
  };
})();
