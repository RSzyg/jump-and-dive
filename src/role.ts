import { AnimatedSprite, Application, Container, Particle, ParticleContainer, Point, PointData, Renderer, Sprite, Texture, Ticker } from "pixi.js";
import { mainCircle, miniCircle } from "./graphics";
import { sharedUserInput } from "./useUserInput";

const trailSize = 14;

const moveSpeed = 6;
const rotationSpeed = 0.1;
const gravity = 10;

function createRole(renderer: Renderer, initialPosition: Point): AnimatedSprite {
  const roleContainer = new Container({ isRenderGroup: true });
  const body = mainCircle.clone();
  const leftHand = miniCircle.clone();
  const rightHand = miniCircle.clone();
  leftHand.position.set(0, 0);
  leftHand.pivot.set(8, 0);
  rightHand.position.set(0, 0);
  rightHand.pivot.set(-8, 0);
  roleContainer.addChild(body, leftHand, rightHand);

  const textures: Texture[] = [];
  const frames = 24; // Number of frames for the role animation
  for (let i = 0; i < frames; i++) {
    leftHand.rotation = (Math.PI * 2 * i) / frames;
    rightHand.rotation = (Math.PI * 2 * i) / frames;
    textures.push(renderer.generateTexture(roleContainer));
  }

  const sprite = new AnimatedSprite(textures);
  sprite.anchor.set(0.5, 0.5);
  sprite.position.copyFrom(initialPosition);

  return sprite
}

function createTrail(renderer: Renderer, initialPosition: Point): ParticleContainer {
  const trailTexture = renderer.generateTexture(mainCircle)
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

  return trailParticleContainer;
}

export class Role {
  private roleMainPart: AnimatedSprite;
  private trail: ParticleContainer;

  public isGrounded: boolean = false;
  public velocity: Point = new Point(0, 0);
  private radians: number = 0;

  constructor(app: Application, initialPosition: Point) {
    this.roleMainPart = createRole(app.renderer, initialPosition);
    this.trail = createTrail(app.renderer, initialPosition);

    app.stage.addChild(this.trail, this.roleMainPart);

    this.addTicker(app);
  }

  public getBounds() {
    return this.roleMainPart.getBounds();
  }

  public get position() {
    return this.roleMainPart.position;
  }

  private handleMovement(ticker: Ticker) {
    this.velocity.x = 0; // Reset velocity each frame
    this.velocity.y = this.isGrounded ? 0 : gravity * ticker.deltaTime; // Apply gravity

    const { isArrowLeftPressed, isArrowRightPressed } = sharedUserInput;
    if (isArrowRightPressed()) {
      this.velocity.x += moveSpeed * ticker.deltaTime;
      this.radians += rotationSpeed * ticker.deltaTime;
    }
    if (isArrowLeftPressed()) {
      this.velocity.x -= moveSpeed * ticker.deltaTime;
      this.radians -= rotationSpeed * ticker.deltaTime;
    }

    this.roleMainPart.position.x += this.velocity.x;
    this.roleMainPart.position.y += this.velocity.y;
    if (this.velocity.x > 0) {
      this.roleMainPart.animationSpeed = 0.6;
      this.roleMainPart.play();
    } else if (this.velocity.x < 0) {
      this.roleMainPart.animationSpeed = -0.6;
      this.roleMainPart.play();
    } else {
      this.roleMainPart.gotoAndStop(0);
    }
  }

  private handleTrailEffect() {
    for (let i = trailSize - 1; i > 0; i--) {
      const particle = this.trail.particleChildren[i];
      const nextParticle = this.trail.particleChildren[i - 1];
      particle.x = nextParticle.x;
      particle.y = nextParticle.y;
    }
    const lastParticle = this.trail.particleChildren[0];
    lastParticle.x = this.roleMainPart.position.x;
    lastParticle.y = this.roleMainPart.position.y;
  }

  private addTicker(app: Application) {
    app.ticker.add((ticker) => {
      this.handleMovement(ticker);
      this.handleTrailEffect();
    });
  }
}
