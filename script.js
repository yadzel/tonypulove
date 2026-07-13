const hero = document.getElementById("hero");
const galleryPanel = document.getElementById("galleryPanel");
const calendarPanel = document.getElementById("calendarPanel");
const openLetterButton = document.getElementById("openLetterButton");
const openCalendarButton = document.getElementById("openCalendarButton");
const sparklesLayer = document.getElementById("sparklesLayer");
const backHomeButton = document.getElementById("backHomeButton");
const nextPageButton = document.getElementById("nextPageButton");
const calendarGrid = document.getElementById("calendarGrid");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const noteInput = document.getElementById("noteInput");
const saveNoteButton = document.getElementById("saveNoteButton");
const savedNote = document.getElementById("savedNote");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const monthLabel = document.getElementById("monthLabel");
const filterEntriesButton = document.getElementById("filterEntriesButton");

const STORAGE_KEY = "tonypu-memories";
const today = new Date();
const todayDay = today.getDate();
const todayMonth = today.getMonth();
const todayYear = today.getFullYear();

let currentViewDate = new Date(todayYear, todayMonth, 1);
let selectedDate = new Date(todayYear, todayMonth, todayDay);
let showOnlyWithEntries = false;
let memoriesLoaded = false;
const notesByDay = {};
const photosByDay = {};

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function loadStoredData() {
    if (memoriesLoaded) return;

    try {
        const response = await fetch("/api/memories", { cache: "no-store" });
        if (response.ok) {
            const parsed = await response.json();
            if (parsed.notes) {
                Object.entries(parsed.notes).forEach(([key, value]) => {
                    if (typeof value === "string" && key) {
                        notesByDay[key] = value;
                    }
                });
            }
            if (parsed.photos) {
                Object.entries(parsed.photos).forEach(([key, value]) => {
                    if (typeof value === "string" && key) {
                        photosByDay[key] = value;
                    }
                });
            }
            memoriesLoaded = true;
            return;
        }
    } catch (error) {
        console.warn("No se pudieron cargar los recuerdos del servidor.", error);
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (parsed.notes) {
            Object.entries(parsed.notes).forEach(([key, value]) => {
                if (typeof value === "string" && key) {
                    notesByDay[key] = value;
                }
            });
        }
        if (parsed.photos) {
            Object.entries(parsed.photos).forEach(([key, value]) => {
                if (typeof value === "string" && key) {
                    photosByDay[key] = value;
                }
            });
        }
    } catch (error) {
        console.warn("No se pudieron cargar los recuerdos locales.", error);
    }

    memoriesLoaded = true;
}

