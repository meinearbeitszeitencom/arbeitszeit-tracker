let startTime = null;
let timerInterval = null;

function startWork() {
  startTime = new Date();
  localStorage.setItem("startTime", startTime);
  timerInterval = setInterval(updateTimer, 1000);
}

function stopWork() {
  clearInterval(timerInterval);
  const endTime = new Date();
  const start = new Date(localStorage.getItem("startTime"));

  const workedMs = endTime - start;
  const workedHours = workedMs / 1000 / 60 / 60;

  const workStart = document.getElementById("workStart").value;
  const workEnd = document.getElementById("workEnd").value;

  const [sh, sm] = workStart.split(":");
  const [eh, em] = workEnd.split(":");

  const officialHours =
    (eh * 60 + Number(em) - (sh * 60 + Number(sm))) / 60;

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
    `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function saveDay(overtime) {
  const data = JSON.parse(localStorage.getItem("days") || "[]");
  data.push({
    date: new Date().toLocaleDateString(),
    overtime: overtime,
  });
  localStorage.setItem("days", JSON.stringify(data));
}
