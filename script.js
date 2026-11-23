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

const eventDate = new Date("2026-12-31T19:00:00");

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

  window.setTimeout(() => {
    cover.setAttribute("aria-hidden", "true");
  }, 800);
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

  const days = Math.floor(safeDifference / 86400000);
  const hours = Math.floor((safeDifference % 86400000) / 3600000);
  const minutes = Math.floor((safeDifference % 3600000) / 60000);
  const seconds = Math.floor((safeDifference % 60000) / 1000);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
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
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//CosmicApp Launch - Ornava Corporation//ID",
    "X-WR-CALNAME:CosmicApp Launch",
    "X-WR-TIMEZONE:Asia/Jakarta",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Jakarta",
    "X-LIC-LOCATION:Asia/Jakarta",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0700",
    "TZOFFSETTO:+0700",
    "TZNAME:WIB",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:cosmicapp-launch-20261231@ornava.com",
    "DTSTAMP:" + stamp,
    "DTSTART;TZID=Asia/Jakarta:20261231T190000",
    "DTEND;TZID=Asia/Jakarta:20261231T210000",
    "SUMMARY:CosmicApp Launch - Ornava Corporation",
    "DESCRIPTION:" + description,
    "LOCATION:AICE BSD Convention",
    "URL:https://maps.google.com/?q=AICE+BSD+Convention",
    "ORGANIZER;CN=Ornava Corporation:mailto:ornavateam@gmail.com",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "SEQUENCE:0",
    "CLASS:PRIVATE",
    "PRIORITY:5",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const ics = lines.map((line) => {
    if (line.length <= 75) {
      return line;
    }
    const chunks = [];
    let remaining = line;
    while (remaining.length > 75) {
      chunks.push(remaining.slice(0, 75));
      remaining = " " + remaining.slice(75);
    }
    if (remaining) {
      chunks.push(remaining);
    }
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
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
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


const guestbookForm = document.getElementById("guestbookForm");
const guestbookList = document.getElementById("guestbookList");
const storageKey = "undanganGuestbook";

function getGuestbook() {
  try {
    const entries = JSON.parse(localStorage.getItem(storageKey)) || [];
    return entries.filter((entry) => {
      const name = String(entry.name || "");
      const company = String(entry.company || "");
      const message = String(entry.message || "");
      return !/^Lorem(?:\b|$)/i.test(name)
        && !/^Lorem(?:\b|$)/i.test(company)
        && !/^Lorem(?:\b|$)/i.test(message);
    });
  } catch (error) {
    return [];
  }
}

function renderGuestbook() {
  const entries = getGuestbook();
  guestbookList.replaceChildren();

  entries.slice().reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "guestbook-item";

    const name = document.createElement("strong");
    const company = entry.company ? ` - ${entry.company}` : "";
    const age = entry.age ? ` - ${entry.age} tahun` : "";
    name.textContent = `${entry.name}${company}${age}`;

    const message = document.createElement("p");
    message.textContent = entry.message;

    item.append(name, message);
    guestbookList.append(item);
  });
}

guestbookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(guestbookForm);
  const entry = {
    name: String(formData.get("name")).trim(),
    company: String(formData.get("company") || "").trim(),
    age: String(formData.get("age")).trim(),
    message: String(formData.get("message")).trim()
  };

  if (!entry.name || !entry.age || !entry.message) {
    return;
  }

  const entries = getGuestbook();
  entries.push(entry);
  localStorage.setItem(storageKey, JSON.stringify(entries));
  guestbookForm.reset();
  renderGuestbook();
  showToast("RSVP dan ucapan berhasil dikirim");
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

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const navLinks = [...document.querySelectorAll(".nav-links a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visibleEntry) {
    return;
  }

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === "#" + visibleEntry.target.id);
  });
}, {
  rootMargin: "-25% 0px -55% 0px",
  threshold: [0.05, 0.25, 0.5]
});

navSections.forEach((section) => navObserver.observe(section));
