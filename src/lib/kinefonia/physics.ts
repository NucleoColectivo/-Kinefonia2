export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  hue: number;

  constructor(x: number, y: number, hue: number, velocityMult = 1, flowX = 0, flowY = 0) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 5 * velocityMult + flowX * 25;
    this.vy = (Math.random() - 0.5) * 5 * velocityMult + flowY * 25;
    this.life = 1.0;
    this.decay = Math.random() * 0.01 + 0.005;
    this.hue = hue;
  }

  update(decayMult = 1, gravity = 0) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += gravity * 0.1;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= this.decay * decayMult;
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${this.life})`;
    ctx.beginPath();
    const size = Math.max(0, 2.5 * this.life);
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class MeshPoint {
  baseX: number;
  baseY: number;
  baseZ: number;
  currentZ: number;
  velocityZ: number;
  targetZ: number;

  constructor(x: number, y: number, z: number) {
    this.baseX = x;
    this.baseY = y;
    this.baseZ = z;
    this.currentZ = z;
    this.velocityZ = 0;
    this.targetZ = 0;
  }

  update(tension = 0.03, dampening = 0.93) {
    const displacement = this.currentZ - this.baseZ - this.targetZ;
    const force = -tension * displacement;
    this.velocityZ += force;
    this.velocityZ *= dampening;
    this.currentZ += this.velocityZ;
    this.targetZ *= 0.9;
  }

  applyForce(f: number) {
    this.velocityZ += f;
  }
}

export class Neuron {
  x: number;
  y: number;
  energy: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.energy = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const radius = 1 + this.energy * 4;
    const alpha = 0.2 + this.energy * 0.8;
    ctx.fillStyle = `hsla(200, 100%, 70%, ${alpha})`;
    ctx.strokeStyle = `hsla(200, 100%, 90%, ${this.energy * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