async function saveStoredData() {
    const payload = {
        notes: notesByDay,
        photos: photosByDay
    };

    try {
        await fetch("/api/memories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("No se pudieron sincronizar los recuerdos con el servidor.", error);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn("No se pudieron guardar los recuerdos localmente.", error);
    }
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatSelectedDate(date) {
    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function hasEntryForDate(date) {
    const key = getDateKey(date);
    return Boolean(notesByDay[key] || photosByDay[key]);
}

function updateDetails(date) {
    selectedDate = date;
    const key = getDateKey(date);
    const formattedDate = formatSelectedDate(date);
    const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

    selectedDateLabel.textContent = isToday
        ? `Hoy · ${capitalize(formattedDate)}`
        : `Día seleccionado: ${date.getDate()} · ${capitalize(formattedDate)}`;

    noteInput.value = notesByDay[key] || "";
    savedNote.textContent = notesByDay[key]
        ? `Nota guardada: ${notesByDay[key]}`
        : "Aún no hay nota para este día.";

    if (photosByDay[key]) {
        photoPreview.src = photosByDay[key];
        photoPreview.style.display = "block";
    } else {
        photoPreview.style.display = "none";
        photoPreview.removeAttribute("src");
    }
}

loadStoredData();

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
    calendarPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "false");
    calendarPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.add("show");
    nextPageButton.classList.add("show");
    createSparkles();

    document.querySelectorAll(".typing-text").forEach((element, index) => {
        setTimeout(() => typeText(element), index * 350);
    });
}

function showCalendarPanel() {
    hero.classList.add("is-hidden");
    galleryPanel.classList.remove("show");
    calendarPanel.classList.add("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    calendarPanel.setAttribute("aria-hidden", "false");
    backHomeButton.classList.add("show");
    nextPageButton.classList.remove("show");
    if (!memoriesLoaded) {
        loadStoredData().then(() => {
            renderCalendar();
            updateDetails(selectedDate);
        });
    } else {
        renderCalendar();
        updateDetails(selectedDate);
    }
}

openLetterButton.addEventListener("click", () => {
    showLetterPanel();
});

openCalendarButton.addEventListener("click", () => {
    showCalendarPanel();
});

backHomeButton.addEventListener("click", () => {
    hero.classList.remove("is-hidden");
    galleryPanel.classList.remove("show");
    calendarPanel.classList.remove("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    calendarPanel.setAttribute("aria-hidden", "true");
    backHomeButton.classList.remove("show");
    nextPageButton.classList.remove("show");
    sparklesLayer.innerHTML = "";
});

function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    monthLabel.textContent = currentViewDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    monthLabel.textContent = capitalize(monthLabel.textContent);

    calendarGrid.innerHTML = "";

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    dayNames.forEach((name) => {
        const cell = document.createElement("div");
        cell.className = "day-name";
        cell.textContent = name;
        calendarGrid.appendChild(cell);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i += 1) {
        const cell = document.createElement("div");
        cell.className = "day-cell empty";
        cells.push(cell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const key = getDateKey(date);
        const hasEntry = Boolean(notesByDay[key] || photosByDay[key]);

        if (showOnlyWithEntries && !hasEntry) {
            continue;
        }

        const cell = document.createElement("button");
        const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
        const isSelected = selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
        cell.className = `day-cell${isSelected ? " active" : ""}${isToday ? " today" : ""}${hasEntry ? " has-entry" : ""}`;
        cell.textContent = day;
        if (isToday) {
            cell.setAttribute("aria-label", "Hoy");
        }
        cell.addEventListener("click", () => {
            updateDetails(date);
            renderCalendar();
        });
        cells.push(cell);
    }

    while (cells.length % 7 !== 0) {
        const cell = document.createElement("div");
        cell.className = "day-cell empty";
        cells.push(cell);
    }

    cells.forEach((cell) => calendarGrid.appendChild(cell));
}

saveNoteButton.addEventListener("click", async () => {
    if (!selectedDate) {
        savedNote.textContent = "Primero elige un día.";
        return;
    }

    const noteText = noteInput.value.trim();
    const key = getDateKey(selectedDate);

    if (noteText) {
        notesByDay[key] = noteText;
        savedNote.textContent = `Nota guardada: ${noteText}`;
    } else {
        delete notesByDay[key];
        savedNote.textContent = "Nota vacía guardada.";
    }

    await saveStoredData();
    renderCalendar();
});

photoInput.addEventListener("change", (event) => {
    if (!selectedDate) {
        savedNote.textContent = "Primero elige un día.";
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        const key = getDateKey(selectedDate);
        photosByDay[key] = reader.result;
        photoPreview.src = reader.result;
        photoPreview.style.display = "block";
        savedNote.textContent = "Foto guardada para este día.";
        await saveStoredData();
        renderCalendar();
    };
    reader.readAsDataURL(file);
});

prevMonthButton.addEventListener("click", () => {
    currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1);
    renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
    currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1);
    renderCalendar();
});

filterEntriesButton.addEventListener("click", () => {
    showOnlyWithEntries = !showOnlyWithEntries;
    filterEntriesButton.textContent = showOnlyWithEntries ? "Ver todos los días" : "Ver días con citas";
    renderCalendar();
});

nextPageButton.addEventListener("click", () => {
    galleryPanel.classList.remove("show");
    calendarPanel.classList.add("show");
    galleryPanel.setAttribute("aria-hidden", "true");
    calendarPanel.setAttribute("aria-hidden", "false");
    nextPageButton.classList.remove("show");
    renderCalendar();
    updateDetails(selectedDate);
});
