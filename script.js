let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// 设置画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.015;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.radius = Math.random() * 50;
        this.expansion = 1;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.life -= 0.01;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        effectTypes[currentEffectType].draw(this, ctx);
        ctx.restore();
    }
}

// 存储粒子和鼠标位置
let particles = [];
let mouse = {
    x: null,
    y: null,
    lastX: null,
    lastY: null
};

// 效果配置
let currentHue = 0;
let currentEffectType = 'circle';
let currentSoundType = 'sine';

// 粒子效果类型
const effectTypes = {
    ink: {
        draw: (particle, ctx) => {
            particle.size *= 1.01;
            particle.alpha *= 0.98;
            
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加水墨晕染效果
            if (Math.random() < 0.3) {
                const splatterSize = particle.size * 0.3;
                const splatterDistance = particle.size * 0.8;
                const angle = Math.random() * Math.PI * 2;
                const splatterX = particle.x + Math.cos(angle) * splatterDistance;
                const splatterY = particle.y + Math.sin(angle) * splatterDistance;
                
                const splatterGradient = ctx.createRadialGradient(
                    splatterX, splatterY, 0,
                    splatterX, splatterY, splatterSize
                );
                splatterGradient.addColorStop(0, particle.color);
                splatterGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = splatterGradient;
                ctx.beginPath();
                ctx.arc(splatterX, splatterY, splatterSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    circle: {
        draw: (particle, ctx) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    star: {
        draw: (particle, ctx) => {
            const spikes = 5;
            const outerRadius = particle.size;
            const innerRadius = particle.size / 2;
            let rot = Math.PI / 2 * 3;
            let x = particle.x;
            let y = particle.y;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(x, y - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = particle.x + Math.cos(rot) * outerRadius;
                y = particle.y + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = particle.x + Math.cos(rot) * innerRadius;
                y = particle.y + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(particle.x, particle.y - outerRadius);
            ctx.closePath();
            ctx.fill();
        }
    },
    square: {
        draw: (particle, ctx) => {
            ctx.fillRect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2);
        }
    },
    spiral: {
        draw: (particle, ctx) => {
            particle.angle += particle.rotationSpeed;
            const x = particle.x + Math.cos(particle.angle) * particle.radius;
            const y = particle.y + Math.sin(particle.angle) * particle.radius;
            ctx.beginPath();
            ctx.arc(x, y, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    explosion: {
        draw: (particle, ctx) => {
            particle.radius *= 1.02;
            const x = particle.x + Math.cos(particle.angle) * particle.radius;
            const y = particle.y + Math.sin(particle.angle) * particle.radius;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    firework: {
        draw: (particle, ctx) => {
            particle.speedY += 0.05; // 重力效果
            const trail = 5;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - particle.speedX * trail, particle.y - particle.speedY * trail);
            ctx.stroke();
        }
    },
    lightning: {
        draw: (particle, ctx) => {
            const segments = 3;
            let lastX = particle.x;
            let lastY = particle.y;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            for (let i = 0; i < segments; i++) {
                const nextX = lastX + (Math.random() - 0.5) * 20;
                const nextY = lastY + particle.size * 2;
                ctx.lineTo(nextX, nextY);
                lastX = nextX;
                lastY = nextY;
            }
            ctx.stroke();
        }
    },
    ripple: {
        draw: (particle, ctx) => {
            particle.radius *= 1.01;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size / 2;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    neon: {
        draw: (particle, ctx) => {
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    flame: {
        draw: (particle, ctx) => {
            particle.size *= 0.95;
            particle.y -= 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.quadraticCurveTo(
                particle.x + particle.size, particle.y + particle.size * 2,
                particle.x, particle.y + particle.size * 4
            );
            ctx.quadraticCurveTo(
                particle.x - particle.size, particle.y + particle.size * 2,
                particle.x, particle.y
            );
            ctx.fill();
        }
    },
    galaxy: {
        draw: (particle, ctx) => {
            particle.angle += particle.rotationSpeed;
            particle.radius += Math.sin(particle.life) * 0.5;
            const x = particle.x + Math.cos(particle.angle) * particle.radius;
            const y = particle.y + Math.sin(particle.angle) * particle.radius;
            ctx.beginPath();
            ctx.arc(x, y, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    quantum: {
        draw: (particle, ctx) => {
            particle.life -= 0.01;
            const wave = Math.sin(particle.life * Math.PI * 2) * 5;
            ctx.beginPath();
            ctx.arc(particle.x + wave, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    aurora: {
        draw: (particle, ctx) => {
            particle.angle += 0.02;
            const wave = Math.sin(particle.angle) * 20;
            const gradient = ctx.createLinearGradient(
                particle.x, particle.y - particle.size,
                particle.x, particle.y + particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x + wave, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

// 音效类型
const soundTypes = {
    sine: { type: 'sine', baseFrequency: 220, multiplier: 2 },
    square: { type: 'square', baseFrequency: 110, multiplier: 1.5 },
    triangle: { type: 'triangle', baseFrequency: 440, multiplier: 1 },
    piano: { type: 'sine', baseFrequency: 440, multiplier: 1.2 },
    drum: { type: 'square', baseFrequency: 55, multiplier: 0.8 },
    electronic: { type: 'sawtooth', baseFrequency: 330, multiplier: 1.8 },
    orchestra: { type: 'sine', baseFrequency: 880, multiplier: 0.5 },
    bell: { type: 'sine', baseFrequency: 1760, multiplier: 0.3 },
    wind: { type: 'sine', baseFrequency: 110, multiplier: 0.7 },
    water: { type: 'sine', baseFrequency: 165, multiplier: 0.6 },
    crystal: { type: 'sine', baseFrequency: 2200, multiplier: 0.2 },
    space: { type: 'sine', baseFrequency: 55, multiplier: 1.5 },
    laser: { type: 'square', baseFrequency: 1100, multiplier: 2.5 }
};

let colors = [
    `hsl(${currentHue}, 100%, 50%)`,
    `hsl(${currentHue + 30}, 100%, 50%)`,
    `hsl(${currentHue + 60}, 100%, 50%)`
];

// 更新颜色
function updateColors() {
    colors = [
        `hsl(${currentHue}, 100%, 50%)`,
        `hsl(${currentHue + 30}, 100%, 50%)`,
        `hsl(${currentHue + 60}, 100%, 50%)`
    ];
}

// 更换颜色
let isBlackBackground = true;

function changeColor() {
    isBlackBackground = !isBlackBackground;
    document.body.style.backgroundColor = isBlackBackground ? 'black' : 'white';
}

// 切换粒子效果
function changeEffectType(type) {
    if (type && effectTypes[type]) {
        currentEffectType = type;
    }
}

// 切换音效类型
function changeSoundType(type) {
    if (type && soundTypes[type]) {
        currentSoundType = type;
    }
}

// 清除画布
function clearCanvas() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles = [];
}

// 音频上下文和音效设置
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundMusic = null;
let musicPlaying = false;

// 创建音效
function createSound(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    const soundConfig = soundTypes[currentSoundType];
    oscillator.type = soundConfig.type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 根据移动速度生成音效
function generateSoundFromMovement(distance) {
    const soundConfig = soundTypes[currentSoundType];
    const frequency = soundConfig.baseFrequency + (distance * soundConfig.multiplier);
    createSound(frequency);
}

// 加载并播放背景音乐
function loadBackgroundMusic(url) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            if (backgroundMusic) {
                backgroundMusic.stop();
            }
            backgroundMusic = audioContext.createBufferSource();
            backgroundMusic.buffer = audioBuffer;
            backgroundMusic.connect(audioContext.destination);
            backgroundMusic.loop = true;
            backgroundMusic.start();
            musicPlaying = true;
        })
        .catch(error => console.error('Error loading audio:', error));
}

// 切换背景音乐
function toggleBackgroundMusic() {
    if (!musicPlaying) {
        loadBackgroundMusic('https://cdn.jsdelivr.net/gh/anars/blank-audio/1-minute-of-silence.mp3');
        document.getElementById('toggleMusic').textContent = '停止音乐';
    } else {
        if (backgroundMusic) {
            backgroundMusic.stop();
        }
        document.getElementById('toggleMusic').textContent = '播放音乐';
    }
    musicPlaying = !musicPlaying;
}

// 更新鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (mouse.lastX !== null && mouse.lastY !== null) {
        const dx = mouse.x - mouse.lastX;
        const dy = mouse.y - mouse.lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const numParticles = Math.floor(distance / 2);

        // 生成音效
        if (distance > 5) { // 只在移动速度超过阈值时生成音效
            generateSoundFromMovement(distance);
        }

        for (let i = 0; i < numParticles; i++) {
            const x = mouse.lastX + (dx * i / numParticles);
            const y = mouse.lastY + (dy * i / numParticles);
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color));
        }
    }
});

// 动画循环
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    // 自动更新颜色
    currentHue = (currentHue + 0.2) % 360;
    updateColors();

    requestAnimationFrame(animate);
}

// 开始动画
animate();