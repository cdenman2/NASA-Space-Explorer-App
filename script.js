const API_KEY = "AjvYQFb3iYJhytw727jMtAjsHGCw5cqvy3nTLyRS";

const facts = [
  "Saturn is less dense than water.",
  "Jupiter is so large that more than 1,300 Earths could fit inside it.",
  "Neutron stars can spin more than 600 times per second.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "Mars has the largest volcano in the solar system: Olympus Mons.",
  "A day on Venus is longer than a year on Venus.",
  "The footprints on the Moon can last millions of years.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The Sun accounts for about 99.86% of the mass in our solar system.",
  "One million Earths could fit inside the Sun.",
  "Black holes can stretch objects into spaghetti-like shapes, called spaghettification.",
  "The Milky Way galaxy is about 100,000 light-years wide.",
  "A light-year is the distance light travels in one year—about 5.88 trillion miles.",
  "Pluto is smaller than the United States.",
  "The International Space Station is visible from Earth with the naked eye.",
  "Mercury has no atmosphere to retain heat, so temperatures vary drastically.",
  "Jupiter has the shortest day of all planets—just under 10 hours.",
  "The largest canyon in the solar system is on Mars (Valles Marineris).",
  "Uranus rotates on its side compared to other planets.",
  "Neptune has the fastest winds in the solar system—over 1,200 mph.",
  "A teaspoon of neutron star material would weigh about a billion tons.",
  "The Moon is slowly drifting away from Earth each year.",
  "Space is completely silent because there is no air to carry sound.",
  "The Hubble Space Telescope has taken over a million images of space.",
  "Astronauts grow taller in space due to reduced gravity on their spine.",
  "The Sun will eventually become a red giant and expand.",
  "Mars has two small moons: Phobos and Deimos.",
  "The Great Red Spot on Jupiter is a storm that has lasted over 300 years.",
  "The coldest place in the universe found so far is the Boomerang Nebula.",
  "Some stars explode as supernovae and briefly outshine entire galaxies.",
  "Our galaxy, the Milky Way, is on a collision course with the Andromeda galaxy.",
  "There may be billions of Earth-like planets in our galaxy alone.",
  "The first human in space was Yuri Gagarin in 1961.",
  "The first person to walk on the Moon was Neil Armstrong in 1969.",
  "Spacecraft have visited every planet in our solar system.",
  "The Sun's surface temperature is about 10,000°F (5,500°C).",
  "Dark matter makes up most of the universe, but we cannot see it directly.",
  "A comet’s tail always points away from the Sun.",
  "Some planets outside our solar system are called exoplanets.",
  "The largest known star, UY Scuti, is over 1,700 times bigger than the Sun."
];

const factEl = document.getElementById("fact");
const form = document.getElementById("date-form");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const rangeText = document.getElementById("rangeText");

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModal");
const modalDate = document.getElementById("modalDate");
const modalTitle = document.getElementById("modalTitle");
const modalMedia = document.getElementById("modalMedia");
const modalDesc = document.getElementById("modalDesc");

function getRandomFact(currentFact) {
  let newFact;
  do {
    newFact = facts[Math.floor(Math.random() * facts.length)];
  } while (newFact === currentFact);
  return newFact;
}

let currentFact = facts[Math.floor(Math.random() * facts.length)];
factEl.textContent = currentFact;

setInterval(function () {
  currentFact = getRandomFact(currentFact);
  factEl.textContent = currentFact;
}, 5000);

function speakText(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  const voices = window.speechSynthesis.getVoices();

  const femaleVoice =
    voices.find(v => v.name.includes("Female")) ||
    voices.find(v => v.name.includes("Google US English")) ||
    voices.find(v => v.name.includes("Samantha")) ||
    voices.find(v => v.name.includes("Zira")) ||
    voices.find(v => v.lang === "en-US");

  if (femaleVoice) {
    speech.voice = femaleVoice;
  }

  speech.rate = 0.95;
  speech.pitch = 1.2;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

window.speechSynthesis.onvoiceschanged = () => {};

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateString, days) {
  const date = createLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
}

