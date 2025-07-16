import { PointData } from "pixi.js";

export interface GroundInfo {
  map: ('o' | '-')[][];
  edge: PointData[];
}

export interface LevelInfo {
  start: PointData;
  groundList: GroundInfo[];
}