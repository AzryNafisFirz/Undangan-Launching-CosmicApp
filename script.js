const cover = document.getElementById("cover");
const openButton = document.getElementById("openInvitation");
const invitationContent = document.getElementById("invitationContent");
const guestName = document.getElementById("guestName");
const music = document.getElementById("backgroundMusic");
const invitationNav = document.getElementById("invitationNav");
const navbarMusicToggle = document.getElementById("navbarMusicToggle");
const navbarMusicIcon = document.getElementById("navbarMusicIcon");
const navbarMusicLabel = document.getElementById("navbarMusicLabel");
const toast = document.getElementById("toast");

// Publishable key memang boleh digunakan di browser. Jangan pernah menaruh sb_secret_* di sini.
const SUPABASE_URL = "https://ryvqmhwsashrfqsvaicy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N_E5bYlOdEyR8ZOf0ouvrA_UMQd8DLi";

const eventDate = new Date("2026-12-31T19:00:00+07:00");

const params = new URLSearchParams(window.location.search);
const requestedGuest = params.get("to");
if (requestedGuest) {
  const guest = requestedGuest.trim();
  guestName.textContent =
    guest && !/^investor\s*lorem$/i.test(guest) && !/^lorem(?:\s|$)/i.test(guest)
      ? guest
      : "Investor / Peserta RSVP";
}

function setMusicButton(isPlaying) {
  navbarMusicToggle.classList.toggle("is-playing", isPlaying);
  navbarMusicIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  navbarMusicToggle.setAttribute("aria-label", isPlaying ? "Jeda musik" : "Putar musik");
  navbarMusicLabel.textContent = isPlaying ? "Hentikan Musik" : "Nyalakan Musik";
  navbarMusicToggle.setAttribute("title", isPlaying ? "Hentikan musik" : "Nyalakan musik");
}

openButton.addEventListener("click", () => {
  cover.classList.add("is-open");
  invitationContent.classList.add("is-visible");
  invitationContent.setAttribute("aria-hidden", "false");
  invitationNav.classList.add("is-visible");
  invitationNav.setAttribute("aria-hidden", "false");

  music.play()
    .then(() => setMusicButton(true))
    .catch(() => {
      setMusicButton(false);
      showToast("Musik gagal diputar. Coba tekan tombol musik lagi.");
    });

  window.setTimeout(() => cover.setAttribute("aria-hidden", "true"), 800);
});

navbarMusicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      setMusicButton(true);
    } catch (error) {
      showToast("Musik tidak dapat diputar");
    }
  } else {
    music.pause();
    setMusicButton(false);
  }
});

function updateCountdown() {
  const difference = eventDate.getTime() - Date.now();
  const safeDifference = Math.max(0, difference);
  document.getElementById("days").textContent = Math.floor(safeDifference / 86400000);
  document.getElementById("hours").textContent = Math.floor((safeDifference % 86400000) / 3600000);
  document.getElementById("minutes").textContent = Math.floor((safeDifference % 3600000) / 60000);
  document.getElementById("seconds").textContent = Math.floor((safeDifference % 60000) / 1000);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const invitationDescription =
  "Dengan hormat, Anda diundang menghadiri konferensi privat dan peresmian CosmicApp oleh Ornava Corporation. " +
  "Acara membahas visi produk, roadmap, perkembangan pengembangan, serta diskusi bersama moderator dan investor. " +
  "Moderator: Nafis Azzaky Erwansya, Owner & Founder, serta Naufal Abrar Erwansya, Co-Owner & Co-Founder. " +
  "Akses acara melalui Google Meet atau Discord pada tautan RSVP.";

const calendarUrl = new URL("https://calendar.google.com/calendar/render");
calendarUrl.searchParams.set("action", "TEMPLATE");
calendarUrl.searchParams.set("text", "CosmicApp Launch - Ornava Corporation");
calendarUrl.searchParams.set("dates", "20261231T190000/20261231T210000");
calendarUrl.searchParams.set("details", invitationDescription);
calendarUrl.searchParams.set("location", "AICE BSD Convention");
document.getElementById("googleCalendar").href = calendarUrl.toString();

document.getElementById("downloadIcs").addEventListener("click", () => {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const description = invitationDescription
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "PRODID:-//CosmicApp Launch - Ornava Corporation//ID", "X-WR-CALNAME:CosmicApp Launch",
    "X-WR-TIMEZONE:Asia/Jakarta", "BEGIN:VTIMEZONE", "TZID:Asia/Jakarta",
    "X-LIC-LOCATION:Asia/Jakarta", "BEGIN:STANDARD", "TZOFFSETFROM:+0700",
    "TZOFFSETTO:+0700", "TZNAME:WIB", "DTSTART:19700101T000000", "END:STANDARD",
    "END:VTIMEZONE", "BEGIN:VEVENT", "UID:cosmicapp-launch-20261231@ornava.com",
    "DTSTAMP:" + stamp, "DTSTART;TZID=Asia/Jakarta:20261231T190000",
    "DTEND;TZID=Asia/Jakarta:20261231T210000", "SUMMARY:CosmicApp Launch - Ornava Corporation",
    "DESCRIPTION:" + description, "LOCATION:AICE BSD Convention",
    "URL:https://maps.google.com/?q=AICE+BSD+Convention",
    "ORGANIZER;CN=Ornava Corporation:mailto:ornavateam@gmail.com", "STATUS:CONFIRMED",
    "TRANSP:OPAQUE", "SEQUENCE:0", "CLASS:PRIVATE", "PRIORITY:5", "END:VEVENT", "END:VCALENDAR"
  ];
  const ics = lines.map((line) => {
    if (line.length <= 75) return line;
    const chunks = [];
    let remaining = line;
    while (remaining.length > 75) {
      chunks.push(remaining.slice(0, 75));
      remaining = " " + remaining.slice(75);
    }
    if (remaining) chunks.push(remaining);
    return chunks.join("\r\n");
  }).join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cosmicapp-launch-ornava-corporation.ics";
  link.click();
  URL.revokeObjectURL(url);
});

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Berhasil disalin");
    } catch (error) {
      showToast(text);
    }
  });
});

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const guestbookForm = document.getElementById("guestbookForm");
const guestbookList = document.getElementById("guestbookList");

