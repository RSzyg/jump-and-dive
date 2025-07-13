import { AnimatedSprite, Application, Container, Particle, ParticleContainer, Point, PointData, Renderer, Texture, Ticker } from "pixi.js";
import { mainCircle, miniCircle } from "./graphics";
import { sharedUserInput } from "./useUserInput";

const trailSize = 14;

const moveAcceleration = 1;
const maxMoveSpeed = 6;
const jumpSpeed = -12;
const animationSpeed = 0.6;
const gravity = 0.6;

function createRole(renderer: Renderer, initialPosition: PointData): AnimatedSprite {
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

function createTrail(renderer: Renderer, initialPosition: PointData): ParticleContainer {
  const trailTexture = renderer.generateTexture(mainCircle)
  const trailParticleContainer = new ParticleContainer({
    dynamicProperties: {
      position: true,
      scale: false,
      rotation: false,
      color: false,
    },
  });
  for (let i = 1; i <= trailSize; i++) {
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

  private canJump: boolean = true;
  public isJumping: boolean = true;
  public velocity: Point = new Point(0, 0);

  constructor(app: Application, initialPosition: PointData) {
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
    const { isArrowLeftPressed, isArrowRightPressed, isArrowUpPressed } = sharedUserInput;
    // Handle horizontal movement with constant speed
    if (
      (isArrowLeftPressed() && isArrowRightPressed()) ||
      (!isArrowLeftPressed() && !isArrowRightPressed())
    ) {
      this.velocity.x = 0;
    } else if (isArrowRightPressed()) {
      this.velocity.x = Math.min(this.velocity.x + moveAcceleration * ticker.deltaTime, maxMoveSpeed);
    } else if (isArrowLeftPressed()) {
      this.velocity.x = Math.max(this.velocity.x - moveAcceleration * ticker.deltaTime, -maxMoveSpeed);
    }
    this.roleMainPart.position.x += this.velocity.x * ticker.deltaTime;

    // Handle vertical movement with constant acceleration
    if (!isArrowUpPressed()) {
      this.canJump = true;
    }
    if (this.isJumping) {
      this.velocity.y += gravity * ticker.deltaTime;
      if (this.velocity.y < 0 && !isArrowUpPressed()) {
        this.velocity.y += 2 * gravity * ticker.deltaTime;
      }
    }
    if (!this.isJumping && this.canJump && isArrowUpPressed()) {
      this.velocity.y = jumpSpeed;
      this.isJumping = true;
      this.canJump = false;
    }
    this.roleMainPart.position.y += this.velocity.y * ticker.deltaTime;

    // Handle sprite animation
    if (this.velocity.x > 0) {
      this.roleMainPart.animationSpeed = animationSpeed;
      this.roleMainPart.play();
    } else if (this.velocity.x < 0) {
      this.roleMainPart.animationSpeed = -animationSpeed;
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
