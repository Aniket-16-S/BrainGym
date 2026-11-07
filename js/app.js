(() => {
    const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)], R = Math.random;
    const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const B = document.body, gal = $("#gal"), cv = $("#bg"), cx = cv.getContext("2d"), main = $("main"), card = $("#card"), holo = $(".holo");
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const keys = Object.keys(CATS), key = n => n.name.replace(/^the\s+/i, "").toUpperCase();
    let W = 1, H = 1, OS = 56, Rr = 200, t = 0, T0 = performance.now(), init = 0, view = "galaxy", cat = "all", q = "", apps = false, hov = -1, mc = 0, starCol = "#cfe0ff", M = { x: -999, y: -999 };
    let mainRect = { left: 0, top: 0, width: 1, height: 1 };
    const N = S.map((r, i) => ({ i, name: r[0], url: r[1], cat: r[2], blurb: r[3], tags: r[4], bonus: r[5], app: r[6] || "", play: /play\.google/.test(r[1]), x: 0, y: 0, vx: 0, vy: 0, s: .1, o: 0, ph: R() * 6.28, on: true, r: 0, hx: 0, hy: 0, ts: 1, to: 1 }));
    keys.forEach(c => { const L = N.filter(n => n.cat === c); L.forEach((n, k) => { n.k = k; n.pr = k ? L[(k - 1) >> 1] : null }); CATS[c][2] = [0, 0, L.length] });
    const SORT = [...N].sort((a, b) => key(a) < key(b) ? -1 : 1); SORT.forEach((n, k) => n.pg = k + 1);
    const ST = Array.from({ length: 130 }, () => ({ x: R(), y: R(), z: R() * .9 + .2, a: R() * 6 }));
    const NO_FAV = new Set(["Memory Champions", "Remote Associates Test", "Dangerous Writing App", "Cranky Uncle"]);
    const ini = n => n.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const inner = n => ini(n) + (n.play || NO_FAV.has(n.name) ? "" : `<img alt="" loading="lazy" src="https://www.google.com/s2/favicons?domain=${new URL(n.url).hostname}&amp;sz=64" onerror="this.remove()">`);
    const em = (n, c = "") => `<i class="em ${c}" style="--c:${CATS[n.cat][1]}">${inner(n)}</i>`;
    const focus = () => cat !== "all" || q || apps;
    const match = n => (cat === "all" || n.cat === cat) && (!apps || n.play || n.app) && (!q || (n.name + " " + n.blurb + " " + n.tags + " " + CATS[n.cat][0]).toLowerCase().includes(q));

    // ---- build DOM
    keys.forEach(c => { const l = document.createElement("div"); l.className = "cl"; l.style.setProperty("--c", CATS[c][1]); l.textContent = CATS[c][0]; gal.append(l); CATS[c].lab = l });
    N.forEach(n => { const b = document.createElement("button"); b.className = "orb em"; b.style.setProperty("--c", CATS[n.cat][1]); b.setAttribute("aria-label", n.name + ": " + n.blurb); b.innerHTML = inner(n) + `<span class="lb">${esc(n.name)}</span>`; b.onclick = () => open(n); b.onpointerenter = () => hov = n.i; b.onpointerleave = () => hov = -1; gal.append(b); n.el = b });
    const ix = $("#index .wrap"), gr = $("#cards .grid"), gp = {};
    SORT.forEach(n => { const k = key(n)[0]; (gp[k] = gp[k] || []).push(n) });
    Object.keys(gp).sort().forEach(L => { const s = document.createElement("section"); s.innerHTML = `<h3 class="ltr">${L}</h3>`; gp[L].forEach(n => { const r = document.createElement("button"); r.className = "row"; r.style.setProperty("--c", CATS[n.cat][1]); r.innerHTML = `<span class="num">p.${String(n.pg).padStart(2, "0")}</span><span class="nm">${esc(n.name)}</span><i class="dots"></i><span class="ct">${CATS[n.cat][0]}</span><p>${esc(n.blurb)}</p>`; r.onclick = () => open(n); n.row = r; s.append(r) }); ix.append(s) });
    N.forEach(n => {
        const e = document.createElement("button"); e.className = "tile"; e.style.setProperty("--c", CATS[n.cat][1]); e.innerHTML = `${em(n)}<h3>${esc(n.name)}</h3><p>${esc(n.blurb)}</p><small>${CATS[n.cat][0]}${n.bonus ? " · bonus pick" : ""}</small>`; e.onclick = () => open(n);
        e.onpointermove = ev => { const r = e.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height; e.style.setProperty("--ry", (x - .5) * 14 + "deg"); e.style.setProperty("--rx", (.5 - y) * 14 + "deg"); e.style.setProperty("--gx", x * 100 + "%"); e.style.setProperty("--gy", y * 100 + "%") };
        e.onpointerleave = () => { e.style.setProperty("--rx", "0deg"); e.style.setProperty("--ry", "0deg") }; n.tile = e; gr.append(e)
    });
    const chips = $("#chips"), mk = (id, label, col) => { const b = document.createElement("button"); b.className = "chip"; b.dataset.id = id; b.innerHTML = (col ? `<i style="--c:${col}"></i>` : "") + label; b.onclick = () => { if (id === "apps") apps = !apps; else cat = cat === id ? "all" : id; upd() }; chips.append(b) };
    mk("all", "✦ All"); keys.forEach(c => mk(c, CATS[c][0], CATS[c][1])); mk("apps", "📱 Apps");

    // ---- state
    function upd() {
        N.forEach(n => { n.on = match(n) }); const V = N.filter(n => n.on); mc = V.length; V.forEach((n, r) => n.r = r);
        N.forEach(n => { n.el.classList.toggle("off", !n.on); n.row.hidden = n.tile.hidden = !n.on });
        $$("#index section").forEach(s => s.hidden = !$$(".row", s).some(r => !r.hidden));
        $$(".chip").forEach(c => c.classList.toggle("on", c.dataset.id === "apps" ? apps : c.dataset.id === cat));
        keys.forEach(c => CATS[c].lab.style.opacity = focus() ? 0 : 1);
        $("#core b").textContent = focus() ? mc : N.length;
        $("#core span").textContent = !mc ? "No stars match. Try “memory” or “bias”." : focus() ? "in orbit · click one" : "doors to curious corners of the internet";
    }
    $("#q").oninput = e => { q = e.target.value.trim().toLowerCase(); upd() };
    $$(".views button").forEach(b => b.onclick = () => { view = b.dataset.v; B.dataset.view = view; $$(".views button").forEach(x => x.classList.toggle("on", x === b)) });
    $("#rand").onclick = () => { const L = N.filter(n => n.on), n = L[Math.floor(R() * L.length)]; if (!n) return; if (view === "galaxy") { n.el.classList.add("pulse"); setTimeout(() => { n.el.classList.remove("pulse"); open(n) }, 700) } else open(n) };
    const setTheme = x => { document.documentElement.dataset.theme = x; try { localStorage.theme = x } catch (e) { } starCol = x === "light" ? "#4458d6" : "#cfe0ff"; $("#theme").textContent = x === "dark" ? "☾" : "☀" };
    $("#theme").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    setTheme(document.documentElement.dataset.theme || "dark");
    addEventListener("keydown", e => { if (e.key === "/" && document.activeElement.id !== "q") { e.preventDefault(); $("#q").focus() } if (e.key === "Escape") close() });
    main.addEventListener("pointermove", e => { M.x = e.clientX - mainRect.left; M.y = e.clientY - mainRect.top }, { passive: true });
    main.addEventListener("pointerleave", () => { M.x = M.y = -999 });

    // ---- card + launch
    function open(n) {
        holo.style.setProperty("--c", CATS[n.cat][1]); const host = new URL(n.url).hostname.replace(/^www\./, "");
        holo.innerHTML = `<button class="x" aria-label="Close">✕</button><div class="hd">${em(n, "big")}<div><small class="tg">${CATS[n.cat][0]} · ${n.play ? "ANDROID APP" : "WEB"}</small><h2>${esc(n.name)}</h2></div></div><p class="bl">${esc(n.blurb)}</p><div class="tags">${n.tags.split(", ").map(x => `<span>${esc(x)}</span>`).join("")}</div><small class="src">${n.bonus ? "✚ Bonus pick" : "★ Featured in Brain Candy"} · ${esc(host)}</small><div class="acts"><a class="go" target="_blank" rel="noopener noreferrer" href="${n.url}">${n.play ? "Open on Play Store" : "Launch"} ↗</a>${n.app ? `<a class="go alt" target="_blank" rel="noopener noreferrer" href="${n.app}">Android app</a>` : ""}</div>`;
        card.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => { card.classList.add("in"); $(".go", holo).focus() }));
    }
    function close() { card.classList.remove("in"); setTimeout(() => { if (!card.classList.contains("in")) card.hidden = true }, 300) }
    card.onclick = e => { if (e.target === card || e.target.closest(".x")) close() };
    holo.addEventListener("click", e => {
        const a = e.target.closest(".go"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); close(); B.classList.add("warp");
        setTimeout(() => { const w = window.open(a.href, "_blank"); if (w) w.opener = null; else location.href = a.href; B.classList.remove("warp") }, reduce ? 0 : 750)
    });

    // ---- layout + physics
    function size(w, h) {
        mainRect = main.getBoundingClientRect();
        W = w || mainRect.width || 1;
        H = h || mainRect.height || 1;
        const d = devicePixelRatio || 1; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
        const sm = W < 760, sp = Math.min(46, Math.max(30, Math.min(W, H) * .06)); OS = Math.max(36, Math.min(58, sp * 1.2)); gal.style.setProperty("--s", OS + "px"); Rr = Math.min(W, H) * .3;
        keys.forEach((c, ci) => {
            const C = CATS[c], p = C[2];
            if (sm) { p[0] = W * (ci % 2 ? .74 : .26); p[1] = H * (.16 + .34 * (ci >> 1)) } else { const a = ci / keys.length * 6.2832 - 1.5708; p[0] = W / 2 + Math.cos(a) * W * .31; p[1] = H / 2 + Math.sin(a) * H * .31 }
            C.lab.style.left = p[0] + "px"; C.lab.style.top = p[1] - sp * Math.sqrt(p[2] + .6) - OS * .8 + "px"
        });
        N.forEach(n => { const p = CATS[n.cat][2], r = sp * Math.sqrt(n.k + .6), a = n.k * 2.4 + keys.indexOf(n.cat); n.hx = p[0] + Math.cos(a) * r; n.hy = p[1] + Math.sin(a) * r });
        if (!init) { init = 1; N.forEach(n => { n.x = W / 2; n.y = H / 2 }) }
    }
    function move(ms) {
        const f = focus(), cxm = W / 2, cym = H / 2;
        for (const n of N) {
            let tx = n.hx, ty = n.hy, ts = 1, to = 1;
            if (f) {
                if (n.on) {
                    if (mc === 1) { tx = cxm; ty = cym; ts = 1.7 }
                    else { const two = mc > 10, inn = two && n.r % 2 === 0, cnt = two ? Math.ceil(mc / 2) : mc, k = two ? n.r >> 1 : n.r, rad = two ? Rr * (inn ? .62 : 1.1) : Rr * (mc < 5 ? .8 : 1), a = k / cnt * 6.2832 + (reduce ? 0 : t * (inn ? .12 : -.09)) + (inn ? 0 : .5); tx = cxm + Math.cos(a) * rad; ty = cym + Math.sin(a) * rad; ts = mc < 5 ? 1.35 : 1 }
                } else { const far = Math.hypot(W, H) * .6; tx = cxm + Math.cos(n.ph) * far; ty = cym + Math.sin(n.ph) * far; ts = .3; to = 0 }
            }
            n.ts = ts; n.to = to;
            if (ms >= n.i * 35) { n.vx = (n.vx + (tx - n.x) * .045) * .82; n.vy = (n.vy + (ty - n.y) * .045) * .82; n.x += n.vx; n.y += n.vy }
        }
        for (let i = 0; i < N.length; i++)for (let j = i + 1; j < N.length; j++) { const a = N[i], b = N[j]; if (!a.on || !b.on) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, m = OS * .9; if (d < m) { const k = (m - d) / d * .1; a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k } }
        for (const n of N) {
            const dm = Math.hypot(n.x - M.x, n.y - M.y), mag = n.on && dm < 140 ? 1 + .55 * (1 - dm / 140) ** 2 : 1;
            n.s += (n.ts * mag - n.s) * .15; n.o += (n.to - n.o) * .1;
            const fx = reduce ? 0 : Math.sin(t * .9 + n.ph) * 4, fy = reduce ? 0 : Math.cos(t * .7 + n.ph) * 4, e = n.el;
            e.style.transform = `translate3d(${(n.x + fx).toFixed(1)}px,${(n.y + fy).toFixed(1)}px,0) scale(${n.s.toFixed(3)})`;
            if (Math.abs((n._o ?? -1) - n.o) > 0.005) { n._o = n.o; e.style.opacity = n.o < 0.01 ? "0" : n.o > 0.99 ? "1" : n.o.toFixed(3) }
            const z = mag > 1.15 ? "5" : "1";
            if (n._z !== z) { n._z = z; e.style.zIndex = z }
            const lo = n.on && (dm < 75 || n.i === hov || (f && mc <= 12)) ? "1" : "0";
            if (n._lo !== lo) { n._lo = lo; e.style.setProperty("--lo", lo) }
        }
    }
    function draw() {
        cx.clearRect(0, 0, W, H);
        const px = M.x < -900 ? 0 : (M.x - W / 2) / W, py = M.y < -900 ? 0 : (M.y - H / 2) / H;
        cx.fillStyle = starCol;
        for (const s of ST) { cx.globalAlpha = .2 + .55 * Math.abs(Math.sin(t * s.z * .8 + s.a)); cx.beginPath(); cx.arc(s.x * W - px * s.z * 28, s.y * H - py * s.z * 28, s.z * 1.4, 0, 6.2832); cx.fill() }
        if (view === "galaxy") {
            cx.lineWidth = 1;
            if (!focus()) { for (const c of keys) { cx.strokeStyle = CATS[c][1]; cx.globalAlpha = .3; cx.beginPath(); for (const n of N) if (n.cat === c && n.pr) { cx.moveTo(n.pr.x, n.pr.y); cx.lineTo(n.x, n.y) } cx.stroke() } }
            else {
                cx.strokeStyle = starCol; cx.globalAlpha = .12; cx.beginPath(); cx.arc(W / 2, H / 2, Rr, 0, 6.2832); cx.stroke();
                for (const n of N) if (n.on) { cx.strokeStyle = CATS[n.cat][1]; cx.globalAlpha = .25; cx.beginPath(); cx.moveTo(W / 2, H / 2); cx.lineTo(n.x, n.y); cx.stroke() }
            }
            const h = N[hov]; if (h && h.on) { cx.strokeStyle = CATS[h.cat][1]; cx.lineWidth = 2; cx.globalAlpha = .9; cx.beginPath(); for (const n of N) if (n.on && n !== h && n.cat === h.cat) { cx.moveTo(h.x, h.y); cx.lineTo(n.x, n.y) } cx.stroke() }
        }
        cx.globalAlpha = 1;
    }
    function tick(now) { t = (now - T0) / 1000; if (view === "galaxy") move(now - T0); draw(); requestAnimationFrame(tick) }
    new ResizeObserver(entries => {
        const cr = entries[0] && entries[0].contentRect;
        if (cr && cr.width && cr.height) size(cr.width, cr.height);
        else size();
    }).observe(main);
    addEventListener("resize", () => { mainRect = main.getBoundingClientRect() }, { passive: true });
    size(); upd(); requestAnimationFrame(tick);
})();
