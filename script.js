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

const SUPABASE_URL = "https://ryvqmhwsashrfqsvaicy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N_E5bYlOdEyR8ZOf0ouvrA_UMQd8DLi";

const eventDate = new Date("2026-12-31T19:00:00+07:00");

const params = new URLSearchParams(window.location.search);
const requestedGuest = params.get("to");
if (requestedGuest) {
  const guest = requestedGuest.trim();
  guestName.textContent = guest && !/^investor\s*lorem$/i.test(guest) && !/^lorem(?:\s|$)/i.test(guest)
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

  music.play().then(() => setMusicButton(true)).catch(() => {
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
  const difference = Math.max(0, eventDate.getTime() - Date.now());
  document.getElementById("days").textContent = Math.floor(difference / 86400000);
  document.getElementById("hours").textContent = Math.floor((difference % 86400000) / 3600000);
  document.getElementById("minutes").textContent = Math.floor((difference % 3600000) / 60000);
  document.getElementById("seconds").textContent = Math.floor((difference % 60000) / 1000);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const invitationDescription =
  "Dengan hormat, Anda diundang menghadiri konferensi privat dan peresmian CosmicApp oleh Ornava Corporation. " +
  "Acara membahas visi produk, roadmap, perkembangan pengembangan, serta diskusi bersama moderator dan investor.";

const calendarUrl = new URL("https://calendar.google.com/calendar/render");
calendarUrl.searchParams.set("action", "TEMPLATE");
calendarUrl.searchParams.set("text", "CosmicApp Launch - Ornava Corporation");
calendarUrl.searchParams.set("dates", "20261231T190000/20261231T210000");
calendarUrl.searchParams.set("details", invitationDescription);
calendarUrl.searchParams.set("location", "AICE BSD Convention");
document.getElementById("googleCalendar").href = calendarUrl.toString();

document.getElementById("downloadIcs").addEventListener("click", () => {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:CosmicApp Launch", "X-WR-TIMEZONE:Asia/Jakarta",
    "BEGIN:VEVENT", "UID:cosmicapp-launch-20261231@ornava.com", "DTSTAMP:" + now,
    "DTSTART;TZID=Asia/Jakarta:20261231T190000", "DTEND;TZID=Asia/Jakarta:20261231T210000",
    "SUMMARY:CosmicApp Launch - Ornava Corporation", "LOCATION:AICE BSD Convention",
    "DESCRIPTION:" + invitationDescription, "END:VEVENT", "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
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
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null;
  return response.json();
}

const guestbookForm = document.getElementById("guestbookForm");
const investorForm = document.getElementById("investorForm");
const guestbookList = document.getElementById("guestbookList");

async function renderGuestbook() {
  guestbookList.replaceChildren();
  try {
    const entries = await supabaseRequest("event_guests?select=name,company,age,message,created_at&order=created_at.desc&limit=30");
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.textContent = "Belum ada ucapan. Jadilah tamu pertama!";
      guestbookList.append(empty);
      return;
    }
    entries.forEach((entry) => {
      const item = document.createElement("article");
      item.className = "guestbook-item";
      const name = document.createElement("strong");
      name.textContent = entry.name + (entry.company ? " - " + entry.company : "") + (entry.age ? " - " + entry.age + " tahun" : "");
      const message = document.createElement("p");
      message.textContent = entry.message;
      item.append(name, message);
      guestbookList.append(item);
    });
  } catch (error) {
    showToast("Tidak dapat memuat buku tamu");
  }
}

document.querySelectorAll('input[name="attendance"]').forEach((input) => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".attendance-option").forEach((label) => label.classList.remove("is-selected"));
    input.closest(".attendance-option").classList.add("is-selected");
  });
});

guestbookForm.addEventListener("submit", async (event) => {
  event.preventEvent = undefined;
  event.preventDefault();
  const submitButton = guestbookForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  const formData = new FormData(guestbookForm);
  const attendance = String(formData.get("attendance") || "belum_pasti");
  const entry = {
    name: String(formData.get("name")).trim(),
    company: String(formData.get("company") || "").trim() || null,
    age: Number(formData.get("age")),
    attendance,
    participant_type: String(formData.get("participant_type") || "tamu"),
    message: String(formData.get("message")).trim(),
    source_guest: guestName.textContent
  };

  if (!entry.name || !entry.age || !entry.message) {
    submitButton.disabled = false;
    showToast("Lengkapi data wajib");
    return;
  }

  try {
    await supabaseRequest("event_guests", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(entry)
    });
    guestbookForm.reset();
    await renderGuestbook();
    showToast("RSVP dan ucapan berhasil dikirim");
  } catch (error) {
    showToast("Gagal mengirim data. Periksa tabel dan RLS Supabase.");
  } finally {
    submitButton.disabled = false;
  }
});

investorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = investorForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  const formData = new FormData(investorForm);
  const entry = {
    name: String(formData.get("name")).trim(),
    company: String(formData.get("company") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    interest: String(formData.get("interest") || "").trim() || null,
    message: String(formData.get("message") || "").trim() || null
  };
  try {
    await supabaseRequest("investors", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(entry)
    });
    investorForm.reset();
    showToast("Permintaan investor berhasil dikirim");
  } catch (error) {
    showToast("Gagal mengirim data investor");
  } finally {
    submitButton.disabled = false;
  }
});

renderGuestbook();

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
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visibleEntry) return;
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === "#" + visibleEntry.target.id));
}, { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] });

navSections.forEach((section) => navObserver.observe(section));
