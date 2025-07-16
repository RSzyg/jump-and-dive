import { AnimatedSprite, Application, Container, Graphics, Particle, ParticleContainer, Point, PointData, Renderer, Texture, Ticker } from "pixi.js";
import { sharedUserInput } from "./useUserInput";
import { getLinearSmooth } from "./smooth";
import { World } from "./world";

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

function createRole(renderer: Renderer): AnimatedSprite {
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
  private world: World;

  private roleMainPart: AnimatedSprite;
  private trail: ParticleContainer;

  private nextPosition: Point;
  private historyXPositions: number[] = [];
  private historyYPositions: number[] = [];

  private canJump: boolean = true;
  public isGrounded: boolean = false;
  public velocity: Point = new Point(0, 0);

  constructor(app: Application, world: World) {
    this.world = world;
    this.roleMainPart = createRole(app.renderer);
    this.roleMainPart.position.copyFrom(world.startPosition);
    this.trail = createTrail(app.renderer, world.startPosition);

    this.nextPosition = new Point();
    for (let i = 0; i < historyPositionSize; i++) {
      this.historyXPositions.push(world.startPosition.x);
      this.historyYPositions.push(world.startPosition.y);
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

  private updateMovementInfo(ticker: Ticker) {
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
    this.nextPosition.x = this.roleMainPart.position.x + this.velocity.x * ticker.deltaTime;

    // Handle vertical movement with constant acceleration
    if (!isArrowUpPressed()) {
      this.canJump = true;
    }
    if (!this.isGrounded) {
      this.velocity.y += gravity * ticker.deltaTime;
      if (this.velocity.y < 0 && !isArrowUpPressed()) {
        this.velocity.y += 2 * gravity * ticker.deltaTime;
      }
    }
    if (this.isGrounded && this.canJump && isArrowUpPressed()) {
      this.velocity.y = jumpSpeed;
      this.isGrounded = false;
      this.canJump = false;
    }
    this.nextPosition.y = this.roleMainPart.position.y + this.velocity.y * ticker.deltaTime;
  }

  private handleMovement() {
    // Update current position
    this.position.copyFrom(this.nextPosition);
    // Update history positions
    this.historyXPositions.pop();
    this.historyXPositions.unshift(this.position.x);
    this.historyYPositions.pop();
    this.historyYPositions.unshift(this.position.y);

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
    const particleCount = this.trail.particleChildren.length;
    for (let i = 0; i < particleCount; i++) {
      this.trail.particleChildren[i].x = getLinearSmooth(this.historyXPositions, (i / particleCount) * this.historyXPositions.length);
      this.trail.particleChildren[i].y = getLinearSmooth(this.historyYPositions, (i / particleCount) * this.historyYPositions.length);
    }
  }

  private predictCollision() {
    const roleBounds = this.getBounds();
    const deltaX = this.nextPosition.x - this.position.x;
    const deltaY = this.nextPosition.y - this.position.y;

    let isCollided = { x: false, y: false };
    for (const ground of this.world.entities) {
      const groundBounds = ground.getBounds();
      
      // Check X-Axis
      if (
        roleBounds.minX + deltaX < groundBounds.maxX &&
        roleBounds.maxX + deltaX > groundBounds.minX &&
        roleBounds.minY  < groundBounds.maxY &&
        roleBounds.maxY > groundBounds.minY
      ) {
        isCollided.x = true;
        this.velocity.x = 0;
        if (deltaX > 0) {
          this.nextPosition.x = groundBounds.minX - roleBounds.width / 2;
        } else if (deltaX < 0) {
          this.nextPosition.x = groundBounds.maxX + roleBounds.width / 2;
        }
      }

      // Check Y-Axis
      if (
        roleBounds.minX < groundBounds.maxX &&
        roleBounds.maxX > groundBounds.minX &&
        roleBounds.minY + deltaY < groundBounds.maxY &&
        roleBounds.maxY + deltaY > groundBounds.minY
      ) {
        isCollided.y = true;
        this.isGrounded = true;
        this.velocity.y = 0;
        this.nextPosition.y = groundBounds.minY - roleBounds.height / 2;
      }

      // Handle move outside the edge of ground
      if (!isCollided.y) {
        this.isGrounded = false;
      }
    }
  }

  private addTicker(app: Application) {
    app.ticker.add((ticker) => {
      this.updateMovementInfo(ticker);
      this.predictCollision();
      this.handleMovement();
      this.handleTrailEffect();
    });
  }
}