function formatReadableDate(dateString) {
  const date = createLocalDate(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateForInput(d);
}

function setDefaultDates() {
  const yesterday = getYesterday();
  const start = addDays(yesterday, -8);
  startDateInput.min = "1995-06-16";
  startDateInput.max = yesterday;
  startDateInput.value = start;
  endDateInput.value = yesterday;
}

function updateEndDate() {
  if (!startDateInput.value) return;
  endDateInput.value = addDays(startDateInput.value, 8);
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function normalizeVideoUrl(url) {
  if (!url) return "";

  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com/video/")) {
    const parts = url.split("/");
    const videoId = parts[parts.length - 1].split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

function isDirectVideoFile(url) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v")
  );
}

function isYouTubeOrVimeo(url) {
  if (!url) return false;

  return (
    url.includes("youtube.com/") ||
    url.includes("youtu.be/") ||
    url.includes("vimeo.com/") ||
    url.includes("player.vimeo.com/")
  );
}

function clearModalMedia() {
  modalMedia.innerHTML = "";
}

function buildFallbackVideoContent(item) {
  const previewImg = document.createElement("img");
  previewImg.src =
    item.thumbnail_url ||
    "https://images-assets.nasa.gov/image/PIA01322/PIA01322~orig.jpg";
  previewImg.alt = item.title;
  modalMedia.appendChild(previewImg);

  const note = document.createElement("p");
  note.className = "video-fallback-note";
  note.textContent =
    "This video source blocks in-app embedding, so it cannot play inside the modal. Use the button below to open it directly.";
  modalMedia.appendChild(note);

  const fallbackLink = document.createElement("a");
  fallbackLink.href = item.url;
  fallbackLink.target = "_blank";
  fallbackLink.rel = "noopener noreferrer";
  fallbackLink.className = "modal-video-link";
  fallbackLink.textContent = "Open Video";
  modalMedia.appendChild(fallbackLink);
}

function openModal(item) {
  modalDate.textContent = formatReadableDate(item.date);
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.explanation || "";
  speakText(item.explanation || "");
  clearModalMedia();

  if (item.media_type === "video") {
    if (isDirectVideoFile(item.url)) {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.autoplay = true;
      video.muted = false;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("preload", "metadata");

      if (item.thumbnail_url) {
        video.poster = item.thumbnail_url;
      }

      video.addEventListener("error", function () {
        clearModalMedia();
        buildFallbackVideoContent(item);
      });

      modalMedia.appendChild(video);
    } else if (isYouTubeOrVimeo(item.url)) {
      const iframe = document.createElement("iframe");
      iframe.src = normalizeVideoUrl(item.url);
      iframe.title = item.title;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";

      modalMedia.appendChild(iframe);
    } else {
      buildFallbackVideoContent(item);
    }
  } else {
    const img = document.createElement("img");
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    img.loading = "lazy";
    modalMedia.appendChild(img);
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  modal.classList.add("hidden");
  clearModalMedia();
  document.body.style.overflow = "";
}

function getCardMediaSource(item) {
  if (item.media_type === "video") {
    return item.thumbnail_url || "https://images-assets.nasa.gov/image/PIA01322/PIA01322~orig.jpg";
  }
  return item.url || "";
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const imageSrc = getCardMediaSource(item);

  card.innerHTML = `
    <div class="card-image-wrap">
      <img src="${imageSrc}" alt="${item.title}" loading="lazy">
      ${item.media_type === "video" ? '<span class="video-badge">VIDEO</span>' : ""}
    </div>
    <div class="card-body">
      <p class="card-date">${formatReadableDate(item.date)}</p>
      <h3 class="card-title">${item.title}</h3>
    </div>
  `;

  card.addEventListener("click", function () {
    openModal(item);
  });

  return card;
}

async function fetchApodRange(startDate, endDate) {
  const url =
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "NASA API error.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Unexpected NASA API response.");
  }

  data.sort(function (a, b) {
    return createLocalDate(a.date) - createLocalDate(b.date);
  });

  return data;
}

async function fetchNineEntries(startDate) {
  const collected = [];
  const usedDates = new Set();
  let searchStart = startDate;
  let attempts = 0;

  while (collected.length < 9 && attempts < 10) {
    const searchEnd = addDays(searchStart, 15);
    const batch = await fetchApodRange(searchStart, searchEnd);

    for (const item of batch) {
      if (!usedDates.has(item.date)) {
        usedDates.add(item.date);
        collected.push(item);
      }
      if (collected.length === 9) break;
    }

    searchStart = addDays(searchEnd, 1);
    attempts++;
  }

  if (collected.length < 9) {
    throw new Error("Unable to load 9 APOD entries.");
  }

  return collected.slice(0, 9);
}

async function loadGallery(startDate) {
  showLoading();
  hideError();
  gallery.innerHTML = "";

  try {
    const items = await fetchNineEntries(startDate);

    items.forEach(function (item) {
      gallery.appendChild(createCard(item));
    });

    endDateInput.value = items[8].date;
    rangeText.textContent =
      `${formatReadableDate(items[0].date)} through ${formatReadableDate(items[8].date)}`;
  } catch (error) {
    showError(error.message);
    rangeText.textContent = "Gallery could not be loaded.";
  } finally {
    hideLoading();
  }
}

startDateInput.addEventListener("change", async function () {
  updateEndDate();

  const startDate = startDateInput.value;
  const yesterday = getYesterday();

  if (!startDate) return;
  if (startDate < "1995-06-16") return;
  if (startDate > yesterday) return;

  await loadGallery(startDate);
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const startDate = startDateInput.value;
  const yesterday = getYesterday();

  if (!startDate) {
    showError("Please choose a start date.");
    return;
  }

  if (startDate < "1995-06-16") {
    showError("Start date cannot be before 1995-06-16.");
    return;
  }

  if (startDate > yesterday) {
    showError("Start date cannot be in the future.");
    return;
  }

  await loadGallery(startDate);
});

closeModalBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    closeModal();
  }
});

document.addEventListener("visibilitychange", function () {
  if (document.hidden && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});

setDefaultDates();
updateEndDate();
loadGallery(startDateInput.value);
