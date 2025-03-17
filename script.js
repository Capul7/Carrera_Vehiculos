// DOM para el juego
const startBtn = document.querySelector(".start"); // Botón de inicio
const pauseBtn = document.querySelector(".pause"); // Botón de pausa
const gameAreas = document.querySelectorAll(".gameArea"); // Áreas de juego
const scores = document.querySelectorAll(".score"); // Puntuaciones
const levelDisplays = document.querySelectorAll(".levelDisplay"); // Niveles

// Variables para los jugadores
let players = [
  { speed: 2, score: 0, level: 1, start: false, x: 225, y: 600, crashed: false },
  { speed: 2, score: 0, level: 1, start: false, x: 225, y: 600, crashed: false }
];

// Variables globales del juego
let lines = [[], []]; // Líneas de carretera
let enemies = [[], []]; // Enemigos
let cars = []; // Autos de jugadores
let gameLoopId; // ID del loop de animación
let isPaused = false; // Estado de pausa

// Manejo de teclas
let keys = { ArrowRight: false, ArrowLeft: false, a: false, d: false };

// Eventos
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

function pressOn(e) {
  e.preventDefault();
  keys[e.key] = true;
}

function pressOff(e) {
  e.preventDefault();
  keys[e.key] = false;
}

// 🔄 Función para iniciar el juego
function startGame() {
  console.log("Juego iniciado...");
  startBtn.classList.add("hide");
  pauseBtn.classList.remove("hide"); // Mostrar botón de pausa

  cancelAnimationFrame(gameLoopId);
  isPaused = false;
  pauseBtn.textContent = "Pause";

  gameAreas.forEach((gameArea, index) => {
    gameArea.innerHTML = "";
    players[index] = { speed: 2, score: 0, level: 1, start: true, x: 225, y: 600, crashed: false };
    levelDisplays[index].textContent = `Level: 1`;

    // Crear líneas de carretera
    lines[index] = [];
    for (let x = 0; x < 10; x++) {
      let div = document.createElement("div");
      div.classList.add("line");
      div.y = x * 150;
      div.style.top = `${div.y}px`;
      gameArea.appendChild(div);
      lines[index].push(div);
    }

    // Crear auto del jugador
    let car = document.createElement("div");
    car.classList.add("car");
    car.style.backgroundImage = "url('car.png')";
    car.style.backgroundColor = index === 0 ? "red" : "blue";
    gameArea.appendChild(car);
    cars[index] = car;

    // Crear enemigos
    enemies[index] = [];
    for (let x = 0; x < 5; x++) {
      let enemy = document.createElement("div");
      enemy.classList.add("enemy");
      enemy.style.backgroundImage = "url('car.png')";
      enemy.style.backgroundColor = index === 0 ? "green" : "orange";
      enemy.y = (x + 1) * -300;
      enemy.style.top = `${enemy.y}px`;
      enemy.style.left = `${Math.floor(Math.random() * 350)}px`;
      gameArea.appendChild(enemy);
      enemies[index].push(enemy);
    }
  });

  gameLoop();
}

// 🔄 Función para pausar y reanudar el juego
function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";

  if (!isPaused) {
    gameLoop();
  }
}

// 🔄 Función principal del juego
function gameLoop() {
  if (isPaused) return; // Detiene el loop si el juego está en pausa

  gameLoopId = requestAnimationFrame(gameLoop);

  gameAreas.forEach((gameArea, index) => {
    if (!players[index].start || players[index].crashed) return;

    moveLines(index);
    moveEnemies(index);
    movePlayer(index);

    if (players[index].speed < 5) {
      players[index].speed += 0.005;
    }

    players[index].score++;
    scores[index].textContent = `Score: ${players[index].score}`;

    if (players[index].score % 500 === 0) {
      players[index].speed += 0.5;
      players[index].level++;
      levelDisplays[index].textContent = `Level: ${players[index].level}`;
    }
  });
}

// 🔄 Función para mover líneas de carretera
function moveLines(index) {
  lines[index].forEach((line) => {
    if (line.y >= 1500) line.y -= 1500;
    line.y += players[index].speed;
    line.style.top = line.y + "px";
  });
}

// 🔄 Función para mover enemigos
function moveEnemies(index) {
  enemies[index].forEach((enemy) => {
    if (isCollide(cars[index], enemy)) {
      console.log(`Jugador ${index + 1} colisionó!`);
      players[index].crashed = true;
      checkGameEnd();
    }
    if (enemy.y >= 1500) {
      enemy.y = -600;
      enemy.style.left = `${Math.floor(Math.random() * 350)}px`;
    }
    enemy.y += players[index].speed;
    enemy.style.top = enemy.y + "px";
  });
}

// 🔄 Función para mover el jugador
function movePlayer(index) {
  let road = gameAreas[index].getBoundingClientRect();
  if (index === 0) {
    if (keys.a && players[index].x > 0) players[index].x -= players[index].speed;
    if (keys.d && players[index].x < road.width - 50) players[index].x += players[index].speed;
  } else {
    if (keys.ArrowLeft && players[index].x > 0) players[index].x -= players[index].speed;
    if (keys.ArrowRight && players[index].x < road.width - 50) players[index].x += players[index].speed;
  }
  cars[index].style.left = `${players[index].x}px`;
}

// 🔄 Verificar colisión
function isCollide(a, b) {
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

// 🔄 Verificar si ambos jugadores han colisionado
function checkGameEnd() {
  if (players.every(player => player.crashed)) {
    console.log("Juego terminado para ambos jugadores.");
    startBtn.classList.remove("hide");
  }
}
