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
    const cycleDisplay = document.getElementById('cycle-count');
    const notificationPermissionMessageEl = document.getElementById('notification-permission-message'); // NUEVA LÍNEA


    // Configuración del temporizador
    let workDuration;
    let breakDuration;
    let currentTime;
    let isWorkTime = true;
    let timerInterval = null;
    let completedCycles = 0;

    const activities = [
        "Estira los brazos y piernas.",
        "Camina un poco por la habitación.",
        "Haz círculos con el cuello y hombros.",
        "Levántate y bebe un vaso de agua.",
        "Mira a un objeto lejano por 20 segundos.",
        "Haz 5 sentadillas suaves.",
        "Respira profundamente 3 veces.",
        "Parpadea rápidamente varios segundos.",
        // ¡Añade todas las que se te ocurran!
    ];

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        timerDisplay.textContent = formatTime(currentTime);
        statusDisplay.textContent = isWorkTime ? "Tiempo de Trabajo" : "Tiempo de Descanso";
        cycleDisplay.textContent = `Ciclos: ${completedCycles}`;
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

    function showNotification(message) {
        const systemIconPath = isWorkTime ? '../public/work-icon.svg' : '../public/break-icon.svg';


        if (Notification.permission === "granted") {
            if (notificationPermissionMessageEl) notificationPermissionMessageEl.style.display = 'none';
            const notification = new Notification("Recordatorio de Descanso Activo", { body: message, icon: systemIconPath });
            console.log("Notificación creada:", notification);

        } else if (Notification.permission !== "denied") {
            if (notificationPermissionMessageEl) notificationPermissionMessageEl.style.display = 'none';
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    const notification = new Notification("Recordatorio de Descanso Activo", { body: message, icon: systemIconPath });
                    console.log("Notificación creada tras permiso:", notification);
                }
            });
        } else { // Notification.permission === "denied"
            console.log("El permiso para notificaciones fue denegado previamente.");
            if (notificationPermissionMessageEl) {
                const pageMessageSVG = isWorkTime ? '/images/work-icon.svg' : '/images/break-icon.svg';
                const modeText = isWorkTime ? "trabajo" : "descanso";

                notificationPermissionMessageEl.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <img src="${pageMessageSVG}" alt="Icono de ${modeText}" width="24" height="24" style="margin-right: 10px;">
                        <span>Notificación de ${modeText} intentada, pero los permisos están bloqueados.</span>
                    </div>
                    <div style="font-size: 0.9em; margin-top: 8px;">
                        Para activarlas, revisa los permisos del sitio en tu navegador (icono de candado 🔒).
                    </div>`;
                notificationPermissionMessageEl.style.display = 'block';
            }
        }
    }

    function suggestActivity() {
        // Solo mostramos sugerencias si es tiempo de descanso y hay actividades en la lista
        if (!isWorkTime && activities.length > 0) {
            const randomIndex = Math.floor(Math.random() * activities.length);
            activitySuggestion.textContent = `💡 Sugerencia: ${activities[randomIndex]}`;
        } else {
            // Si es tiempo de trabajo, o no hay actividades, limpiamos la sugerencia
            activitySuggestion.textContent = "";
        }
    }

    function startTimer() {
        if (timerInterval) return;

        updateDurationsFromInput();

        if (isWorkTime && pauseButton.disabled) {
            currentTime = workDuration;
        }

        updateDisplay();

        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        timerInterval = setInterval(() => {
            currentTime--;
            updateDisplay();

            if (currentTime < 0) {
                clearInterval(timerInterval);
                timerInterval = null;

                if (isWorkTime) {
                    completedCycles++;
                }

                isWorkTime = !isWorkTime; 
                
                currentTime = isWorkTime ? workDuration : breakDuration;

                // Actualizamos toda la interfaz de usuario.
                updateDisplay(); // Esto mostrará el nuevo tiempo y el contador de ciclos actualizado.
                suggestActivity(); // Esto mostrará u ocultará la sugerencia según el nuevo estado.
                
                // Preparamos y mostramos la notificación para el nuevo estado.
                const message = isWorkTime ? "¡Hora de volver al trabajo!" : "¡Es hora de un descanso activo!";
                showNotification(message);
                
                // Ajustamos el estado de los botones e inputs.
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
        workMinutesInput.disabled = false;
        breakMinutesInput.disabled = false;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        
        updateDurationsFromInput();
        
        isWorkTime = true;
        currentTime = workDuration; 
        completedCycles = 0;
        updateDisplay();
        activitySuggestion.textContent = "";
        startButton.disabled = false;
        pauseButton.disabled = true;
        workMinutesInput.disabled = false;
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