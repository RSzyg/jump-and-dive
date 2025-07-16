import { PointData } from "pixi.js";

export type MapInfo = ('o' | '-')[][];

export interface GroundInfo {
  start: PointData;
  unitWidth: number;
  unitHeight: number;
}

export interface WorldInfo {
  roleStart: PointData;
  map: MapInfo;
  groundList: GroundInfo[];
}