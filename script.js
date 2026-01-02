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
  const workedHours = workedMs / 1000 / 60 / 60;

  const workStart = document.getElementById("workStart").value;
  const workEnd = document.getElementById("workEnd").value;

  const [sh, sm] = workStart.split(":").map(Number);
  const [eh, em] = workEnd.split(":").map(Number);

  const officialHours =
    (eh * 60 + em - (sh * 60 + sm)) / 60;

  const overtime = workedHours - officialHours;

  document.getElementById("result").innerText =
    `Überstunden heute: ${overtime.toFixed(2)} h`;

  saveDay(overtime);
}

function updateTimer() {
  const now = new Date();
  const diff = now - startTime;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  document.getElementById("timer").innerText =
    `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function saveDay(overtime) {
  const days = JSON.parse(localStorage.getItem("days") || "[]");
  days.push({
    date: new Date().toLocaleDateString(),
    overtime: overtime
  });
  localStorage.setItem("days", JSON.stringify(days));
}
