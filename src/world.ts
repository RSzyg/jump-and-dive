import { Application, Container, Graphics, PointData, Polygon, Sprite, Texture } from 'pixi.js'
import type { BoundingRect, GroundInfo, WorldInfo } from './types'

const groundPieceSize = 50

const groundGraphics = new Graphics()
  .rect(0, 0, groundPieceSize, groundPieceSize)
  .fill('#415e54')

export class World {
  public container: Container
  public startPosition: PointData

  private app: Application
  private groundPieceTexture: Texture

  get entities() {
    return this.container.children
  }

  get entityBoundingRectList(): BoundingRect[] {
    return this.entities.map(entity => ({
      minX: entity.position.x,
      minY: entity.position.y,
      maxX: entity.position.x + entity.width,
      maxY: entity.position.y + entity.height,
      width: entity.width,
      height: entity.height
    }))
  }

  constructor(app: Application, mapInfo: WorldInfo) {
    this.container = new Container({ isRenderGroup: true })
    app.stage.addChild(this.container)
    
    this.groundPieceTexture = app.renderer.generateTexture(groundGraphics)

    this.app = app

    this.startPosition = {
      x: mapInfo.roleStart.x * groundGraphics.width,
      y: mapInfo.roleStart.y * groundGraphics.height
    }
    this.initGround(mapInfo.groundList)
  }

  private initGround(groundList: GroundInfo[]) {
    for (const ground of groundList) {
      this.generateGround(ground)
    }
  }

  private generateGround({ start, unitWidth, unitHeight }: GroundInfo) {
    const entity = new Sprite(this.groundPieceTexture)
    entity.width = unitWidth * groundPieceSize
    entity.height = unitHeight * groundPieceSize
    entity.position.set(start.x * groundPieceSize, start.y * groundPieceSize)
    this.container.addChild(entity)
  }
}
