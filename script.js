window.addEventListener('load', e => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // THESE ARE THE PROBLEM RN
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 
    ///////////////////////////

    const c_canvas = document.getElementById('collision-canvas');
    const c_ctx = c_canvas.getContext('2d');
    c_canvas.width = window.innerWidth;
    c_canvas.height = window.innerHeight;

    let gameSpeed = 1.0;
    const slider = document.getElementById('slider');
    const slide_container = document.getElementById('container');
    const slide_rect = slide_container.getBoundingClientRect();
    slider.value = gameSpeed;

    // console.log(gameSpeed);
    // const button = document.getElementById('button');
    // button.onclick = function(){ 
    //     window.location.reload();
    // }; 

    let score = 0;
    let gameOver = false;
    ctx.font = '2vw Impact';

    let timeToNextRaven = 0;
    let baseRavenInterval = 500;
    let ravenInterval = 500;
    let lastTime = 0;

    let widthRatio = canvas.width/2560;
    let heightRatio = canvas.height/1440;

    const num_images = 23;
    let sounds = [];
    for (let i = 1; i <= num_images; i++) {
        let sound = 'sounds/' + i + '.mp3';
        sounds.push(sound);
    }

    let ravens = [];
    class Raven {
        constructor() {
            this.spriteWidth = 687;
            this.spriteHeight = 786;
            this.sizeModifier = Math.random() * 0.6 + 0.6;
            this.width = this.spriteWidth * 0.3 * this.sizeModifier * widthRatio;
            this.height = this.spriteHeight * 0.3 * this.sizeModifier * heightRatio;
            this.x = canvas.width;
            this.y = Math.random() * (canvas.height - this.height);
            this.directionXbase = (Math.random() * 5 + 3) * widthRatio;
            this.directionX = this.directionXbase * gameSpeed;
            this.directionYbase = (Math.random() * 5 - 2.5) * heightRatio;
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
                Math.floor(Math.random() * 255),
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

        mobile_update(dt) {
            let random = Math.random();
            if (this.frame == 0 && random > 0.999) {   
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
        ctx.fillText('Game Speed: ' + gameSpeed, slide_rect.left - (30 * widthRatio), slide_rect.top/1.5)
        ctx.fillStyle = 'green';
        ctx.fillText('Game Speed: ' + gameSpeed, slide_rect.left - (30 * widthRatio) + (5 * widthRatio), slide_rect.top/1.5 + (5 * heightRatio));
        return [slide_rect.left - (30 * widthRatio), slide_rect.top/1.5]
    }

    function drawScore() {
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + score, 50 * (widthRatio), 75 * (heightRatio))
        ctx.fillStyle = 'green';
        ctx.fillText('Score: ' + score, 55 * (widthRatio), 80 * (heightRatio));

        return [50 * (widthRatio), 75 * (heightRatio)]
    }

    function drawGameOver() {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText('GAME OVER!', canvas.width/2, canvas.height/2);
        ctx.fillText('Your Score Is ' + score, canvas.width/2, canvas.height/2 + (55 * heightRatio));

        ctx.fillStyle = 'green';
        ctx.fillText('GAME OVER!', canvas.width/2 + (5 * widthRatio), canvas.height/2 + (5 * heightRatio));
        ctx.fillText('Your Score Is ' + score, canvas.width/2 + (5 * widthRatio), canvas.height/2 + (60 * heightRatio));
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
                    splats.push(new Splat(obj.x-(30*widthRatio), obj.y+(40*heightRatio), obj.width));
            }
        });
    });

    window.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const cssX = (e.changedTouches[0].screenX || e.touches[0].screenX);
        const cssY = (e.changedTouches[0].screenY || e.touches[0].screenY);
        const pixelX = Math.floor(cssX * canvas.width  / rect.width);
        const pixelY = Math.floor(cssY * canvas.height / rect.height);
        const pixelColor = c_ctx.getImageData(pixelX, pixelY, 1, 1);
        const pc = pixelColor.data;
        ravens.forEach(obj => {
            if (obj.randomColors[0] == pc[0] &&
                obj.randomColors[1] == pc[1] &&
                obj.randomColors[2] == pc[2]) {
                    obj.markedForDeath = true;
                    score++;
                    // explosions.push(new Explosion(obj.x-20, obj.y+20, obj.width));
                    splats.push(new Splat(obj.x-(30*widthRatio), obj.y+(40*heightRatio), obj.width));
            }
        });
    });

    // window.addEventListener('touchend', function(e) {
    //     const rect = canvas.getBoundingClientRect();
    //     const cssX = (e.changedTouches[0].screenX || e.touches[0].screenX);
    //     const cssY = (e.changedTouches[0].screenY || e.touches[0].screenY);
    //     const pixelX = Math.floor(cssX * canvas.width  / rect.width);
    //     const pixelY = Math.floor(cssY * canvas.height / rect.height);
    //     console.log(pixelX, pixelY);
    //     const pixelColor = c_ctx.getImageData(pixelX, pixelY, 1, 1);
    //     console.log(pixelColor);
    //     const pc = pixelColor.data;
    //     console.log(pixelColor.data);
    //     ravens.forEach(obj => {
    //         if (obj.randomColors[0] == pc[0] &&
    //             obj.randomColors[1] == pc[1] &&
    //             obj.randomColors[2] == pc[2]) {
    //                 obj.markedForDeath = true;
    //                 score++;
    //                 // explosions.push(new Explosion(obj.x-20, obj.y+20, obj.width));
    //                 splats.push(new Splat(obj.x-(30*widthRatio), obj.y+(40*heightRatio), obj.width));
    //         }
    //     });
    // });

    slider.addEventListener('change', function(e) {
        gameSpeed = e.target.value;
        ravens.forEach(rav => rav.updateSpeed());
        ravenInterval = baseRavenInterval * 1/gameSpeed;
    });

    // prevent scrolling from outside of input field
    window.addEventListener('touchstart', function(e) {
        if (e.target.nodeName !== 'INPUT') {
            e.preventDefault();
        }
    });

    // prevent scrolling from within input field
    window.addEventListener('touchmove', function(e) {
        if (e.target.nodeName == 'INPUT') {
            e.preventDefault();
        }
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

        let one = drawScore();
        let two = drawSpeed();

        [/*...particles,*/ ...splats, ...ravens, /*, ...explosions*/].forEach(obj => obj.update(dt));
        [/*...particles,*/ ...splats, ...ravens, /*, ...explosions*/].forEach(obj => obj.draw());
        ravens = ravens.filter(rav => !rav.markedForDeath);
        // explosions = explosions.filter(exp => !exp.markedForDeath);
        splats = splats.filter(exp => !exp.markedForDeath);
        // particles = particles.filter(part => !part.markedForDeath);
        
        if (!gameOver) requestAnimationFrame(animate);
        else drawGameOver();
    }

    function mobile_animate(timestamp) {
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

        splats.forEach(obj => obj.mobile_update(dt));
        [/*...particles,*/...ravens, /*, ...explosions*/].forEach(obj => obj.update(dt));
        [/*...particles,*/ ...splats, ...ravens, /*, ...explosions*/].forEach(obj => obj.draw());
        ravens = ravens.filter(rav => !rav.markedForDeath);
        // explosions = explosions.filter(exp => !exp.markedForDeath);
        splats = splats.filter(exp => !exp.markedForDeath);
        // particles = particles.filter(part => !part.markedForDeath);
        if (!gameOver) requestAnimationFrame(mobile_animate);
        else drawGameOver();
    }

    window.mobileCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    if (!window.mobileCheck()) {
        animate(0);
    } else {
        mobile_animate(0);
    }
});


