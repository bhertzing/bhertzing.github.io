(function () {
  const input = document.getElementById("q");
  const status = document.getElementById("status");
  const results = document.getElementById("results");
  if (!input || !status || !results) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get("q") && !input.value) input.value = params.get("q");

  let index = [];
  fetch("search.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      index = data;
      run(input.value);
    })
    .catch(function () {
      status.textContent = "Could not load the search index.";
    });

  let timer = null;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { run(input.value); }, 80);
  });
  input.form && input.form.addEventListener("submit", function (e) {
    e.preventDefault();
    run(input.value);
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  });

  function tokens(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function run(q) {
    const words = tokens(q);
    if (!index.length) return;
    if (!words.length) {
      status.textContent = "Type a word to search " + index.length + " posts.";
      results.innerHTML = "";
      return;
    }
    const hits = [];
    for (let i = 0; i < index.length; i++) {
      const p = index[i];
      const hay = (p.title + " " + (p.tags || []).join(" ") + " " + (p.categories || []).join(" ") + " " + p.text).toLowerCase();
      let ok = true;
      for (let w = 0; w < words.length; w++) {
        if (hay.indexOf(words[w]) === -1) { ok = false; break; }
      }
      if (!ok) continue;
      const titleL = p.title.toLowerCase();
      let score = 0;
      for (let w = 0; w < words.length; w++) {
        if (titleL.indexOf(words[w]) !== -1) score += 10;
        if ((p.tags || []).join(" ").toLowerCase().indexOf(words[w]) !== -1) score += 4;
        score += 1;
      }
      hits.push({ post: p, score: score, snippet: snippet(p.text, words) });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    status.textContent = hits.length
      ? hits.length + (hits.length === 1 ? " post" : " posts")
      : "No posts matched.";
    results.innerHTML = hits.map(function (h) {
      return '<article class="entry search-hit">' +
        '<p class="when">' + esc(h.post.when) + "</p>" +
        '<h2><a href="' + esc(h.post.slug) + '.html">' + highlight(h.post.title, words) + "</a></h2>" +
        '<div class="excerpt"><p>' + highlight(h.snippet, words) + "</p></div>" +
        '<a class="readon" href="' + esc(h.post.slug) + '.html">Read On ↵</a>' +
        "</article>";
    }).join("");
  }

  function snippet(text, words) {
    const lower = text.toLowerCase();
    let at = -1;
    for (let i = 0; i < words.length; i++) {
      at = lower.indexOf(words[i]);
      if (at !== -1) break;
    }
    if (at === -1) return text.slice(0, 180) + (text.length > 180 ? " …" : "");
    const start = Math.max(0, at - 70);
    const end = Math.min(text.length, at + 140);
    return (start ? "… " : "") + text.slice(start, end).trim() + (end < text.length ? " …" : "");
  }

  function highlight(text, words) {
    let out = esc(text);
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!w) continue;
      out = out.replace(new RegExp("(" + w + ")", "gi"), "<mark>$1</mark>");
    }
    return out;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
