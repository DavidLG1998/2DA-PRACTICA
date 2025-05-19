
        // Variables globales
        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas.getContext('2d');
        const textarea = document.getElementById('itemsTextarea');
        const spinButton = document.getElementById('spinButton');
        const resultContainer = document.getElementById('resultContainer');
        const selectedItemElement = document.getElementById('selectedItem');
        const editIndicator = document.getElementById('editIndicator');
        const fullscreenContainer = document.getElementById('fullscreenContainer');
        
        let items = [];
        let hiddenItems = [];
        let isSpinning = false;
        let rotation = 0;
        let lastSelectedItem = null;
        let lastSelectedIndex = -1;
        let editMode = false;
        let autoUpdateTimeout = null;
        
        // Colores básicos para los sectores
        const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
        
        // Agregar event listeners
        canvas.addEventListener('click', spinWheel);
        document.addEventListener('keydown', handleKeyDown);
        textarea.addEventListener('click', enableEditMode);
        textarea.addEventListener('input', handleTextareaChange);
        
        // Inicializar
        function init() {
            drawWheel();
        }
        
        function handleKeyDown(e) {
            // Tecla Espacio para girar la ruleta
            if (e.code === 'Space' && !isSpinning && getActiveItems().length > 0) {
                e.preventDefault();
                spinWheel();
            }
            
            // Tecla S para resaltar y ocultar el último elemento sorteado
            if (e.key === 's' || e.key === 'S') {
                if (lastSelectedItem !== null) {
                    highlightAndHideLastSelected();
                }
            }
            
            // Tecla E para habilitar/deshabilitar modo edición
            if (e.key === 'e' || e.key === 'E') {
                toggleEditMode();
            }
            
            // Tecla R para reiniciar (F8)
            if (e.key === 'r' || e.key === 'R') {
                resetRoulette();
            }
            
            // Tecla F para pantalla completa (F9)
            if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        }
        
        // F8: Función para reiniciar la ruleta
        function resetRoulette() {
            // Restaurar elementos ocultos
            hiddenItems = [];
            
            // Eliminar resaltado en el textarea
            if (textarea.value.includes('[oculto]')) {
                const lines = textarea.value.split('\n');
                let newTextareaContent = '';
                
                for (let i = 0; i < lines.length; i++) {
                    // Eliminar el marcador [oculto]
                    newTextareaContent += lines[i].replace(' [oculto]', '') + '\n';
                }
                
                textarea.value = newTextareaContent.trim();
            }
            
            // Redibujar la ruleta con todos los elementos
            drawWheel();
            
            // Mostrar mensaje de confirmación
            alert('Ruleta reiniciada. Todos los elementos están disponibles para el sorteo.');
        }
        
        // F9: Función para activar/desactivar pantalla completa
        function toggleFullscreen() {
            if (!document.fullscreenElement && 
                !document.mozFullScreenElement && 
                !document.webkitFullscreenElement && 
                !document.msFullscreenElement) {
                // Entrar en pantalla completa
                if (fullscreenContainer.requestFullscreen) {
                    fullscreenContainer.requestFullscreen();
                } else if (fullscreenContainer.mozRequestFullScreen) { // Firefox
                    fullscreenContainer.mozRequestFullScreen();
                } else if (fullscreenContainer.webkitRequestFullscreen) { // Chrome, Safari y Opera
                    fullscreenContainer.webkitRequestFullscreen();
                } else if (fullscreenContainer.msRequestFullscreen) { // IE/Edge
                    fullscreenContainer.msRequestFullscreen();
                }
            } else {
                // Salir de pantalla completa
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
        
        function toggleEditMode() {
            editMode = !editMode;
            updateEditModeUI();
        }
        
        function enableEditMode() {
            editMode = true;
            updateEditModeUI();
        }
        
        function updateEditModeUI() {
            if (editMode) {
                textarea.classList.add('edit-mode');
                editIndicator.style.display = 'block';
            } else {
                textarea.classList.remove('edit-mode');
                editIndicator.style.display = 'none';
            }
        }
        
        function handleTextareaChange() {
            // Cancelar cualquier actualización pendiente
            if (autoUpdateTimeout) {
                clearTimeout(autoUpdateTimeout);
            }
            
            // Programar una actualización después de un breve retraso
            autoUpdateTimeout = setTimeout(() => {
                updateItemsFromTextarea();
            }, 300);
        }
        
        function updateItemsFromTextarea() {
            const textValue = textarea.value.trim();
            
            if (textValue) {
                // Dividir por líneas y filtrar líneas vacías
                const newItems = textValue
                    .split('\n')
                    .map(item => item.trim().replace(' [oculto]', '')) // Eliminar el marcador para la lista interna
                    .filter(item => item.length > 0);
                
                // Actualizar los items
                items = newItems;
                
                // Identificar elementos ocultos basados en el marcador [oculto] en el textarea
                hiddenItems = [];
                const lines = textValue.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.includes('[oculto]')) {
                        const itemName = line.replace(' [oculto]', '');
                        if (!hiddenItems.includes(itemName)) {
                            hiddenItems.push(itemName);
                        }
                    }
                }
                
                // Actualizar UI
                if (items.length > 0) {
                    spinButton.disabled = false;
                    drawWheel();
                } else {
                    spinButton.disabled = true;
                }
            } else {
                items = [];
                hiddenItems = [];
                spinButton.disabled = true;
                drawWheel();
            }
        }
        
        function highlightAndHideLastSelected() {
            if (lastSelectedItem === null || lastSelectedIndex === -1) return;
            
            // Añadir el item a la lista de ocultos
            if (!hiddenItems.includes(lastSelectedItem)) {
                hiddenItems.push(lastSelectedItem);
            }
            
            // Resaltar el elemento en el textarea
            const lines = textarea.value.split('\n');
            let newTextareaContent = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const cleanLine = line.replace(' [oculto]', '');
                
                if (cleanLine === lastSelectedItem && !line.includes('[oculto]')) {
                    // Añadir un marcador para indicar que está oculto
                    newTextareaContent += `${cleanLine} [oculto]\n`;
                } else {
                    newTextareaContent += `${line}\n`;
                }
            }
            
            textarea.value = newTextareaContent.trim();
            
            // Redibujar la ruleta sin el elemento oculto
            drawWheel();
        }
        
        function getActiveItems() {
            // Devolver solo los elementos que no están ocultos
            return items.filter(item => !hiddenItems.includes(item));
        }
        
        function drawWheel() {
            // Limpiar el canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const activeItems = getActiveItems();
            
            if (activeItems.length === 0) {
                // Dibujar un círculo vacío si no hay elementos activos
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(centerX, centerY) - 10;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Dibujar texto de "Sin elementos"
                ctx.fillStyle = '#999999';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Sin elementos activos', centerX, centerY);
                
                // Dibujar triángulo indicador rojo
                drawIndicator();
                
                return;
            }
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            
            // Dibujar los sectores
            const anglePerItem = (2 * Math.PI) / activeItems.length;
            
            for (let i = 0; i < activeItems.length; i++) {
                const startAngle = i * anglePerItem + (rotation * Math.PI) / 180;
                const endAngle = (i + 1) * anglePerItem + (rotation * Math.PI) / 180;
                
                // Seleccionar color (repetir si hay más de 5 elementos)
                const colorIndex = i % colors.length;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[colorIndex];
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Dibujar texto
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + anglePerItem / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(activeItems[i], radius - 15, 5);
                ctx.restore();
            }
            
            // Dibujar círculo central
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#333333';
            ctx.fill();
            
            // Dibujar triángulo indicador rojo
            drawIndicator();
        }
        
        function drawIndicator() {
            const centerX = canvas.width / 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, 10);
            ctx.lineTo(centerX - 10, 30);
            ctx.lineTo(centerX + 10, 30);
            ctx.closePath();
            ctx.fillStyle = '#FF0000';
            ctx.fill();
        }
        
        function spinWheel() {
            const activeItems = getActiveItems();
            
            if (isSpinning || activeItems.length === 0) return;
            
            isSpinning = true;
            spinButton.disabled = true;
            spinButton.textContent = 'Girando...';
            resultContainer.style.display = 'none';
            
            // Generar rotación aleatoria (entre 2 y 5 vueltas completas)
            const spinAngle = 720 + Math.random() * 1080;
            const startRotation = rotation;
            const startTime = performance.now();
            const duration = 3000 + Math.random() * 2000; // Entre 3 y 5 segundos
            
            function animateSpin(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Función de easing para desaceleración
                const easeOut = t => 1 - Math.pow(1 - t, 3);
                const currentProgress = easeOut(progress);
                
                const currentRotation = startRotation + spinAngle * currentProgress;
                rotation = currentRotation % 360;
                
                drawWheel();
                
                if (progress < 1) {
                    requestAnimationFrame(animateSpin);
                } else {
                    // Determinar el elemento seleccionado
                    const anglePerItem = 360 / activeItems.length;
                    const normalizedRotation = (360 - (rotation % 360)) % 360;
                    const selectedIndex = Math.floor(normalizedRotation / anglePerItem);
                    
                    // Guardar el último elemento seleccionado
                    lastSelectedItem = activeItems[selectedIndex];
                    lastSelectedIndex = items.indexOf(lastSelectedItem);
                    
                    // Mostrar el resultado
                    selectedItemElement.textContent = lastSelectedItem;
                    resultContainer.style.display = 'block';
                    
                    // Restablecer estado
                    isSpinning = false;
                    spinButton.disabled = false;
                    spinButton.textContent = 'Iniciar';
                }
            }
            
            requestAnimationFrame(animateSpin);
        }
        
        // Manejar eventos de cambio de pantalla completa para actualizar la UI
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        function updateFullscreenButton() {
            const fullscreenButton = document.getElementById('fullscreenButton');
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement) {
                fullscreenButton.textContent = 'Salir de Pantalla Completa';
            } else {
                fullscreenButton.textContent = 'Pantalla Completa';
            }
        }
        
        // Inicializar la aplicación
        init();
   