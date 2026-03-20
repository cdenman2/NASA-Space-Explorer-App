const API_KEY = "DEMO_KEY"; // replace with yours

const facts = [
  "Saturn could float in water.",
  "Jupiter has over 90 moons.",
  "Neutron stars spin 600 times per second.",
  "Black holes bend time.",
  "Mars has the tallest volcano."
];

document.getElementById("fact").innerText =
  facts[Math.floor(Math.random() * facts.length)];

async function loadGallery() {
  const start = document.getElementById("startDate").value;

  if (!start) return alert("Pick a date");

  let date = new Date(start);

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const d = date.toISOString().split("T")[0];

    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${d}`);
    const data = await res.json();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${data.url}">
      <p>${data.date}</p>
      <h4>${data.title}</h4>
    `;

    card.onclick = () => openModal(data);

    gallery.appendChild(card);

    date.setDate(date.getDate() + 1);
  }
}

function openModal(data) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal-img").src = data.url;
  document.getElementById("modal-title").innerText = data.title;
  document.getElementById("modal-desc").innerText = data.explanation;
  document.getElementById("modal-date").innerText = data.date;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
