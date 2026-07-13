const hero = document.getElementById("hero");
const galleryPanel = document.getElementById("galleryPanel");
const gamePanel = document.getElementById("gamePanel");
const openLetterButton = document.getElementById("openLetterButton");
const openGameButton = document.getElementById("openGameButton");
const openCountdownButton = document.getElementById("openCountdownButton");
const sparklesLayer = document.getElementById("sparklesLayer");
const backHomeButton = document.getElementById("backHomeButton");
const nextPageButton = document.getElementById("nextPageButton");
const countdown = document.getElementById("countdown");
const mazeBoard = document.getElementById("mazeBoard");
const gameStatus = document.getElementById("gameStatus");
const backToHomeButton = document.getElementById("backToHomeButton");
const countdownPanel = document.getElementById("countdownPanel");
const closeCountdownButton = document.getElementById("closeCountdownButton");

const startDate = new Date("2024-01-23T00:00:00");
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
];
let playerPosition = { x: 1, y: 1 };
let honeyPosition = { x: 7, y: 5 };
let direction = { x: 0, y: 0 };

function updateCountdown() {
    const now = new Date();
    const diff = now - startDate;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    countdown.textContent = `${years} años, ${months} meses, ${days} días y ${hours} horas 💖`;
}

function renderMaze() {
    mazeBoard.innerHTML = "";
    for (let y = 0; y < maze.length; y += 1) {
        for (let x = 0; x < maze[y].length; x += 1) {
            const cell = document.createElement("div");
            const isWall = maze[y][x] === 1;
            const isPlayer = playerPosition.x === x && playerPosition.y === y;
            const isHoney = honeyPosition.x === x && honeyPosition.y === y;

            cell.className = "maze-cell";
            if (isWall) {
                cell.classList.add("wall");
            } else if (isPlayer) {
                cell.classList.add("teddy");
                cell.textContent = "🧸";
            } else if (isHoney) {
                cell.classList.add("honey");
                cell.textContent = "🍯";
            }

            mazeBoard.appendChild(cell);
        }
    }
}

function movePlayer(dx, dy) {
    const nextX = playerPosition.x + dx;
    const nextY = playerPosition.y + dy;

    if (nextX < 0 || nextY < 0 || nextY >= maze.length || nextX >= maze[0].length) {
        return;
    }

    if (maze[nextY][nextX] === 1) {
        return;
    }

    playerPosition = { x: nextX, y: nextY };
    if (playerPosition.x === honeyPosition.x && playerPosition.y === honeyPosition.y) {
        gameStatus.textContent = "¡Lo lograste! El osito encontró la miel 💛";
        return;
    }

    gameStatus.textContent = "Sigue así, casi estás ahí 💞";
    renderMaze();
}

function startGame() {
    playerPosition = { x: 1, y: 1 };
    honeyPosition = { x: 7, y: 5 };
    gameStatus.textContent = "Usa las flechas para moverte.";
    renderMaze();
}

window.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "ArrowUp") {
        movePlayer(0, -1);
    } else if (key === "ArrowDown") {
        movePlayer(0, 1);
    } else if (key === "ArrowLeft") {
        movePlayer(-1, 0);
    } else if (key === "ArrowRight") {
        movePlayer(1, 0);
    }
});

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);
startGame();

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
    gamePanel.classList.remove("show");
    countdownPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "false");
    gamePanel.setAttribute("aria-hidden", "true");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.add("show");
    nextPageButton.classList.add("show");
    createSparkles();

    document.querySelectorAll(".typing-text").forEach((element, index) => {
        setTimeout(() => typeText(element), index * 350);
    });
}

function showGamePanel() {
    hero.classList.add("is-hidden");
    galleryPanel.classList.remove("show");
    countdownPanel.classList.remove("show");
    gamePanel.classList.add("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    countdownPanel.setAttribute("aria-hidden", "true");
    gamePanel.setAttribute("aria-hidden", "false");
    backHomeButton.classList.add("show");
    nextPageButton.classList.remove("show");
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

openGameButton.addEventListener("click", () => {
    showGamePanel();
});

openCountdownButton.addEventListener("click", () => {
    showCountdownPanel();
});

backHomeButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    galleryPanel.classList.remove("show");
    gamePanel.classList.remove("show");
    countdownPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    gamePanel.setAttribute("aria-hidden", "true");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
    nextPageButton.classList.remove("show");
    sparklesLayer.innerHTML = "";
});

backToHomeButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    gamePanel.classList.remove("show");
    gamePanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
});

closeCountdownButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    countdownPanel.classList.remove("show");
    countdownPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
});

nextPageButton.addEventListener("click", () => {
    galleryPanel.classList.remove("show");
    gamePanel.classList.add("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    gamePanel.setAttribute("aria-hidden", "false");
    nextPageButton.classList.remove("show");
});
