let canvas;
let context;

let fpsInterval = 1000 / 60; //60 frames per second
let now; 
let then = Date.now();
let request;
 
let score = 0;
let health = 100;
let remainingTime = 60; //set the initial remaining time to 60 seconds
let enemyCount = 3; // Set the initial enemy count

function createEnemy() {
    let a = {
        x : canvas.width,
        y : randint (70, canvas.height-70), 
        width : 40 ,
        height : 70 ,  
        xChange : randint(-0.5, -1.2),
        yChange : 0
    };
    enemy.push(a);
}
// Invoke createEnemy() function every 5 seconds
setInterval(() => {
    if (enemyCount < 100) { // Limit the maximum number of enemies to 25
        createEnemy();
        enemyCount++;
    }
}, 2000);

let spongebob = new Image();
spongebob.src = "images/myspongebob350-200-transformed.png";

let plankton = new Image();
plankton.src = "images/plankton-transformed.png";

let treasureImage = new Image();
treasureImage.src = "images/treasure-transformed.png";

let burgerImage = new Image();
burgerImage.src = "images/crabsburger-transformed.png";

let jellyImage = new Image();
jellyImage.src = "images/jellyfish-transformed.png";

let burgers = [];
let treasure = [];
let enemy = []; //enemy who can shoot the player
let player = {
    x : 80,
    y : 270,
    width : 100,
    height : 100, 
    xChange : 3.5, 
    yChange : 3.5, 
}
let bullets = [];
let moveLeft = false;
let moveRight = false;
let moveDown = false;
let moveUp = false;
let space = false;

// Set up counter and timer
let counter = 0;
const timeLimit = 60;


window.addEventListener('click', function(e){
    console.log(e.x, e.y);
})

document.addEventListener("DOMContentLoaded", init, false)

function init() {
    canvas = document.querySelector("canvas")
    context = canvas.getContext("2d")

    
    window.addEventListener("keydown", activate, false)
    window.addEventListener("keyup", deactivate, false)

    // add event listener to the restart button
    document
    .getElementById("restart-button")
    .addEventListener("click", restart, false);
    
    updateTimer();
    draw();
    
} 
function drawScore(){
    context.font = "20px Impact";
    context.fillStyle = "black";
    context.fillText("Score: " + score, 120, 740);
}

function drawHealth(){
    context.font = "20px Impact";
    context.fillStyle = "Black";
    context.fillText("HP:100/" + health, 200, 740);

}
function drawTimer() {
    context.font = "20px Impact";
    context.fillStyle = "Black";
    context.fillText("Time: " + remainingTime + "sec", 10, 740);
}

let restartButton = document.getElementById('restart-button');


function draw() {
    request = window.requestAnimationFrame(draw)
    let now = Date.now();
    let elapsed = now - then; 
    if (elapsed <= fpsInterval){
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    //play music
    document.getElementById("game-music").play();
    
    drawHealth();
    drawScore();
    drawTimer();
    // draw player
    context.drawImage(spongebob, player.x, player.y, player.width, player.height);
    //draw Treausure
    for (let t of treasure) {
        context.drawImage(treasureImage, t.x, t.y, t.width, t.height);
    }
    //draw enemy
    for (let a of enemy){   
        context.drawImage(plankton, a.x, a.y, a.width, a.height);
    }
    //draw burgers 
    for (let b of burgers){
        context.drawImage(burgerImage, b.x, b.y, b.width, b.height);
    }
    //spawn treasure
    if(treasure.length < 1){
        let t = {
            x: randint(0, 350),
            y: randint(0, canvas.height - 80), 
            width: 80, 
            height: 80, 
        };
        treasure.push(t);
    }
    //spawn burgers 
    if(burgers.length < 1){
        let b = {
            x: randint(0, 730),
            y: randint(0, canvas.height - 80), 
            width: 80, 
            height: 80, 
        };
        burgers.push(b);
    }

    //Action after player collision with burgers 
    for (let i = 0; i < burgers.length; i++){
        if(burgers_collides(burgers[i])){
            burgers.splice(i, 1);
            i--;
            health += 10;
            if (health > 100) {
                health = 100;
            }
            let b = { // create a new burgers with random position and dimensions
                x: randint(0, 730),
                y: randint(0, canvas.height - 80),
                width: 80,
                height: 80,
            };
            burgers.push(b);
        }
    }
    //Action after player collision with treasure 
    for (let i = 0; i < treasure.length; i++){
        if(treasure_collides(treasure[i])){
            treasure.splice(i, 1);
            i--;
            score += 10;
            let t = { // create a new treasure with random position and dimensions
                x: randint(0, 730),
                y: randint(0, canvas.height - 80),
                width: 80,
                height: 80,
            };
            treasure.push(t);
        }
    }
    
    // update bullet positions and check for collisions
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.direction === "right") {
          bullet.x += bullet.speed;
        }
        // check if bullet collides with an enemy
        for (let j = 0; j < enemy.length; j++) {
            let a = enemy[j];
            if (
              bullet.x + bullet.size >= a.x &&
              bullet.x <= a.x + a.width &&
              bullet.y + bullet.size >= a.y &&
              bullet.y <= a.y + a.height
            ) {
              enemy.splice(j, 1);
              bullets.splice(i, 1);
              break;
            }
          }
        // draw bullet
        context.drawImage(jellyImage, bullet.x, bullet.y, bullet.size, bullet.size);
        // remove bullet if it goes offscreen
        if (bullet.x < 0 || bullet.x > canvas.width) {
        bullets.splice(i, 1);
        break;
    }
  } 
  

    //Bullet
    if (space) {
        context.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    }
    // check if enemy has reached left side of canvas
    for (let a of enemy){
    if (a.x < 65 && a.y < 375){
        stop();
        return;
        }
    }
    //Action after player collision with enemies
    for (let i = 0; i < enemy.length; i++) {
        if (player_collides(enemy[i])) {
            health -= 10;
            enemy.splice(i, 1);
        }
        //Check for collision with treasure
        for (let j = 0; j < treasure.length; j++) {
        if (enemy_collides(enemy[i], treasure[j])) {
            score -= 10;
            treasure.splice(j, 1);
            j--;
        }
    }
    }
    //if statement for score
    if (score < -1){
        stop();
    }
    //If statement for health
    if (health < 10){
        stop();
    }
    //movement of enemies
    for (let a of enemy){
        if (a.x + a.width < 0){
            a.x = canvas.width;
            a.y = randint(0, canvas.height);
        } else {
            a.x = a.x + a.xChange;
            a.y = a.y + a.yChange;
        } 
    }
    //Player movement
    if (moveLeft && player.x > 0){
        player.x = player.x - player.xChange;
    }
    if (moveUp && player.y > 0){
        player.y = player.y - player.yChange;
    }
    if (moveDown && player.y < canvas.height - player.height){
        player.y = player.y + player.yChange;
    }
    if (moveRight && player.x < canvas.width - player.width){
        player.x = player.x + player.xChange;
    }
    if (space){
        fireBullet();
        return; 
    }
}

