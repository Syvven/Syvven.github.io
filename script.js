const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c_canvas = document.getElementById('collision-canvas');
const c_ctx = c_canvas.getContext('2d');
c_canvas.width = window.innerWidth;
c_canvas.height = window.innerHeight;

let gameSpeed = 1.0;
const slider = document.getElementById('slider');
slider.value = gameSpeed;

let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let baseRavenInterval = 500;
let ravenInterval = 500;
let lastTime = 0;

console.log(lastTime);

const num_images = 23;
let sounds = [];
for (let i = 1; i <= num_images; i++) {
    let sound = 'sounds/' + i + '.mp3';
    sounds.push(sound);
}
console.log(sounds);

let ravens = [];
class Raven {
    constructor() {
        this.spriteWidth = 687;
        this.spriteHeight = 786;
        this.sizeModifier = Math.random() * 0.6 + 0.6;
        this.width = this.spriteWidth * 0.3 * this.sizeModifier;
        this.height = this.spriteHeight * 0.3 * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionXbase = Math.random() * 5 + 3;
        this.directionX = this.directionXbase * gameSpeed;
        this.directionYbase = Math.random() * 5 - 2.5;
        this.directionY = this.directionYbase;
        this.markedForDeath = false;
        this.image = new Image();
        this.image.src = 'images/fly.png';
        this.frame = 0;
        this.maxFrame = 3;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 25;
        this.randomColors = [
            Math.floor(Math.random() * 255), 
            Math.floor(Math.random() * 255), 
            Math.floor(Math.random() * 255)
        ];
        this.color = 'rgb(' + this.randomColors[0] + ',' +
                              this.randomColors[1] + ',' +
                              this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }

    update(dt) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeath = true;

        this.timeSinceFlap += dt;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            // if (this.hasTrail) {
            //     for (let i = 0; i < 5; i++) {
            //         particles.push(new Particle(this.x, this.y, this.width-10, this.color));
            //     }
            // } 
        }
        if (this.x < 0 - this.width) gameOver = true;
    }

    draw() {
        c_ctx.fillStyle = this.color;
        c_ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }

    updateSpeed() {
        this.directionX = this.directionXbase * gameSpeed;
        this.directionY = this.directionYbase * gameSpeed;
    }
}

// let explosions = [];
// class Explosion {
//     constructor(x, y, size) {
//         this.image = new Image();
//         this.image.src = 'images/boom.png';
//         this.spriteWidth = 200;
//         this.spriteHeight = 179;
//         this.size = size;
//         this.x = x;
//         this.y = y;
//         this.frame = 0;
//         this.sound = new Audio();
//         this.sound.src = sounds[Math.floor(Math.random() * (num_images-1))];
        
//         this.timeSinceLastFrame = 0;
//         this.frameInterval = 200;
//         this.markedForDeath = false;
//     }

//     update(dt) {
//         if (this.frame == 0) {
//             this.sound.play();
//         }
//         this.timeSinceLastFrame += dt;
//         if (this.timeSinceLastFrame > this.frameInterval) {
//             this.timeSinceLastFrame = 0;
//             this.frame++;
//             if (this.frame > 5) this.markedForDeath = true;
//         }
//     }

//     draw() {
//         ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, 
//                       this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
//     }
// }

