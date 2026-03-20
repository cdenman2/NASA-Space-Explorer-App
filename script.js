const API_KEY = "AjvYQFb3iYJhytw727jMtAjsHGCw5cqvy3nTLyRS";

const facts = [
  "Saturn is less dense than water.",
  "Jupiter is so large that more than 1,300 Earths could fit inside it.",
  "Neutron stars can spin more than 600 times per second.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "Mars has the largest volcano in the solar system: Olympus Mons."
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

factEl.textContent = facts[Math.floor(Math.random() * facts.length)];

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

function isDirectVideoFile(url) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".ogg");
}

function isEmbeddablePlatform(url) {
  if (!url) return false;
  return url.includes("youtube.com/") || url.includes("youtu.be/") || url.includes("vimeo.com/");
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

  if (url.includes("vimeo.com/")) {
    const parts = url.split("/");
    const videoId = parts[parts.length - 1].split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

function isBlockedApodPage(url) {
  if (!url) return false;
  return url.includes("apod.nasa.gov/apod/");
}

function openModal(item) {
  modalDate.textContent = formatReadableDate(item.date);
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.explanation || "";
  modalMedia.innerHTML = "";

  if (item.media_type === "video") {
    if (isDirectVideoFile(item.url)) {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      modalMedia.appendChild(video);
    } else if (isEmbeddablePlatform(item.url) && !isBlockedApodPage(item.url)) {
      const iframe = document.createElement("iframe");
      iframe.src = normalizeVideoUrl(item.url);
      iframe.title = item.title;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      modalMedia.appendChild(iframe);
    } else {
      const img = document.createElement("img");
      img.src = item.thumbnail_url || "https://images-assets.nasa.gov/image/PIA01322/PIA01322~orig.jpg";
      img.alt = item.title;
      modalMedia.appendChild(img);

      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "modal-video-link";
      link.textContent = "Open Video in New Tab";
      modalMedia.appendChild(link);
    }
  } else {
    const img = document.createElement("img");
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modalMedia.innerHTML = "";
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
      <img src="${imageSrc}" alt="${item.title}">
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
    closeModal();
  }
});

setDefaultDates();
updateEndDate();
loadGallery(startDateInput.value);
