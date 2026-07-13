const hero = document.getElementById("hero");
const galleryPanel = document.getElementById("galleryPanel");
const openLetterButton = document.getElementById("openLetterButton");
const openCountdownButton = document.getElementById("openCountdownButton");
const sparklesLayer = document.getElementById("sparklesLayer");
const backHomeButton = document.getElementById("backHomeButton");
const nextPageButton = document.getElementById("nextPageButton");
const countdown = document.getElementById("countdown");
const countdownPanel = document.getElementById("countdownPanel");
const closeCountdownButton = document.getElementById("closeCountdownButton");

const startDate = new Date("2024-01-23T00:00:00");

function updateCountdown() {
    const now = new Date();
    const diff = now - startDate;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    countdown.textContent = `${years} años, ${months} meses, ${days} días y ${hours} horas 💖`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

function createSparkles() {
    sparklesLayer.innerHTML = "";

    for (let i = 0; i < 36; i++) {
        const sparkle = document.createElement("span");
        sparkle.className = i % 2 === 0 ? "sparkle" : "heart";
        sparkle.textContent = i % 2 === 0 ? "" : "♥";

        const x = 10 + Math.random() * 80;
        const y = 20 + Math.random() * 60;
        const delay = Math.random() * 0.25;
        const duration = 1.1 + Math.random() * 0.4;

        sparkle.style.left = `${x}%`;
        sparkle.style.top = `${y}%`;
        sparkle.style.animationDelay = `${delay}s`;
        sparkle.style.animationDuration = `${duration}s`;
        sparkle.style.transform = `scale(${0.8 + Math.random() * 0.9})`;

        sparklesLayer.appendChild(sparkle);
    }
}

function typeText(element) {
    const text = element.dataset.text || "";
    element.textContent = "";

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "|";
    element.appendChild(cursor);

    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.insertBefore(document.createTextNode(text[index]), cursor);
            index += 1;
        } else {
            clearInterval(interval);
            cursor.remove();
        }
    }, 28);
}

function showLetterPanel() {
    hero.classList.add("is-hidden");
    galleryPanel.classList.add("show");
    countdownPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "false");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.add("show");
    nextPageButton.classList.add("show");
    createSparkles();

    document.querySelectorAll(".typing-text").forEach((element, index) => {
        setTimeout(() => typeText(element), index * 350);
    });
}

function showCountdownPanel() {
    hero.classList.add("is-hidden");
    galleryPanel.classList.remove("show");
    gamePanel.classList.remove("show");
    countdownPanel.classList.add("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    gamePanel.setAttribute("aria-hidden", "true");
    countdownPanel.setAttribute("aria-hidden", "false");
    backHomeButton.classList.add("show");
    nextPageButton.classList.remove("show");
}

openLetterButton.addEventListener("click", () => {
    showLetterPanel();
});

openCountdownButton.addEventListener("click", () => {
    showCountdownPanel();
});

backHomeButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    galleryPanel.classList.remove("show");
    countdownPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
    nextPageButton.classList.remove("show");
    sparklesLayer.innerHTML = "";
});

closeCountdownButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    countdownPanel.classList.remove("show");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
});

