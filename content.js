function showTooltip(text, x, y) {
  let tip = document.getElementById("__meaning_tip");
  if (!tip) {
    tip = document.createElement("pre");
    tip.id = "__meaning_tip";
    tip.style.position = "fixed";
    tip.style.zIndex = "999999";
    tip.style.padding = "10px 12px";
    tip.style.borderRadius = "10px";
    tip.style.background = "rgba(20,20,20,0.95)";
    tip.style.color = "white";
    tip.style.fontSize = "14px";
    tip.style.maxWidth = "380px";
    tip.style.whiteSpace = "pre-wrap";
    tip.style.boxShadow = "0 8px 24px rgba(17, 172, 14, 0.35)";
    document.body.appendChild(tip);

    document.addEventListener(
      "click",
      (e) => {
        if (e.target !== tip) tip.remove();
      },
      { capture: true }
    );
  }

  tip.textContent = text;
  tip.style.left = Math.min(x + 12, window.innerWidth - 420) + "px";
  tip.style.top = Math.min(y + 12, window.innerHeight - 120) + "px";
}

function getSelectedWord() {
  const s = (window.getSelection?.().toString() || "").trim();
  if (!s) return null;
  // keep only a single word (letters, apostrophe, hyphen)
  const word = s.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/)?.[0];
  return word || null;
}

document.addEventListener("dblclick", async (e) => {
  const word = getSelectedWord();
  if (!word) return;

  showTooltip(`Looking up: ${word}...`, e.clientX, e.clientY);

  chrome.runtime.sendMessage({ type: "LOOKUP", word }, (resp) => {
    if (!resp) {
      showTooltip(`Failed to get response.\nTry reloading the extension.`, e.clientX, e.clientY);
      return;
    }

    if (!resp.ok) {
      showTooltip(resp.error || "No meaning found.", e.clientX, e.clientY);
      return;
    }

    const header = resp.phonetic ? `${resp.word} ${resp.phonetic}` : resp.word;
    showTooltip(`${header}\n\n${resp.meaning}`, e.clientX, e.clientY);
  });
});