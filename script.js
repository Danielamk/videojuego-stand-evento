document.addEventListener('DOMContentLoaded', () => {
    const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
    const pantallaJuego = document.getElementById('pantalla-juego');
    const pantallaFinal = document.getElementById('pantalla-final');
    const btnJugar = document.getElementById('btn-jugar');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const jugador = document.getElementById('jugador');
    const juego = document.getElementById('juego');
    const tiempoElement = document.getElementById('tiempo');
    const objetivosElement = document.getElementById('objetivos');
    const nivelElement = document.getElementById('nivel-actual');
    const mensajeFinal = document.getElementById('mensaje-final');

    let tiempoRestante = 20;
    let objetivosEliminados = 0;
    let temporizador;
    let juegoActivo = false;
    let jugadorX = 0;
    let teclasPresionadas = {};
    let disparos = [];
    let objetivos = [];
    let ultimoObjetivo = 0;
    let nivelActual = 1;
    let velocidadObjetivos = 3;
    let frecuenciaObjetivos = 1500;

    function iniciarJuego() {
        pantallaBienvenida.classList.add('oculta');
        pantallaJuego.classList.remove('oculta');
        pantallaFinal.classList.add('oculta');
        
        nivelActual = 1;
        actualizarNivel();
        reiniciarNivel();
    }

    function reiniciarNivel() {
        // Clear all existing game elements
        disparos.forEach(disparo => disparo.elemento.remove());
        objetivos.forEach(objetivo => objetivo.elemento.remove());
        
        tiempoRestante = 30;
        objetivosEliminados = 0;
        juegoActivo = true;
        jugadorX = juego.clientWidth / 2 - jugador.clientWidth / 2;
        disparos = [];
        objetivos = [];
        ultimoObjetivo = 0;
        
        actualizarInterfaz();
        iniciarTemporizador();
        iniciarBucleJuego();
    }

    function actualizarNivel() {
        nivelElement.textContent = nivelActual;
        
        // Ajustar dificultad según el nivel
        switch(nivelActual) {
            case 1:
                velocidadObjetivos = 3;
                frecuenciaObjetivos = 1500;
                break;
            case 2:
                velocidadObjetivos = 4;
                frecuenciaObjetivos = 1200;
                break;
            case 3:
                velocidadObjetivos = 5;
                frecuenciaObjetivos = 1000;
                break;
        }
    }

    function iniciarTemporizador() {
        temporizador = setInterval(() => {
            tiempoRestante--;
            tiempoElement.textContent = tiempoRestante;
            
            if (tiempoRestante <= 0) {
                finalizarJuego(false);
            }
        }, 1000);
    }

    function iniciarBucleJuego() {
        if (!juegoActivo) return;

        // Mover jugador
        if (teclasPresionadas['arrowleft'] && jugadorX > 0) {
            jugadorX -= 5;
        }
        if (teclasPresionadas['arrowright'] && jugadorX < juego.clientWidth - jugador.clientWidth) {
            jugadorX += 5;
        }
        jugador.style.left = jugadorX + 'px';

        // Crear objetivos
        const ahora = Date.now();
        if (ahora - ultimoObjetivo > frecuenciaObjetivos) {
            crearObjetivo();
            ultimoObjetivo = ahora;
        }

        // Mover disparos
        disparos.forEach((disparo, index) => {
            disparo.y += 7;
            disparo.elemento.style.bottom = disparo.y + 'px';
            
            if (disparo.y > juego.clientHeight) {
                disparo.elemento.remove();
                disparos.splice(index, 1);
            }
        });

        // Mover objetivos
        objetivos.forEach((objetivo, index) => {
            objetivo.y += velocidadObjetivos;
            objetivo.elemento.style.top = objetivo.y + 'px';
            
            if (objetivo.y > juego.clientHeight) {
                objetivo.elemento.remove();
                objetivos.splice(index, 1);
            }
        });

        // Verificar colisiones
        verificarColisiones();

        requestAnimationFrame(iniciarBucleJuego);
    }

    function crearObjetivo() {
        const objetivo = document.createElement('div');
        objetivo.className = 'objetivo';
        const x = Math.random() * (juego.clientWidth - 40);
        objetivo.style.left = x + 'px';
        objetivo.style.top = '0px';
        juego.appendChild(objetivo);

        objetivos.push({
            elemento: objetivo,
            x: x,
            y: 0
        });
    }

    function disparar() {
        if (!juegoActivo) return;

        const disparo = document.createElement('div');
        disparo.className = 'disparo';
        disparo.style.left = (jugadorX + jugador.clientWidth / 2 - 2.5) + 'px';
        disparo.style.bottom = '70px';
        juego.appendChild(disparo);

        disparos.push({
            elemento: disparo,
            x: jugadorX + jugador.clientWidth / 2 - 2.5,
            y: 70
        });
    }

    function verificarColisiones() {
        disparos.forEach((disparo, disparoIndex) => {
            objetivos.forEach((objetivo, objetivoIndex) => {
                if (Math.abs(disparo.x - objetivo.x) < 40 &&
                    Math.abs(disparo.y - (juego.clientHeight - objetivo.y)) < 40) {
                    // Colisión detectada
                    disparo.elemento.remove();
                    objetivo.elemento.remove();
                    disparos.splice(disparoIndex, 1);
                    objetivos.splice(objetivoIndex, 1);
                    
                    objetivosEliminados++;
                    actualizarInterfaz();
                    
                    if (objetivosEliminados >= 12) {
                        if (nivelActual < 3) {
                            // Pasar al siguiente nivel
                            nivelActual++;
                            actualizarNivel();
                            reiniciarNivel();
                        } else {
                            // Completar el juego
                            finalizarJuego(true);
                        }
                    }
                }
            });
        });
    }

    function actualizarInterfaz() {
        tiempoElement.textContent = tiempoRestante;
        objetivosElement.textContent = objetivosEliminados;
    }

    function finalizarJuego(ganado) {
        juegoActivo = false;
        clearInterval(temporizador);
        
        pantallaJuego.classList.add('oculta');
        pantallaFinal.classList.remove('oculta');
        
        if (ganado) {
            mensajeFinal.textContent = '¡Felicidades! ¡Has completado todos los niveles!';
            mensajeFinal.style.color = '#2ed573';
        } else {
            mensajeFinal.textContent = `¡Se acabó el tiempo en el nivel ${nivelActual}! ¡Inténtalo de nuevo!`;
            mensajeFinal.style.color = '#ff4757';
        }
    }

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        teclasPresionadas[e.key.toLowerCase()] = true;
        if (e.code === 'Space') {
            disparar();
        }
    });

    document.addEventListener('keyup', (e) => {
        teclasPresionadas[e.key.toLowerCase()] = false;
    });

    btnJugar.addEventListener('click', iniciarJuego);
    btnReiniciar.addEventListener('click', iniciarJuego);
}); 