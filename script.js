let startTime = null;
let interval = null;
let chart = null;

/* START */
function startWork() {
  startTime = new Date();
  localStorage.setItem("startTime", startTime.toISOString());
  interval = setInterval(updateTimer, 1000);
}

/* STOP */
function stopWork() {
  if (!startTime) return;

  clearInterval(interval);

  const end = new Date();
  const start = new Date(localStorage.getItem("startTime"));

  const totalWorkedHours = (end - start) / 3600000;

  const breakMinutes = Number(document.getElementById("breakMinutes").value) || 0;
  const netWorkedHours = totalWorkedHours - breakMinutes / 60;

  const [sh, sm] = workStart.value.split(":").map(Number);
  const [eh, em] = workEnd.value.split(":").map(Number);

  const officialHours =
    ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  const overtime = netWorkedHours - officialHours;

  result.innerHTML = `
    Ist-Zeit: ${netWorkedHours.toFixed(2)} h<br>
    Soll-Zeit: ${officialHours.toFixed(2)} h<br>
    <strong>Überstunden: ${overtime.toFixed(2)} h</strong>
  `;

  saveDay(overtime);
  renderMonth();
}

/* TIMER */
function updateTimer() {
  const diff = new Date() - startTime;
  timer.innerText =
    `${pad(diff / 3600000)}:${pad(diff / 60000 % 60)}:${pad(diff / 1000 % 60)}`;
}

function pad(n) {
  return Math.floor(n).toString().padStart(2, "0");
}

/* SPEICHERN */
function saveDay(overtime) {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  days.push({ date: new Date().toISOString().slice(0, 10), overtime });
  localStorage.setItem("days", JSON.stringify(days));
}

/* MONAT */
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

/* DIAGRAMM */
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
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* EXPORT */
function exportCSV() {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  let csv = "Datum,Überstunden\n";
  days.forEach(d => csv += `${d.date},${d.overtime.toFixed(2)}\n`);
  download(csv, "arbeitszeit.csv", "text/csv");
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Arbeitszeit Übersicht", 20, 20);
  let y = 35;
  JSON.parse(localStorage.getItem("days") || "[]")
    .forEach(d => {
      doc.text(`${d.date}: ${d.overtime.toFixed(2)} h`, 20, y);
      y += 8;
    });
  doc.save("arbeitszeit.pdf");
}

function download(content, file, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = file;
  a.click();
}

/* DARK MODE */
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

/* SERVICE WORKER REGISTRIEREN */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}

renderMonth();
