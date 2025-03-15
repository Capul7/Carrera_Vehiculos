// DOM para el juego
const startBtn = document.querySelector(".start"); // Botón de inicio
const gameAreas = document.querySelectorAll(".gameArea"); // Áreas de juego
const scoreBoards = document.querySelectorAll(".scoreBoard"); // Tableros de puntaje
const scores = document.querySelectorAll(".score"); // Puntuaciones
const levelDisplays = document.querySelectorAll(".levelDisplay"); // Niveles

// Variables para los jugadores
let players = [
  { speed: 5, score: 0, isGamePaused: false, level: 1, start: false, x: 225, y: 600, crashed: false, color: "red" },
  { speed: 5, score: 0, isGamePaused: false, level: 1, start: false, x: 225, y: 600, crashed: false, color: "blue" },
];

// Teclas de los jugadores
let keys = {
  ArrowRight: false,
  ArrowLeft: false,
  a: false,
  d: false,
  Space: false, // Tecla de pausa
};

// Listas de elementos del juego
let lines = [[], []]; // Líneas de carretera para cada jugador
let enemies = [[], []]; // Enemigos para cada jugador
let cars = [];

// Evento para iniciar el juego
startBtn.addEventListener("click", startGame);
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

// Manejo de teclas
function pressOn(e) {
  e.preventDefault();
  keys[e.key] = true;

  if (e.code === "Space") {
    let allPaused = players.every(player => player.isGamePaused);
    players.forEach(player => player.isGamePaused = !allPaused);
    if (!allPaused) {
      gameLoop();
    }
  }
}

function pressOff(e) {
  e.preventDefault();
  keys[e.key] = false;
}

// Función para iniciar el juego
function startGame() {
  console.log("Juego iniciado...");
  startBtn.classList.add("hide");

  gameAreas.forEach((gameArea, index) => {
    gameArea.innerHTML = "";
    players[index].start = true;
    players[index].speed = 5;
    players[index].score = 0;
    players[index].level = 1;
    players[index].crashed = false;
    levelDisplays[index].textContent = `Level: 1`;

    // Crear líneas de carretera
    for (let x = 0; x < 10; x++) {
      let div = document.createElement("div");
      div.classList.add("line");
      div.y = x * 150;
      div.style.top = `${div.y}px`;
      gameArea.appendChild(div);
      lines[index].push(div);
    }

    // Crear el auto del jugador
    let car = document.createElement("div");
    car.classList.add("car");
    car.style.backgroundImage = "url('car.png')";
    car.style.filter = index === 0 ? "hue-rotate(300deg)" : "hue-rotate(190deg)"; // Rojo y Azul
    gameArea.appendChild(car);
    cars[index] = car;
    players[index].x = 225;
    players[index].y = 600;

    // Crear enemigos
    for (let x = 0; x < 5; x++) {
      let enemy = document.createElement("div");
      enemy.classList.add("enemy");
      enemy.style.backgroundImage = "url('car.png')";
      enemy.style.filter = `hue-rotate(${Math.random() * 360}deg)`; // Colores aleatorios
      enemy.y = (x + 1) * -300;
      enemy.style.top = `${enemy.y}px`;
      enemy.style.left = `${Math.floor(Math.random() * 350)}px`;
      gameArea.appendChild(enemy);
      enemies[index].push(enemy);
    }
  });

  gameLoop();
}

// Función principal del juego
function gameLoop() {
  if (players.every(player => player.isGamePaused || !player.start)) return;

  gameAreas.forEach((gameArea, index) => {
    if (!players[index].start || players[index].isGamePaused || players[index].crashed) return;

    moveLines(index);
    moveEnemies(index);
    movePlayer(index);

    // Actualizar puntajes
    players[index].score++;
    scores[index].textContent = `Score: ${players[index].score}`;

    if (players[index].score % 500 === 0) {
      players[index].speed += 1;
      players[index].level += 1;
      levelDisplays[index].textContent = `Level: ${players[index].level}`;
    }
  });

  requestAnimationFrame(gameLoop);
}

// Movimiento de líneas de carretera
function moveLines(index) {
  lines[index].forEach(item => {
    if (item.y >= 1500) item.y -= 1500;
    item.y += players[index].speed;
    item.style.top = item.y + "px";
  });
}

// Movimiento de enemigos y detección de colisión
function moveEnemies(index) {
  enemies[index].forEach(item => {
    if (isCollide(cars[index], item)) {
      console.log(`Jugador ${index + 1} colisionó!`);
      players[index].crashed = true;
      checkGameEnd();
    }
    if (item.y >= 1500) {
      item.y = -600;
      item.style.left = `${Math.floor(Math.random() * 350)}px`;
    }
    item.y += players[index].speed;
    item.style.top = item.y + "px";
  });
}

// Movimiento del jugador
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

// Verificación de colisión
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

// Verificar si ambos jugadores colisionaron
function checkGameEnd() {
  if (players.every(player => player.crashed)) {
    console.log("Juego terminado para ambos jugadores.");
    startBtn.classList.remove("hide");
  }
}
