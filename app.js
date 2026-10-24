"use strict";

const questions = [
  "Who will change more diapers?",
  "Who will be in charge of baby naps?",
  "Who will be the more patient parent?",
  "Who will be the fun parent?",
  "Who will sing the most lullabies?",
  "Who will take more photos of baby?",
  'Who will say "no" the most?',
  "Who will teach them how to play sports?",
  "Who will ask the doctor more questions?",
  "Who will teach them how to cook?",
  "Who will put the furniture together?",
  "Who will be the disciplinarian?",
  "Who was the more difficult baby?",
  "Who was ready to have kids first?",
  "Who weighed more as a newborn?",
  "Who will buy the most baby clothes?",
  "Who will cry on the first day of school?",
  "Who will teach the baby to dance?",
];

const storageKey = "ayushi-sumeet-mommy-or-daddy-v1";
const nameInput = document.querySelector("#player-name");
const scoreInput = document.querySelector("#score");
const game = document.querySelector("#game");
const progress = document.querySelector("#progress");
const downloadButton = document.querySelector("#download");
const downloadStatus = document.querySelector("#download-status");
const resetDialog = document.querySelector("#reset-dialog");
const cardElement = document.querySelector(".card");
let downloadUrl;

questions.forEach((question, index) => {
  const row = document.createElement("div");
  row.className = "question";
  row.style.setProperty("--row-top", `${(353.3898 + index * 21) / 841.8898 * 100}%`);
  row.setAttribute("role", "radiogroup");
  row.setAttribute("aria-labelledby", `question-${index}`);

  const number = document.createElement("span");
  number.className = "question-number";
  number.textContent = String(index + 1).padStart(2, "0");
  number.setAttribute("aria-hidden", "true");

  const text = document.createElement("p");
  text.className = "question-text";
  text.id = `question-${index}`;
  text.textContent = question;
  row.append(number, text);

  ["mom", "dad"].forEach((parent) => {
    const label = document.createElement("label");
    label.className = "choice";
    label.title = parent === "mom" ? "Mom" : "Dad";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `answer-${index}`;
    radio.value = parent;
    radio.setAttribute("aria-labelledby", `question-${index} ${parent}-heading`);
    label.append(radio);
    row.append(label);
  });
  document.querySelector("#questions").append(row);
});

function currentCard() {
  return {
    name: nameInput.value,
    score: scoreInput.value,
    answers: questions.map((_, index) => game.querySelector(`input[name="answer-${index}"]:checked`)?.value ?? null),
  };
}

function updateCard() {
  const card = currentCard();
  const count = card.answers.filter(Boolean).length;
  progress.textContent = count === questions.length ? "18 of 18 answered · Your card is complete!" : `${count} of 18 answered`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(card));
  } catch {
    // Playing and downloading also work when browser storage is unavailable.
  }
  downloadStatus.replaceChildren();
  if (downloadUrl) {
    URL.revokeObjectURL(downloadUrl);
    downloadUrl = undefined;
  }
}

function restoreCard() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || typeof saved !== "object") return;
    if (typeof saved.name === "string") nameInput.value = saved.name.slice(0, 80);
    if (typeof saved.score === "string" && /^(?:[0-9]|1[0-8])?$/.test(saved.score)) scoreInput.value = saved.score;
    if (Array.isArray(saved.answers)) {
      saved.answers.slice(0, questions.length).forEach((answer, index) => {
        if (answer === "mom" || answer === "dad") game.querySelector(`input[name="answer-${index}"][value="${answer}"]`).checked = true;
      });
    }
  } catch {
    // A fresh card remains usable if saved data is missing or damaged.
  }
}

game.addEventListener("submit", (event) => event.preventDefault());
game.addEventListener("input", () => {
  const scoreDigits = scoreInput.value.replace(/[^0-9]/g, "").slice(0, 2);
  scoreInput.value = scoreDigits ? String(Math.min(18, Number(scoreDigits))) : "";
  updateCard();
});

document.querySelector("#reset").addEventListener("click", () => {
  resetDialog.returnValue = "";
  resetDialog.showModal();
});
resetDialog.addEventListener("close", () => {
  if (resetDialog.returnValue !== "reset") return;
  game.reset();
  updateCard();
  nameInput.focus();
});

const template = new Image();
template.src = "assets/card-template.png";

async function createDownload(card) {
  await template.decode();
  const canvas = document.createElement("canvas");
  canvas.width = template.naturalWidth;
  canvas.height = template.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image saving is unavailable in this browser.");
  context.drawImage(template, 0, 0);
  // Coordinates are taken from the supplied A4 PDF, in points.
  context.scale(canvas.width / 595.2756, canvas.height / 841.8898);
  context.fillStyle = "#553b2d";
  let fontSize = 11.5;
  context.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
  while (context.measureText(card.name).width > 225 && fontSize > 5) {
    fontSize -= 0.25;
    context.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
  }
  context.fillText(card.name, 116, 339.5, 225);
  context.font = "12px Georgia, 'Times New Roman', serif";
  context.textAlign = "center";
  context.fillText(card.score, 295, 750.5);

  card.answers.forEach((answer, index) => {
    if (!answer) return;
    const x = answer === "mom" ? 440 : 506;
    const y = 363.8898 + index * 21;
    context.fillStyle = "#a95732";
    context.beginPath();
    context.arc(x, y, 4.25, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff9ef";
    context.beginPath();
    context.arc(x, y, 3.1, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#a95732";
    context.beginPath();
    context.arc(x, y, 2.25, 0, Math.PI * 2);
    context.fill();
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Your card could not be saved.")), "image/png");
  });
}

downloadButton.addEventListener("click", async () => {
  const card = currentCard();
  downloadButton.disabled = true;
  downloadButton.querySelector("span").textContent = "Preparing your card…";
  downloadStatus.textContent = "";
  try {
    const blob = await createDownload(card);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(blob);
    const safeName = card.name.trim().replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, "-").slice(0, 60);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${safeName ? safeName + "-" : ""}mommy-or-daddy.png`;
    link.textContent = "Open your card";
    link.target = "_blank";
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    // Keep a manual link available for mobile browsers that preview downloads.
    const preview = document.createElement("a");
    preview.href = downloadUrl;
    preview.textContent = "open it here";
    preview.target = "_blank";
    preview.rel = "noopener";
    downloadStatus.replaceChildren("Your card is ready. If it didn't save, ", preview, " and save the image.");
  } catch {
    downloadStatus.textContent = "Your card couldn't download. Please try again; your answers are still here.";
  } finally {
    downloadButton.disabled = false;
    downloadButton.querySelector("span").textContent = "Download my card";
  }
});

restoreCard();
updateCard();

function setLayout(original) {
  cardElement.classList.toggle("exact", original);
  document.querySelector("#original-view").setAttribute("aria-pressed", String(original));
  document.querySelector("#reading-view").setAttribute("aria-pressed", String(!original));
}

document.querySelector("#original-view").addEventListener("click", () => setLayout(true));
document.querySelector("#reading-view").addEventListener("click", () => setLayout(false));
