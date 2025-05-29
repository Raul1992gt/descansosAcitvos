import './style.css';

// ... (otros elementos del DOM como antes)
const timerDisplay = document.getElementById('timer-display');
const statusDisplay = document.getElementById('status-display');
const activitySuggestion = document.getElementById('activity-suggestion');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const workMinutesInput = document.getElementById('work-minutes');
const breakMinutesInput = document.getElementById('break-minutes');
// const cycleDisplay = document.getElementById('cycle-count'); // Para el contador de ciclos más tarde

// Configuración del temporizador
let workDuration;
let breakDuration;
let currentTime;
let isWorkTime = true;
let timerInterval = null;
// let completedCycles = 0; // Para el contador de ciclos más tarde

const activities = [ /* ... tu lista de actividades ... */ ];

function formatTime(seconds) {
    // ... (sin cambios)
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    // ... (sin cambios)
    timerDisplay.textContent = formatTime(currentTime);
    statusDisplay.textContent = isWorkTime ? "Tiempo de Trabajo" : "Tiempo de Descanso";
    // cycleDisplay.textContent = `Ciclos: ${completedCycles}`; // Para el contador de ciclos más tarde
}

function updateDurationsFromInput() {
    let workMinutes = parseInt(workMinutesInput.value);
    let breakMinutes = parseInt(breakMinutesInput.value);

    if (isNaN(workMinutes) || workMinutes <= 0) {
        workMinutes = 25; // Valor por defecto si el input es inválido
        workMinutesInput.value = workMinutes;
    }
    if (isNaN(breakMinutes) || breakMinutes <= 0) {
        breakMinutes = 5; // Valor por defecto
        breakMinutesInput.value = breakMinutes;
    }
    workDuration = workMinutes * 60;
    breakDuration = breakMinutes * 60;
}

function showNotification(message) { /* ... (sin cambios por ahora) ... */ }
function suggestActivity() { /* ... (sin cambios por ahora) ... */ }

// --- LÓGICA MODIFICADA ---
function startTimer() {
    if (timerInterval) return; // Ya está corriendo

    updateDurationsFromInput(); // Siempre leer los inputs al (re)iniciar

    // Si estamos por iniciar un "Tiempo de Trabajo" y el timer no estaba pausado
    // (es decir, el botón de pausa está deshabilitado),
    // entonces es un nuevo inicio de ciclo de trabajo, así que currentTime debe ser workDuration.
    if (isWorkTime && pauseButton.disabled) {
        currentTime = workDuration;
    }
    // Si es tiempo de descanso, currentTime ya debería tener breakDuration
    // (establecido cuando terminó el tiempo de trabajo).

    updateDisplay(); // Mostrar el tiempo correcto ANTES de que empiece el intervalo

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    timerInterval = setInterval(() => {
        currentTime--;
        updateDisplay();

        if (currentTime < 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isWorkTime = !isWorkTime;
            currentTime = isWorkTime ? workDuration : breakDuration;
            // completedCycles += isWorkTime ? 1 : 0; // Incrementar ciclo cuando un nuevo tiempo de trabajo comienza (después de un descanso)
            // OJO: Si quieres que el ciclo se cuente cuando termina un trabajo:
            // if (!isWorkTime) { completedCycles++; } // Si acabamos de pasar a tiempo de descanso

            updateDisplay();
            suggestActivity();
            
            const message = isWorkTime ? "¡Hora de volver al trabajo!" : "¡Es hora de un descanso activo!";
            showNotification(message);
            
            startButton.disabled = false;
            pauseButton.disabled = true;
            workMinutesInput.disabled = false;
            breakMinutesInput.disabled = false;
        }
    }, 1000);

    startButton.disabled = true;
    pauseButton.disabled = false;
    workMinutesInput.disabled = true;
    breakMinutesInput.disabled = true;
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startButton.disabled = false;
    pauseButton.disabled = true;
    workMinutesInput.disabled = false; // Habilitar inputs al pausar
    breakMinutesInput.disabled = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    
    updateDurationsFromInput(); // Leer los valores actuales de los inputs
    
    isWorkTime = true;
    currentTime = workDuration; // Usar el workDuration actualizado
    // completedCycles = 0; // Para el contador de ciclos más tarde
    updateDisplay();
    activitySuggestion.textContent = "";
    startButton.disabled = false;
    pauseButton.disabled = true;
    workMinutesInput.disabled = false; // Habilitar inputs al resetear
    breakMinutesInput.disabled = false;
}

// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// --- Inicialización ---
function initializeApp() {
    updateDurationsFromInput(); // Cargar y validar duraciones desde los inputs
    currentTime = workDuration;   // Establecer el tiempo actual basado en la duración de trabajo
    updateDisplay();              // Actualizar la pantalla con este tiempo
    workMinutesInput.disabled = false; // Asegurar que los inputs estén habilitados al inicio
    breakMinutesInput.disabled = false;
    pauseButton.disabled = true;   // El botón de pausa debe estar deshabilitado al inicio
    startButton.disabled = false;  // El botón de inicio debe estar habilitado
}

initializeApp(); // Llamar a la función de inicialización