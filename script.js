let startTime = null;
let interval = null;

const isPremium = localStorage.getItem("premium") === "true";

function startWork() {
  startTime = new Date();
  localStorage.setItem("startTime", startTime.toISOString());
  interval = setInterval(updateTimer, 1000);
}

function stopWork() {
  if (!startTime) return;

  clearInterval(interval);

  const endTime = new Date();
  const start = new Date(localStorage.getItem("startTime"));
  const workedMs = endTime - start;
  const workedHours = workedMs / 3600000;

  const [sh, sm] = document.getElementById("workStart").value.split(":").map(Number);
  const [eh, em] = document.getElementById("workEnd").value.split(":").map(Number);

  const officialHours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  const overtime = workedHours - officialHours;

  document.getElementById("result").innerText =
    `Überstunden heute: ${overtime.toFixed(2)} h`;

  saveDay(overtime);
  renderMonth();
}

function updateTimer() {
  const diff = new Date() - startTime;
  document.getElementById("timer").innerText =
    `${pad(diff / 3600000)}:${pad(diff / 60000 % 60)}:${pad(diff / 1000 % 60)}`;
}

function pad(n) {
  return Math.floor(n).toString().padStart(2, "0");
}

function saveDay(overtime) {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  days.push({
    date: new Date().toISOString().slice(0, 10),
    overtime
  });
  localStorage.setItem("days", JSON.stringify(days));
}

function renderMonth() {
  const tbody = document.getElementById("monthTable");
  const sumEl = document.getElementById("monthSum");
  const days = JSON.parse(localStorage.getItem("days") || "[]");

  tbody.innerHTML = "";
  let sum = 0;

  days.forEach(d => {
    sum += d.overtime;
    tbody.innerHTML += `
      <tr>
        <td>${d.date}</td>
        <td>${d.overtime.toFixed(2)} h</td>
      </tr>`;
  });

  sumEl.innerText = `Überstunden gesamt: ${sum.toFixed(2)} h`;
}

/* CSV */
function exportCSV() {
  if (!isPremium) {
    alert("CSV Export ist eine Premium-Funktion");
    return;
  }

  const days = JSON.parse(localStorage.getItem("days") || "[]");
  let csv = "Datum,Überstunden\n";

  days.forEach(d => {
    csv += `${d.date},${d.overtime.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arbeitszeit.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* PDF */
function exportPDF() {
  if (!isPremium) {
    alert("PDF Export ist eine Premium-Funktion");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Arbeitszeit Übersicht", 20, 20);

  const days = JSON.parse(localStorage.getItem("days") || "[]");
  let y = 35;

  days.forEach(d => {
    doc.text(`${d.date}: ${d.overtime.toFixed(2)} h`, 20, y);
    y += 8;
  });

  doc.save("arbeitszeit.pdf");
}

/* Dark Mode */
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

renderMonth();
