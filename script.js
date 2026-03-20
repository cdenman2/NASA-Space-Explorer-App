const API_KEY = "AjvYQFb3iYJhytw727jMtAjsHGCw5cqvy3nTLyRS";

const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const form = document.getElementById("date-form");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const galleryRangeText = document.getElementById("gallery-range-text");
const factElement = document.getElementById("space-fact");

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const closeModalBtn = document.getElementById("close-modal");
const modalMedia = document.getElementById("modal-media");
const modalDate = document.getElementById("modal-date");
const modalTitle = document.getElementById("modal-title");
const modalExplanation = document.getElementById("modal-explanation");

const spaceFacts = [
  "One day on Venus is longer than one year on Venus.",
  "Neutron stars can spin more than 600 times per second.",
  "The footprints on the Moon can last for millions of years.",
  "Jupiter is so large that more than 1,300 Earths could fit inside it.",
  "Saturn is less dense than water.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "Mars has the largest volcano in the solar system: Olympus Mons.",
  "There are more stars in the observable universe than grains of sand on Earth.",
  "A neutron star is so dense that a tiny amount would weigh billions of tons on Earth.",
  "Mercury has almost no atmosphere, so temperatures change drastically."
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factElement.textContent = spaceFacts[randomIndex];
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createLocalDate(dateString) {
  const parts = dateString.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function addDays(dateString, daysToAdd) {
  const date = createLocalDate(dateString);
  date.setDate(date.getDate() + daysToAdd);
  return formatDateForInput(date);
}

function subtractDays(dateString, daysToSubtract) {
  const date = createLocalDate(dateString);
  date.setDate(date.getDate() - daysToSubtract);
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

function getYesterdayString() {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  return formatDateForInput(today);
}

function setDefaultDates() {
  const yesterday = getYesterdayString();
  const safeStart = subtractDays(yesterday, 12);

  startDateInput.min = "1995-06-16";
  startDateInput.max = yesterday;
  startDateInput.value = safeStart;
  endDateInput.value = addDays(safeStart, 8);
}

function updateEndDateFromStart() {
  if (!startDateInput.value) {
    return;
  }

  endDateInput.value = addDays(startDateInput.value, 8);
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function clearGallery() {
  gallery.innerHTML = "";
}

function getGalleryImage(item) {
  if (item.media_type === "video") {
    return item.thumbnail_url || "";
  }
  return item.url || "";
}

function createGalleryCard(item) {
  const card = document.createElement("article");
  card.className = "gallery-card card";
  card.tabIndex = 0;

  const imageSrc = getGalleryImage(item);
  const videoBadge = item.media_type === "video" ? '<span class="video-badge">VIDEO</span>' : "";

  card.innerHTML = `
    <div class="gallery-image-wrap">
      <img class="gallery-image" src="${imageSrc}" alt="${item.title}">
      ${videoBadge}
    </div>
    <div class="gallery-info">
      <p class="gallery-date">${formatReadableDate(item.date)}</p>
      <h3 class="gallery-title">${item.title}</h3>
    </div>
  `;

  card.addEventListener("click", function () {
    openModal(item);
  });

  card.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(item);
    }
  });

  return card;
}

function renderGallery(items) {
  clearGallery();

  for (let i = 0; i < items.length; i++) {
    gallery.appendChild(createGalleryCard(items[i]));
  }

  galleryRangeText.textContent =
    formatReadableDate(items[0].date) + " through " + formatReadableDate(items[items.length - 1].date);
}

function normalizeVideoUrl(url) {
  if (!url) {
    return "";
  }

  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return "https://www.youtube.com/embed/" + videoId;
  }

  return url;
}

function openModal(item) {
  modalMedia.innerHTML = "";

  if (item.media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = normalizeVideoUrl(item.url);
    iframe.title = item.title;
    iframe.allowFullscreen = true;
    modalMedia.appendChild(iframe);
  } else {
    const img = document.createElement("img");
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  }

  modalDate.textContent = formatReadableDate(item.date);
  modalTitle.textContent = item.title;
  modalExplanation.textContent = item.explanation || "No explanation available.";

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  modalMedia.innerHTML = "";
  document.body.style.overflow = "";
}

async function fetchApodRange(startDate, endDate) {
  const url =
    "https://api.nasa.gov/planetary/apod?api_key=" +
    API_KEY +
    "&start_date=" +
    startDate +
    "&end_date=" +
    endDate +
    "&thumbs=true";

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message = data.msg || "NASA API error.";
    throw new Error(message);
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

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];

      if (!usedDates.has(item.date)) {
        usedDates.add(item.date);
        collected.push(item);
      }

      if (collected.length === 9) {
        break;
      }
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
  clearGallery();

  try {
    const items = await fetchNineEntries(startDate);
    renderGallery(items);
    endDateInput.value = items[8].date;
  } catch (error) {
    showError(error.message);
    galleryRangeText.textContent = "Gallery could not be loaded.";
  } finally {
    hideLoading();
  }
}

startDateInput.addEventListener("change", updateEndDateFromStart);

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const startDate = startDateInput.value;
  const yesterday = getYesterdayString();

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

function initializeApp() {
  showRandomFact();
  setDefaultDates();
  updateEndDateFromStart();
  loadGallery(startDateInput.value);
}

initializeApp();
