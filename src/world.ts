import { Application, Container, Graphics, PointData, Polygon, Sprite, Texture } from "pixi.js";
import { GroundInfo, LevelInfo } from "./types";

const groundPieceSize = 50;

const groundGraphics = new Graphics()
  .rect(0, 0, groundPieceSize, groundPieceSize)
  .fill('#415e54')

export class World {
  public container: Container;
  public startPosition: PointData;

  private app: Application;
  private groundPieceTexture: Texture;

  get entities() {
    return this.container.children;
  }

  constructor(app: Application, mapInfo: LevelInfo) {
    this.container = new Container({ isRenderGroup: true });
    app.stage.addChild(this.container);
    
    this.groundPieceTexture = app.renderer.generateTexture(groundGraphics);

    this.app = app;

    this.startPosition = {
      x: mapInfo.start.x * groundGraphics.width,
      y: mapInfo.start.y * groundGraphics.height
    };
    this.initGround(mapInfo.groundList);
  }

  private initGround(groundList: GroundInfo[]) {
    console.log(groundList);
    // const separatedMapList = this.separateMap(originalMap);
    for (const ground of groundList) {
      this.generateGround(ground);
    }
  }

  private generateGround({ map, edge }: GroundInfo) {
    console.log(map);
    let startX = Infinity;
    let startY = Infinity;
    const entityContainer = new Container({ isRenderGroup: true });
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === '-') {
          continue;
        }
        const piece = new Sprite(this.groundPieceTexture);
        piece.position.set(x * piece.width, y * piece.height);
        entityContainer.addChild(piece);

        startX = Math.min(startX, x);
        startY = Math.min(startY, y);
      }
    }
    const entity = new Sprite(this.app.renderer.generateTexture(entityContainer));
    entity.position.set(startX * groundPieceSize, startY * groundPieceSize);
    this.container.addChild(entity);

    // Generate edge
    const groundEdge: PointData[] = edge.map(({ x, y }) => ({ x: x * groundPieceSize, y: y * groundPieceSize }));
    entity.hitArea = new Polygon(groundEdge);
  }

  // private separateMap(originalMap: LevelInfo['map']) {
  //   const height = originalMap.length;
  //   const width = originalMap[0].length;

  //   const visited = new Array(originalMap.length).fill(0).map(() => new Array(originalMap[0].length).fill(false));

  //   const separatedMapList: LevelInfo['map'][] = [];

  //   function dfs(x: number, y: number, separatedMap: LevelInfo['map']) {
  //     if (
  //       x < 0 ||
  //       x >= width ||
  //       y < 0 ||
  //       y >= height ||
  //       originalMap[y][x] === '-' ||
  //       visited[y][x]
  //     ) {
  //       return;
  //     } 
  //     separatedMap[y][x] = 'o';
  //     visited[y][x] = true;
  //     dfs(x - 1, y, separatedMap);
  //     dfs(x + 1, y, separatedMap);
  //     dfs(x, y - 1, separatedMap);
  //     dfs(x, y + 1, separatedMap);
  //   }

  //   for (let y = 0; y < originalMap.length; y++) {
  //     for (let x = 0; x < originalMap[0].length; x++) {
  //       if (originalMap[y][x] === '-' || visited[y][x]) {
  //         continue;
  //       }

  //       const separatedMap: LevelInfo['map'] = new Array(originalMap.length).fill(0).map(() => new Array(originalMap[0].length).fill('-'));
  //       dfs(x, y, separatedMap);
  //       separatedMapList.push(separatedMap);
  //     }
  //   }

  //   return separatedMapList;
  // }
}
