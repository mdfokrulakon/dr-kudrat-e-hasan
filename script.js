/* ===== Single editable configuration ===== */
var CONFIG = {
  name: "Dr. A.K. Mohammad Kudrat-e-Hasan",
  appointmentPhone: "01756996666",
  email: "drrubel78@gmail.com",
  address: "Shop No. 05, Motijheel Colony Jame Mosque Complex, Pir Jangipara Mazar, Motijheel, Dhaka-1000, Bangladesh",
  // Leave null until the doctor authorises publication
  fees: { newBDT: null, followUpBDT: null, note: "" }
};

(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  document.documentElement.classList.add("js");

  /* ---------- Footer year ---------- */
  if ($("yr")) $("yr").textContent = new Date().getFullYear();

  /* ---------- Directions link ---------- */
  if ($("dir")) $("dir").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.address);

  /* ---------- Fee (hidden unless published) ---------- */
  if ($("fee")) {
    var f = CONFIG.fees, parts = [];
    if (f.newBDT) parts.push("New consultation: BDT " + f.newBDT);
    if (f.followUpBDT) parts.push("Follow-up: BDT " + f.followUpBDT);
    if (f.note) parts.push(f.note);
    if (parts.length) $("fee").textContent = parts.join(" · ");
  }

  /* ---------- Mobile menu ---------- */
  var mb = $("mbtn"), nav = $("nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var head = document.querySelector("header.top");
  if (head) {
    var onScroll = function () { head.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  document.querySelectorAll("main .card, main .journey > div").forEach(function (el) { el.classList.add("reveal"); });
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var el = en.target; el.classList.add("in"); io.unobserve(el); setTimeout(function () { el.style.transitionDelay = ""; }, 1200); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 70) + "ms"; io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Appointment form (index page only) ---------- */
  var form = $("appt");
  if (form) {
    var d = $("date"), t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    d.min = t.toISOString().slice(0, 10);

    var setErr = function (id, msg) {
      var el = $(id), er = $("e-" + id);
      er.textContent = msg;
      if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      return !msg;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("name").value.trim(), p = $("phone").value.replace(/[\s-]/g, ""), dt = $("date").value, ok = true;
      ok = setErr("name", n.length < 2 ? "Please enter the patient's name." : "") && ok;
      ok = setErr("phone", !/^(\+?880|0)?1[3-9]\d{8}$/.test(p) ? "Please enter a valid Bangladeshi mobile number, e.g. 01XXXXXXXXX." : "") && ok;
      ok = setErr("date", !dt ? "Please choose a preferred date." : (dt < d.min ? "Please choose today or a future date." : "")) && ok;
      var st = $("status");
      if (!ok) {
        st.textContent = "Please correct the highlighted fields.";
        var first = document.querySelector('[aria-invalid="true"]'); if (first) first.focus();
        return;
      }
      var body = ["Appointment request", "Patient: " + n, "Phone: " + $("phone").value.trim(),
        "Preferred date: " + dt, "Preferred time: " + $("time").value,
        "Visit type: " + ($("visit").value || "Not specified"), "Note: " + ($("note").value.trim() || "None")].join("\n");
      var href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Appointment request – " + n) + "&body=" + encodeURIComponent(body);
      st.innerHTML = 'Your request is ready. <a href="' + href + '">Open email draft to send it</a>. It has <strong>not</strong> been sent yet, and an appointment is only confirmed when the practice replies. Prefer not to use email? Call <a href="tel:' + CONFIG.appointmentPhone + '">01756-996666</a>.';
      st.focus();
      window.location.href = href;
    });
  }

  /* ---------- Heartbeat sound (Web Audio, starts only on click) ---------- */
  var BPM = 72, interval = 60000 / BPM, ctx = null, timer = null, playing = false;
  var hearts = document.querySelectorAll("svg.heart");
  var btns = document.querySelectorAll("[data-heartbeat]");

  function thump(time, freq, peak, dur) {
    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, time);
    master.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    master.connect(ctx.destination);
    // Fundamental drops in pitch like a real "thud"; an overtone keeps it audible on phone speakers
    [[freq, "sine", 1], [freq * 2.2, "triangle", 0.35]].forEach(function (o) {
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o[1];
      osc.frequency.setValueAtTime(o[0], time);
      osc.frequency.exponentialRampToValueAtTime(o[0] * 0.55, time + dur);
      g.gain.value = o[2];
      osc.connect(g); g.connect(master);
      osc.start(time); osc.stop(time + dur + 0.02);
    });
  }

  function beat() {
    var now = ctx.currentTime + 0.02;
    thump(now, 95, 0.9, 0.14);          // "lub"
    thump(now + 0.30, 80, 0.55, 0.12);  // "dub"
    hearts.forEach(function (h) {
      h.classList.remove("pulse"); void h.getBoundingClientRect(); h.classList.add("pulse");
    });
  }

  function setUi(on) {
    playing = on;
    document.documentElement.classList.toggle("synced", on);
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", on);
      b.innerHTML = on ? "&#9724; Stop heartbeat" : "&#9835; Hear a heartbeat";
    });
  }

  function start() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    setUi(true); beat();
    timer = setInterval(beat, interval);
  }
  function stop() { clearInterval(timer); timer = null; setUi(false); }

  btns.forEach(function (b) { b.addEventListener("click", function () { playing ? stop() : start(); }); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && playing) stop(); });
})();
