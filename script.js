let startTime = null;
let interval = null;

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

renderMonth();
