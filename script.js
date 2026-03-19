const API_KEY = "YOUR_NASA_API_KEY_HERE";
// Example endpoint pattern:
// https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY&start_date=2026-03-01&end_date=2026-03-09&thumbs=true

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
  "Neutron stars can spin at more than 600 rotations per second.",
  "The footprints left on the Moon can last for millions of years.",
  "Jupiter is so large that more than 1,300 Earths could fit inside it.",
  "A spoonful of a neutron star would weigh billions of tons on Earth.",
  "Saturn would float in water because it is less dense than water.",
  "There are more stars in the observable universe than grains of sand on Earth.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Mars has the largest volcano in the solar system: Olympus Mons.",
  "Black holes do not suck everything in—objects must cross the event horizon to be trapped."
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factElement.textContent = spaceFacts[randomIndex];
}

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateString, numberOfDays) {
  const date = new Date(dateString + "T00:00:00");
  date.setDate(date.getDate() + numberOfDays);
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

  // APOD can lag slightly depending on time, so use yesterday as safer default end.
  const safeEnd = new Date(today);
  safeEnd.setDate(today.getDate() - 1);

  const safeStart = new Date(safeEnd);
  safeStart.setDate(safeEnd.getDate() - 8);

  startDateInput.value = formatDateForInput(safeStart);
  endDateInput.value = formatDateForInput(safeEnd);
}

function updateEndDateFromStart() {
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

function getMediaSource(item) {
  if (item.media_type === "video") {
    return item.thumbnail_url || "";
  }
  return item.url || item.hdurl || "";
}

function createGalleryCard(item) {
  const card = document.createElement("article");
  card.className = "gallery-card card";
  card.tabIndex = 0;

  const mediaSrc = getMediaSource(item);
  const isVideo = item.media_type === "video";

  card.innerHTML = `
    <div class="gallery-image-wrap">
      <img
        class="gallery-image"
        src="${mediaSrc}"
        alt="${item.title}"
        loading="lazy"
      />
      ${isVideo ? '<span class="video-badge">VIDEO</span>' : ""}
    </div>
    <div class="gallery-info">
      <p class="gallery-date">${formatReadableDate(item.date)}</p>
      <h3 class="gallery-title">${item.title}</h3>
    </div>
  `;

  card.addEventListener("click", () => openModal(item));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(item);
    }
  });

  return card;
}

function renderGallery(items) {
  clearGallery();

  items.forEach((item) => {
    const card = createGalleryCard(item);
    gallery.appendChild(card);
  });
}

function normalizeYoutubeUrl(url) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

function openModal(item) {
  modalMedia.innerHTML = "";

  if (item.media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = normalizeYoutubeUrl(item.url);
    iframe.title = item.title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
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
  const endpoint =
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}` +
    `&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Unable to fetch NASA APOD data. Check your API key and selected date.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected API response.");
  }

  // Sort oldest to newest so the gallery is consistent
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (data.length !== 9) {
    throw new Error(`Expected 9 APOD entries, but received ${data.length}.`);
  }

  return data;
}

async function loadGallery(startDate, endDate) {
  showLoading();
  hideError();
  clearGallery();

  try {
    const items = await fetchApodRange(startDate, endDate);
    renderGallery(items);

    galleryRangeText.textContent =
      `${formatReadableDate(startDate)} through ${formatReadableDate(endDate)}`;

  } catch (error) {
    showError(error.message);
    galleryRangeText.textContent = "Gallery could not be loaded.";
  } finally {
    hideLoading();
  }
}

startDateInput.addEventListener("change", updateEndDateFromStart);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate) {
    showError("Please select a start date.");
    return;
  }

  await loadGallery(startDate, endDate);
});

closeModalBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

function init() {
  showRandomFact();
  setDefaultDates();
  loadGallery(startDateInput.value, endDateInput.value);
}

init();
