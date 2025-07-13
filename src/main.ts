import { Application, Assets, Container, Graphics, MeshRope, Particle, ParticleContainer, Point, Sprite, Texture } from "pixi.js";

const moveSpeed = 6;
const rotationSpeed = 0.2;

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#96cf85", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("container")!.appendChild(app.canvas);

  let isArrowRightPressed = false;
  let isArrowLeftPressed = false;

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      isArrowRightPressed = true;
    }
    if (event.key === 'ArrowLeft') {
      isArrowLeftPressed = true
    }
  })
  window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowRight') {
      isArrowRightPressed = false;
    }
    if (event.key === 'ArrowLeft') {
      isArrowLeftPressed = false;
    }
  })

  const mainCircle = new Graphics()
    .circle(0, 0, 10)
    .fill("#000")
  const miniCircle = new Graphics()
    .circle(0, 0, 2)
    .fill("#fff");

  const initialPosition = new Point(app.screen.width / 2, app.screen.height / 2);

  const trailSize = 14;
  const trailTexture = app.renderer.generateTexture(mainCircle)
  const trailParticleContainer = new ParticleContainer({
    dynamicProperties: {
      position: true,
      scale: false,
      rotation: false,
      color: false,
    },
  });
  for (let i = 0; i < trailSize; i++) {
    const particle = new Particle({
      texture: trailTexture,
      x: initialPosition.x,
      y: initialPosition.y,
      scaleX: Math.max(1 - i * 0.07, 0.16),
      scaleY: Math.max(1 - i * 0.07, 0.16),
      anchorX: 0.5,
      anchorY: 0.5,
    });

    trailParticleContainer.addParticle(particle);
  }
  app.stage.addChild(trailParticleContainer);

  const roleContainer = new Container({ isRenderGroup: true });
  const body = mainCircle.clone();
  const leftHand = miniCircle.clone();
  const rightHand = miniCircle.clone();
  leftHand.position.set(-8, 0);
  rightHand.position.set(8, 0);
  roleContainer.addChild(body, leftHand, rightHand);

  const roleTexture = app.renderer.generateTexture(roleContainer);
  const role = new Sprite(roleTexture);
  role.anchor.set(0.5, 0.5);
  role.position.set(initialPosition.x, initialPosition.y);
  app.stage.addChild(role);

  const historyPositions: Point[] = [];
  for (let i = 0; i < trailSize; i++) {
    historyPositions.push(new Point(role.position.x, role.position.y));
  }

  // Listen for animate update
  app.ticker.add((time) => {
    // Handle move
    const moveDirection: -1 | 0 | 1 = isArrowLeftPressed ? -1 : isArrowRightPressed ? 1 : 0;
    role.position.x += moveDirection * moveSpeed * time.deltaTime;
    role.rotation += moveDirection * rotationSpeed * time.deltaTime;
    role.rotation %= Math.PI * 2; // Normalize rotation to [0, 2π)
    if (moveDirection === 0) {
      role.rotation = 0;
    }
    // Update trail particles
    for (let i = trailSize - 1; i > 0; i--) {
      const particle = trailParticleContainer.particleChildren[i];
      const nextParticle = trailParticleContainer.particleChildren[i - 1];
      particle.x = nextParticle.x;
      particle.y = nextParticle.y;
    }
    const lastParticle = trailParticleContainer.particleChildren[0];
    lastParticle.x = role.position.x;
    lastParticle.y = role.position.y;
  });
})();
