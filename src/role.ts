import { AnimatedSprite, Application, Container, Graphics, Particle, ParticleContainer, Point, PointData, Renderer, Texture, Ticker } from "pixi.js";
import { sharedUserInput } from "./useUserInput";
import { getLinearSmooth } from "./smooth";

const roleBodySize = 16;
const roleHandSize = 4;

const trailSize = 40;
const trailRemainder = 6;
const minTrailSizeScale = 0.18;
const historyPositionSize = 14;

const moveAcceleration = 0.5;
const maxMoveSpeed = 5;
const jumpSpeed = -12;
const animationSpeed = 0.6;
const gravity = 0.6;

function createRole(renderer: Renderer, initialPosition: PointData): AnimatedSprite {
  const body = new Graphics().circle(0, 0, roleBodySize / 2).fill("#000")
  const leftHand = new Graphics().circle(0, 0, roleHandSize / 2).fill("#fff");
  leftHand.pivot.set((roleBodySize - roleHandSize) / 2, 0);
  const rightHand = leftHand.clone();
  rightHand.pivot.set(-(roleBodySize - roleHandSize) / 2, 0);

  const roleContainer = new Container({ isRenderGroup: true });
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
  const circle = new Graphics().circle(0, 0, roleBodySize / 2).fill("#000")
  const trailTexture = renderer.generateTexture(circle)
  const trailParticleContainer = new ParticleContainer({
    dynamicProperties: {
      position: true,
      scale: false,
      rotation: false,
      color: false,
    },
  });
  const diff = (1 - minTrailSizeScale) / (trailSize - trailRemainder)
  for (let i = 1; i <= trailSize; i++) {
    const particle = new Particle({
      texture: trailTexture,
      x: initialPosition.x,
      y: initialPosition.y,
      scaleX: Math.max(1 - i * diff, minTrailSizeScale),
      scaleY: Math.max(1 - i * diff, minTrailSizeScale),
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

  private historyXPositions: number[] = [];
  private historyYPositions: number[] = [];

  private canJump: boolean = true;
  public isJumping: boolean = true;
  public velocity: Point = new Point(0, 0);

  constructor(app: Application, initialPosition: PointData) {
    this.roleMainPart = createRole(app.renderer, initialPosition);
    this.trail = createTrail(app.renderer, initialPosition);

    for (let i = 0; i < historyPositionSize; i++) {
      this.historyXPositions.push(initialPosition.x);
      this.historyYPositions.push(initialPosition.y);
    }

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

    // Update history positions
    this.historyXPositions.pop();
    this.historyXPositions.unshift(this.roleMainPart.position.x);
    this.historyYPositions.pop();
    this.historyYPositions.unshift(this.roleMainPart.position.y);
  }

  private handleTrailEffect() {
    const particleCount = this.trail.particleChildren.length;
    for (let i = 0; i < particleCount; i++) {
      this.trail.particleChildren[i].x = getLinearSmooth(this.historyXPositions, (i / particleCount) * this.historyXPositions.length);
      this.trail.particleChildren[i].y = getLinearSmooth(this.historyYPositions, (i / particleCount) * this.historyYPositions.length);
    }
  }

  private addTicker(app: Application) {
    app.ticker.add((ticker) => {
      this.handleMovement(ticker);
      this.handleTrailEffect();
    });
  }
}
