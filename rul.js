// === script.js ===
const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');
const textarea = document.getElementById('textarea');
const btnGirar = document.getElementById('btnGirar');
const btnReiniciar = document.getElementById('btnReiniciar');
const resultado = document.getElementById('resultado');
canvas.width = canvas.height = 400;

let elementos = [];
let ocultos = [];
let anguloActual = 0;
let girando = false;
const colores = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'];

function actualizarElementos() {
  elementos = textarea.value
    .split('\n')
    .map(e => e.trim())
    .filter(e => e && !ocultos.includes(e));
  dibujarRuleta();
}

function dibujarRuleta() {
  const total = elementos.length;
  const radio = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < total; i++) {
    const ang = (2 * Math.PI) / total;
    const inicio = i * ang + anguloActual;
    const fin = inicio + ang;
    ctx.beginPath();
    ctx.moveTo(radio, radio);
    ctx.arc(radio, radio, radio, inicio, fin);
    ctx.fillStyle = colores[i % colores.length];
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(radio, radio);
    ctx.rotate(inicio + ang / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(elementos[i], radio - 10, 5);
    ctx.restore();
  }
  // Triángulo rojo
  ctx.beginPath();
  ctx.moveTo(radio - 10, 10);
  ctx.lineTo(radio + 10, 10);
  ctx.lineTo(radio, 30);
  ctx.closePath();
  ctx.fillStyle = 'red';
  ctx.fill();
}

function girarRuleta() {
  if (girando || elementos.length === 0) return;
  girando = true;
  const vueltas = Math.random() * 5 + 5;
  const destino = anguloActual + vueltas * Math.PI;
  const duracion = 3000;
  const inicio = performance.now();

  function animar(tiempo) {
    const progreso = Math.min((tiempo - inicio) / duracion, 1);
    anguloActual += (destino - anguloActual) * 0.1;
    dibujarRuleta();
    if (progreso < 1) requestAnimationFrame(animar);
    else {
      anguloActual = destino % (2 * Math.PI);
      const index = elementos.length - Math.floor((anguloActual / (2 * Math.PI)) * elementos.length) - 1;
      const seleccionado = elementos[(index + elementos.length) % elementos.length];
      resultado.textContent = 'Seleccionado: ' + seleccionado;
      resaltarEnTextarea(seleccionado);
      girando = false;
    }
  }

  requestAnimationFrame(animar);
}

function resaltarEnTextarea(seleccionado) {
  ocultos.push(seleccionado);
  const lineas = textarea.value.split('\n');
  textarea.value = lineas.map(linea => (linea.trim() === seleccionado ? `#${linea}` : linea)).join('\n');
  actualizarElementos();
}

function reiniciar() {
  ocultos = [];
  const lineas = textarea.value.split('\n');
  textarea.value = lineas.map(linea => linea.replace(/^#\s*/, '')).join('\n');
  actualizarElementos();
  resultado.textContent = '';
}

// Eventos
textarea.addEventListener('input', actualizarElementos);
btnGirar.addEventListener('click', girarRuleta);
btnReiniciar.addEventListener('click', reiniciar);

window.addEventListener('keydown', e => {
  if (e.code === 'Space') girarRuleta();
  if (e.key === 'S' || e.key === 's') {
    if (resultado.textContent.includes('Seleccionado:')) {
      const seleccionado = resultado.textContent.split(': ')[1];
      resaltarEnTextarea(seleccionado);
    }
  }
  if (e.key === 'E' || e.key === 'e') textarea.removeAttribute('readonly');
  if (e.key === 'R' || e.key === 'r') reiniciar();
  if (e.key === 'F' || e.key === 'f') {
    document.documentElement.requestFullscreen();
  }
});

textarea.addEventListener('click', () => textarea.removeAttribute('readonly'));
canvas.addEventListener('click', girarRuleta);

// Inicializar
textarea.value = "Elemento 1\nElemento 2\nElemento 3\nElemento 4\nElemento 5";
actualizarElementos();