let splats = [];
class Splat {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'images/splat_sheet_1.png';
        this.spriteWidth = 771;
        this.spriteHeight = 387;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = sounds[Math.floor(Math.random() * (num_images-1))];
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.timeUntilFade = 1000;
        this.fade = false;
        this.markedForDeath = false;
    }

    update(dt) {
        if (this.frame == 0) {
            this.sound.play();
        }
        this.timeSinceLastFrame += dt;
        if (this.timeSinceLastFrame > this.timeUntilFade) this.fade = true;
        if (this.timeSinceLastFrame > this.frameInterval && this.fade) {
            this.timeSinceLastFrame = 0;
            this.frame++;
            if (this.frame > 5) this.markedForDeath = true;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, 
                      this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}

// let particles = [];
// class Particle {
//     constructor(x, y, size, color) {
//         this.size = size;
//         this.x = x + this.size * 0.5 + Math.random() * 50 - 25;
//         this.y = y + this.size * 0.333 + Math.random() * 50 - 25;
//         this.radius = Math.random() * this.size * 0.05;
//         this.maxRadius = Math.random() * 10 + 25;
//         this.markedForDeath = false;
//         this.speedX = Math.random() * 1 + 0.5;
//         this.color = color;
//     }

//     update() {
//         this.x += this.speedX;
//         this.radius += 0.5;
//         if (this.radius > this.maxRadius - 5) this.markedForDeath = true;
//     }

//     draw() {
//         ctx.save();
//         ctx.globalAlpha = 1 - this.radius / this.maxRadius;
//         ctx.beginPath();
//         ctx.fillStyle = this.color;
//         ctx.arc(this.x, this.y, this.radius , 0, Math.PI * 2);
//         ctx.fill();
//         ctx.restore();
//     }
// }

function drawSpeed() {
    ctx.fillStyle = 'black';
    ctx.fillText('Game Speed: ' + gameSpeed, canvas.width/2 - 90, 65)
    ctx.fillStyle = 'green';
    ctx.fillText('Game Speed: ' + gameSpeed, canvas.width/2 - 90 + 5, 70);
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75)
    ctx.fillStyle = 'green';
    ctx.fillText('Score: ' + score, 55, 80);
}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER!', canvas.width/2, canvas.height/2);
    ctx.fillText('Your Score Is ' + score, canvas.width/2, canvas.height/2 + 55);

    ctx.fillStyle = 'green';
    ctx.fillText('GAME OVER!', canvas.width/2 + 5, canvas.height/2 + 5);
    ctx.fillText('Your Score Is ' + score, canvas.width/2 + 5, canvas.height/2 + 5 + 55);
}

window.addEventListener('click', function(e) {
    const pixelColor = c_ctx.getImageData(e.x, e.y, 1, 1);
    const pc = pixelColor.data;
    ravens.forEach(obj => {
        if (obj.randomColors[0] == pc[0] &&
            obj.randomColors[1] == pc[1] &&
            obj.randomColors[2] == pc[2]) {
                obj.markedForDeath = true;
                score++;
                // explosions.push(new Explosion(obj.x-20, obj.y+20, obj.width));
                splats.push(new Splat(obj.x-30, obj.y+40, obj.width));
        }
    });
});

window.addEventListener('touchstart', function(e) {
    e.preventDefault();
}, {passive: false});

window.addEventListener('touchend', function(e) {
    const rect = canvas.getBoundingClientRect();
    console.log(15);
    console.log(e);
    const cssX = e.touches[0].clientX - rect.left;
    const cssY = e.touches[0].clientY - rect.top;
    const pixelX = cssX * canvas.width  / rect.width;
    const pixelY = cssY * canvas.height / rect.height;
    const pixelColor = c_ctx.getImageData(pixelX, pixelY, 1, 1);
    const pc = pixelColor.data;
    ravens.forEach(obj => {
        if (obj.randomColors[0] == pc[0] &&
            obj.randomColors[1] == pc[1] &&
            obj.randomColors[2] == pc[2]) {
                obj.markedForDeath = true;
                score++;
                // explosions.push(new Explosion(obj.x-20, obj.y+20, obj.width));
                splats.push(new Splat(obj.x-30, obj.y+40, obj.width));
        }
    });
});

slider.addEventListener('change', function(e) {
    gameSpeed = e.target.value;
    ravens.forEach(rav => rav.updateSpeed());
    ravenInterval = baseRavenInterval * 1/gameSpeed;
});

function animate(timestamp) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    c_ctx.clearRect(0,0,canvas.width,canvas.height);

    let dt = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += dt;

    if (timeToNextRaven >= ravenInterval) {
        timeToNextRaven = 0;
        ravens.push(new Raven());
        ravens.sort((obj1, obj2) => {
            return obj1.width - obj2.width;
        });
    }

    drawScore();
    drawSpeed();

    [/*...particles,*/ ...splats, ...ravens, /*, ...explosions*/].forEach(obj => obj.update(dt));
    [/*...particles,*/ ...splats, ...ravens, /*, ...explosions*/].forEach(obj => obj.draw());
    ravens = ravens.filter(rav => !rav.markedForDeath);
    // explosions = explosions.filter(exp => !exp.markedForDeath);
    splats = splats.filter(exp => !exp.markedForDeath);
    // particles = particles.filter(part => !part.markedForDeath);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}
animate(0);