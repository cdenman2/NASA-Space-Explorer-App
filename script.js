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

setInterval(() => {
  currentFact = getRandomFact(currentFact);
  factEl.textContent = currentFact;
}, 5000);

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function createLocalDate(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
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

async function fetchApodRange(startDate, endDate) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  const response = await fetch(url);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("NASA API returned invalid data. Try a different date.");
  }

  if (!response.ok) {
    throw new Error(data.msg || "NASA API error.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Unexpected NASA API response.");
  }

  data.sort((a, b) => createLocalDate(a.date) - createLocalDate(b.date));
  return data;
}

async function fetchNineEntries(startDate) {
  const endDate = addDays(startDate, 8);
  return await fetchApodRange(startDate, endDate);
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <div class="card-image-wrap">
      <img src="${item.url}" alt="${item.title}">
    </div>
    <div class="card-body">
      <p class="card-date">${formatReadableDate(item.date)}</p>
      <h3 class="card-title">${item.title}</h3>
    </div>
  `;

  return card;
}

async function loadGallery(startDate) {
  showLoading();
  hideError();
  gallery.innerHTML = "";

  try {
    const items = await fetchNineEntries(startDate);

    items.forEach(item => gallery.appendChild(createCard(item)));

    endDateInput.value = items[items.length - 1].date;
    rangeText.textContent =
      `${formatReadableDate(items[0].date)} through ${formatReadableDate(items[items.length - 1].date)}`;

  } catch (error) {
    showError(error.message);
    rangeText.textContent = "Gallery could not be loaded.";
  } finally {
    hideLoading();
  }
}

startDateInput.addEventListener("change", () => {
  updateEndDate();
  loadGallery(startDateInput.value);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadGallery(startDateInput.value);
});

setDefaultDates();
updateEndDate();
loadGallery(startDateInput.value);