// Tambahkan pilihan RSVP ke form yang sudah ada tanpa mengubah layout halaman.
const messageLabel = document.getElementById("guestbookMessage").previousElementSibling;
const attendanceLabel = document.createElement("label");
attendanceLabel.htmlFor = "guestbookAttendance";
attendanceLabel.textContent = "Konfirmasi Kehadiran";
const attendanceSelect = document.createElement("select");
attendanceSelect.id = "guestbookAttendance";
attendanceSelect.name = "attendance";
attendanceSelect.required = true;
[
  ["hadir", "Ya, saya akan hadir"],
  ["tidak_hadir", "Maaf, saya tidak bisa hadir"],
  ["belum_pasti", "Belum dapat memastikan"]
].forEach(([value, text]) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  attendanceSelect.append(option);
});
guestbookForm.insertBefore(attendanceLabel, messageLabel);
guestbookForm.insertBefore(attendanceSelect, messageLabel);

function renderGuestbook(entries) {
  guestbookList.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.textContent = "Belum ada ucapan. Jadilah tamu pertama!";
    guestbookList.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "guestbook-item";
    const name = document.createElement("strong");
    name.textContent = `${entry.name}${entry.company ? ` - ${entry.company}` : ""}`;
    const message = document.createElement("p");
    message.textContent = entry.message;
    item.append(name, message);
    guestbookList.append(item);
  });
}

async function loadGuestbook() {
  try {
    const entries = await supabaseRequest(
      "event_guests?select=name,company,message,created_at&order=created_at.desc&limit=30"
    );
    renderGuestbook(entries);
  } catch (error) {
    guestbookList.replaceChildren();
    const unavailable = document.createElement("p");
    unavailable.textContent = "Buku tamu belum dapat dimuat. Silakan coba beberapa saat lagi.";
    guestbookList.append(unavailable);
    console.error("Gagal memuat buku tamu:", error);
  }
}

guestbookForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!guestbookForm.reportValidity()) return;

  const submitButton = guestbookForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  const formData = new FormData(guestbookForm);
  const entry = {
    name: String(formData.get("name") || "").trim(),
    company: String(formData.get("company") || "").trim() || null,
    age: Number(formData.get("age")),
    attendance: String(formData.get("attendance")),
    message: String(formData.get("message") || "").trim()
  };

  try {
    await supabaseRequest("event_guests", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(entry)
    });
    guestbookForm.reset();
    await loadGuestbook();
    showToast("RSVP dan ucapan berhasil dikirim");

    const waText = encodeURIComponent(
      "RSVP CosmicApp Launch\nNama: " + entry.name +
      "\nPerusahaan: " + (entry.company || "-") +
      "\nKehadiran: " + entry.attendance.replaceAll("_", " ") +
      "\nUmur: " + entry.age + "\nPesan: " + entry.message
    );
    window.open("https://wa.me/6282125050890?text=" + waText, "_blank", "noopener");
  } catch (error) {
    showToast("Gagal mengirim RSVP. Pastikan SQL Supabase sudah dijalankan.");
    console.error("Gagal menyimpan RSVP:", error);
  } finally {
    submitButton.disabled = false;
  }
});

loadGuestbook();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const navLinks = [...document.querySelectorAll(".nav-links a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visibleEntry) return;
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === "#" + visibleEntry.target.id);
  });
}, { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] });

navSections.forEach((section) => navObserver.observe(section));
