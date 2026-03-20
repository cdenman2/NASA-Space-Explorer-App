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
  return date.toISOString().split("T")[0];
}

function addDays(dateString, daysToAdd) {
  const date = new Date(dateString + "T00:00:00");
  date.setDate(date.getDate() + daysToAdd);
  return formatDateForInput(date);
}

function formatReadableDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function setDefaultDates() {
  const today = new Date();
  const safeEnd = new Date(today);
  safeEnd.setDate(today.getDate() - 1);

  const safeStart = new Date(safeEnd);
  safeStart.setDate(safeEnd.getDate() - 8);

  startDateInput.value = formatDateForInput(safeStart);
  endDateInput.value = formatDateForInput(safeEnd);
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
    const card = createGalleryCard(items[i]);
    gallery.appendChild(card);
  }
}

function normalizeVideoUrl(url) {
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
  modalExplanation.textContent = item.explanation;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modalMedia.innerHTML = "";
  document.body.style.overflow = "";
}

async function fetchApodData(startDate, endDate) {
  const url =
    "https://api.nasa.gov/planetary/apod?api_key=" +
    API_KEY +
    "&start_date=" +
    startDate +
    "&end_date=" +
    endDate +
    "&thumbs=true";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("NASA data could not be loaded. Check your API key or selected date.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected API response.");
  }

  data.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  if (data.length !== 9) {
    throw new Error("The app must load exactly 9 entries. Received: " + data.length);
  }

  return data;
}

async function loadGallery(startDate, endDate) {
  showLoading();
  hideError();
  clearGallery();

  try {
    const items = await fetchApodData(startDate, endDate);
    renderGallery(items);
    galleryRangeText.textContent =
      formatReadableDate(startDate) + " through " + formatReadableDate(endDate);
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
  const endDate = endDateInput.value;

  if (startDate === "") {
    showError("Please choose a start date.");
    return;
  }

  await loadGallery(startDate, endDate);
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
  loadGallery(startDateInput.value, endDateInput.value);
}

initializeApp();
