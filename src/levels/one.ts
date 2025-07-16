import { WorldInfo } from "../types";

const info: WorldInfo = {
  roleStart: { x: 6, y: 2 },
  map: [
    ['o', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['o', 'o', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'o', 'o', 'o'],
    ['o', 'o', 'o', '-', '-', '-', '-', '-', '-', '-', '-', 'o', 'o', 'o'],
    ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
    ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
    ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
    ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
    ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
  ],
  groundList: [
    {
      start: { x: 0, y: 0 },
      unitWidth: 1,
      unitHeight: 8,
    },
    {
      start: { x: 1, y: 1 },
      unitWidth: 1,
      unitHeight: 7,
    },
    {
      start: { x: 2, y: 2 },
      unitWidth: 1,
      unitHeight: 6,
    },
    {
      start: { x: 3, y: 3 },
      unitWidth: 8,
      unitHeight: 5,
    },
    {
      start: { x: 11, y: 1 },
      unitWidth: 3,
      unitHeight: 7,
    }
  ]
};

export default info;