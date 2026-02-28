async function lookupMeaning(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(url);

  if (!res.ok) {
    return { ok: false, error: `No results for "${word}"` };
  }

  const data = await res.json();

  // data[0].meanings[0].definitions[0].definition ...
  const first = data?.[0];
  const meanings = first?.meanings ?? [];

  const lines = [];
  for (const m of meanings.slice(0, 2)) {
    const part = m.partOfSpeech ? `(${m.partOfSpeech}) ` : "";
    const def = m.definitions?.[0]?.definition;
    const ex = m.definitions?.[0]?.example;
    if (def) lines.push(`${part}${def}`);
    if (ex) lines.push(`e.g. ${ex}`);
  }

  const phonetic = first?.phonetic || first?.phonetics?.find(p => p?.text)?.text;
  return {
    ok: true,
    word,
    phonetic: phonetic || "",
    meaning: lines.join("\n")
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "LOOKUP" || !msg.word) return;

  lookupMeaning(msg.word)
    .then(result => sendResponse(result))
    .catch(err => sendResponse({ ok: false, error: String(err) }));

  return true; // keep the message channel open for async response
});