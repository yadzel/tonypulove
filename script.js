const button = document.getElementById("enterButton");
const hero = document.getElementById("hero");
const galleryPanel = document.getElementById("galleryPanel");
const sparklesLayer = document.getElementById("sparklesLayer");
const backHomeButton = document.getElementById("backHomeButton");

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

button.addEventListener("click", () => {
    alert("Welcome, Tonypu 🧸");

    setTimeout(() => {
        hero.classList.add("is-hidden");
        galleryPanel.classList.add("show");
        galleryPanel.setAttribute("aria-hidden", "false");
        backHomeButton.classList.add("show");
        createSparkles();

        document.querySelectorAll(".typing-text").forEach((element, index) => {
            setTimeout(() => typeText(element), index * 350);
        });
    }, 300);
});

backHomeButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    galleryPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
    sparklesLayer.innerHTML = "";
});