function shoot(){
    let bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 3.3,
        size: 30,
        speed: 7,
        damage: 1,
        direction: "right"
    };
    bullets.push(bullet);
}

function randint(min, max) {
    return Math.round(Math.random() * (max-min)) + min;
}

function updateTimer() {
    remainingTime -= 1;
    if (remainingTime <= 0) {
      stop();
      return;
    }
    setTimeout(updateTimer, 1000); // call this function again after 1 second
  }


function activate(event) {
    let key = event.key;
    if (key === "ArrowLeft"){
        moveLeft = true;
    } else if (key === "ArrowUp"){
        moveUp = true;
    } else if (key === "ArrowRight"){
        moveRight = true;
    } else if (key === "ArrowDown"){
        moveDown = true;
    } else if (key === " "){
        shoot();
    }
}
function deactivate(event) {
    let key = event.key;
    if (key === "ArrowLeft"){
        moveLeft = false;
    } else if (key === "ArrowUp"){
        moveUp = false;
    } else if (key === "ArrowRight"){
        moveRight = false;
    } else if (key === "ArrowDown"){
        moveDown = false;
    }
}

function player_collides(a) {
    if(player.x + player.width < a.x || 
        a.x + a.width < player.x ||
        player.y > a.y + a.height ||
        a.y > player.y + player.height){
            return false;
        } else {
            return true;
        }
}

function enemy_collides(enemy, treasure) {
    if(enemy.x + enemy.width < treasure.x || 
        treasure.x + treasure.width < enemy.x ||
        enemy.y > treasure.y + treasure.height ||
        treasure.y > enemy.y + enemy.height){
            return false;
        } else {
            return true;
        }
}

function treasure_collides(t){
    if(player.x + player.width < t.x || 
        t.x + t.width < player.x ||
        player.y > t.y + t.height ||
        t.y > player.y + player.height){
            return false;
        } else {
            return true;
        }
}

function burgers_collides(b){
    if(player.x + player.width < b.x || 
        b.x + b.width < player.x ||
        player.y > b.y + b.height ||
        b.y > player.y + player.height){
            return false;
        } else {
            return true;
        }
}


function stop() {
    window.removeEventListener("keydown", activate, false); 
    window.removeEventListener("keyup", deactivate, false);
    window.cancelAnimationFrame(request);
    //Game Over message
    context.font = "bold 48px Arial";
    context.fillStyle = "red";
    context.textAlign = "center";
    context.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 50);

    context.font = "bold 24px Arial";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText("Final Score: " + score, canvas.width/2, canvas.height/2 + 20);
    //game music stop
    document.getElementById("game-music").pause();
    document.getElementById("gameover-music").play(); 

    console.log("gameOver()");
}

function restart() {
    location.reload(); // reload the page
}
  

