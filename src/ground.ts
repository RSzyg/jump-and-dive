import { Application, Container, Polygon } from "pixi.js";
import { groundPiece } from "./graphics";

export function initializeGround(app: Application) {
  const ground = new Container({ isRenderGroup: true });

  for (let i = 0; i < 10; i++) {
    const piece = groundPiece.clone();
    piece.position.set(100 + i * piece.width, 400);
    ground.addChild(piece);
  }

  // for (let i = 1; i < 3; i++) {
  //   const piece = groundPiece.clone();
  //   piece.position.set(100 + 9 * piece.width, 400 - i * piece.height);
  //   ground.addChild(piece);
  // }

  app.stage.addChild(ground);

  // const groundEdge = new Polygon([
  //   { x: 100, y: 400 },
  //   { x: 100 + 9 * groundPiece.width, y: 400 },
  //   { x: 100 + 9 * groundPiece.width, y: 400 - 2 * groundPiece.height },
  //   { x: 100 + 10 * groundPiece.width, y: 400 - 2 * groundPiece.height },
  //   { x: 100 + 10 * groundPiece.width, y: 400 + groundPiece.height },
  //   { x: 100, y: 400 + groundPiece.height },
  // ]);
  // console.log('>>> groundEdge:', groundEdge.getBounds());
  // console.log('>>> is [100, 300] in groundEdge:', groundEdge.contains(100, 300), 'should be false');
  // console.log('>>> is [100, 400] in groundEdge:', groundEdge.contains(100, 400), 'should be true');
  // console.log('>>> is [110, 400] in groundEdge:', groundEdge.contains(110, 400), 'should be true');
  // console.log('>>> is [110, 410] in groundEdge:', groundEdge.contains(110, 410), 'should be true');
  // console.log('>>> is [510, 410] in groundEdge:', groundEdge.contains(510, 410), 'should be true');
  // console.log('>>> is [560, 410] in groundEdge:', groundEdge.contains(560, 410), 'should be true');
  // console.log('>>> is [510, 390] in groundEdge:', groundEdge.contains(510, 390), 'should be false');
  // console.log('>>> is [560, 310] in groundEdge:', groundEdge.contains(560, 310), 'should be true');
  // console.log('>>> is [540, 310] in groundEdge:', groundEdge.contains(540, 310), 'should be false');
  // ground.hitArea = groundEdge;

  return ground;
}