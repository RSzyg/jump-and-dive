import { Application, Container, Graphics, PointData, Sprite, Texture } from "pixi.js";
import { MapInfo } from "./types";

const groundPiece = new Graphics()
  .rect(0, 0, 50, 50)
  .fill('#415e54')

export class Ground {
  public container: Container;
  public startPosition: PointData;

  private app: Application;
  private groundPieceTexture: Texture;

  get entities() {
    return this.container.children;
  }

  constructor(app: Application, mapInfo: MapInfo) {
    this.container = new Container({ isRenderGroup: true });
    app.stage.addChild(this.container);
    
    this.groundPieceTexture = app.renderer.generateTexture(groundPiece);

    this.app = app;

    this.startPosition = {
      x: mapInfo.start.x * groundPiece.width,
      y: mapInfo.start.y * groundPiece.height
    };
    this.initGround(mapInfo.map);
  }

  private dfs(map: MapInfo['map'], separatedMap: MapInfo['map'], record: boolean[][], x: number, y: number) {
    if (
      x < 0 || x >= map[0].length ||
      y < 0 || y >= map.length
    ) {
      return;
    } 
    if (map[y][x] === '-') {
      return;
    }
    if (record[y][x]) {
      return;
    }
    separatedMap[y][x] = 'o';
    record[y][x] = true;
    this.dfs(map, separatedMap, record, x - 1, y);
    this.dfs(map, separatedMap, record, x + 1, y);
    this.dfs(map, separatedMap, record, x, y - 1);
    this.dfs(map, separatedMap, record, x, y + 1);
  }

  private initGround(map: MapInfo['map']) {
    console.log(map);
    const record = new Array(map.length).fill(0).map(() => new Array(map[0].length).fill(false));

    const separatedMapList: MapInfo['map'][] = [];

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (record[y][x]) {
          continue;
        }
        if (map[y][x] === '-') {
          continue;
        }

        const separatedMap: MapInfo['map'] = new Array(map.length).fill(0).map(() => new Array(map[0].length).fill('-'));
        console.log(JSON.stringify(separatedMap));
        this.dfs(map, separatedMap, record, x, y);
        separatedMapList.push(separatedMap);
      }
    }
    
    for (const ground of separatedMapList) {
      const groundContainer = new Container({ isRenderGroup: true });
      for (let y = 0; y < ground.length; y++) {
        for (let x = 0; x < ground[0].length; x++) {
          if (ground[y][x] === '-') {
            continue;
          }
          const piece = new Sprite(this.groundPieceTexture);
          piece.position.set(x * piece.width, y * piece.height);
          groundContainer.addChild(piece);
        }
      }
      const texture = this.app.renderer.generateTexture(groundContainer);
      const sprite = new Sprite(texture);
      this.container.addChild(sprite);
    }
  }
}
