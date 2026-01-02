let startTime = null;
let interval = null;
let chart = null;

const isPremium = localStorage.getItem("premium") === "true";

/* Arbeitszeit */
function startWork() {
  startTime = new Date();
  localStorage.setItem("startTime", startTime.toISOString());
  interval = setInterval(updateTimer, 1000);
}

function stopWork() {
  if (!startTime) return;

  clearInterval(interval);

  const end = new Date();
  const start = new Date(localStorage.getItem("startTime"));
  const workedHours = (end - start) / 3600000;

  const [sh, sm] = workStart.value.split(":").map(Number);
  const [eh, em] = workEnd.value.split(":").map(Number);
  const official = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  const overtime = workedHours - official;
  result.innerText = `Überstunden heute: ${overtime.toFixed(2)} h`;

  saveDay(overtime);
  renderMonth();
}

function updateTimer() {
  const diff = new Date() - startTime;
  timer.innerText =
    `${pad(diff / 3600000)}:${pad(diff / 60000 % 60)}:${pad(diff / 1000 % 60)}`;
}

function pad(n) {
  return Math.floor(n).toString().padStart(2, "0");
}

/* Daten */
function saveDay(overtime) {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  days.push({ date: new Date().toISOString().slice(0, 10), overtime });
  localStorage.setItem("days", JSON.stringify(days));
}

function renderMonth() {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  monthTable.innerHTML = "";
  let sum = 0;

  days.forEach(d => {
    sum += d.overtime;
    monthTable.innerHTML += `
      <tr>
        <td>${d.date}</td>
        <td>${d.overtime.toFixed(2)} h</td>
      </tr>`;
  });

  monthSum.innerText = `Überstunden gesamt: ${sum.toFixed(2)} h`;
  renderChart(days);
}

/* Diagramm */
function renderChart(days) {
  const ctx = document.getElementById("overtimeChart");
  if (!ctx) return;
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days.map(d => d.date),
      datasets: [{
        data: days.map(d => d.overtime),
        backgroundColor: "#2563eb"
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

/* Export */
function exportCSV() {
  if (!isPremium) return alert("Premium-Funktion");
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  let csv = "Datum,Überstunden\n";
  days.forEach(d => csv += `${d.date},${d.overtime.toFixed(2)}\n`);
  download(csv, "arbeitszeit.csv", "text/csv");
}

function exportPDF() {
  if (!isPremium) return alert("Premium-Funktion");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Arbeitszeit Übersicht", 20, 20);
  let y = 35;
  JSON.parse(localStorage.getItem("days") || "[]")
    .forEach(d => { doc.text(`${d.date}: ${d.overtime.toFixed(2)} h`, 20, y); y += 8; });
  doc.save("arbeitszeit.pdf");
}

function download(content, file, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = file;
  a.click();
}

/* Premium / Stripe Platzhalter */
function goPremium() {
  alert("Stripe-Integration folgt – Premium ist vorbereitet.");
}

/* Dark Mode */
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}
if (localStorage.getItem("dark") === "true") document.body.classList.add("dark");

/* PWA */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

renderMonth();
