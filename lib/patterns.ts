// 生命游戏经典图案库

export interface Pattern {
  name: string;
  description: string;
  grid: number[][];
  category: PatternCategory;
}

export enum PatternCategory {
  StillLife = "Still Life",
  Oscillator = "Oscillator",
  Spaceship = "Spaceship",
  Other = "Other",
}

// 静态图案
const block: Pattern = {
  name: "Block",
  description: "2x2 still life block",
  grid: [
    [1, 1],
    [1, 1],
  ],
  category: PatternCategory.StillLife,
};

const beehive: Pattern = {
  name: "Beehive",
  description: "Classic 6-cell still life pattern",
  grid: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  category: PatternCategory.StillLife,
};

const loaf: Pattern = {
  name: "Loaf",
  description: "7-cell still life pattern",
  grid: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
  ],
  category: PatternCategory.StillLife,
};

const boat: Pattern = {
  name: "Boat",
  description: "5-cell still life pattern",
  grid: [
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  category: PatternCategory.StillLife,
};

const tub: Pattern = {
  name: "Tub",
  description: "4-cell still life pattern",
  grid: [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  category: PatternCategory.StillLife,
};

// 振荡器
const blinker: Pattern = {
  name: "Blinker",
  description: "Simplest oscillator with period 2",
  grid: [[1], [1], [1]],
  category: PatternCategory.Oscillator,
};

const toad: Pattern = {
  name: "Toad",
  description: "6-cell oscillator with period 2",
  grid: [
    [0, 1, 1, 1],
    [1, 1, 1, 0],
  ],
  category: PatternCategory.Oscillator,
};

const beacon: Pattern = {
  name: "Beacon",
  description: "Classic oscillator with period 2",
  grid: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
  ],
  category: PatternCategory.Oscillator,
};

const pulsar: Pattern = {
  name: "Pulsar",
  description: "48-cell oscillator with period 3",
  grid: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  ],
  category: PatternCategory.Oscillator,
};

const pentadecathlon: Pattern = {
  name: "Pentadecathlon",
  description: "10-cell oscillator with period 15",
  grid: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  category: PatternCategory.Oscillator,
};

// 飞船
const glider: Pattern = {
  name: "Glider",
  description: "Smallest spaceship, moves diagonally",
  grid: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ],
  category: PatternCategory.Spaceship,
};

const lwss: Pattern = {
  name: "Lightweight Spaceship (LWSS)",
  description: "Lightweight spaceship, moves horizontally",
  grid: [
    [1, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
  ],
  category: PatternCategory.Spaceship,
};

const mwss: Pattern = {
  name: "Middleweight Spaceship (MWSS)",
  description: "Middleweight spaceship, moves horizontally",
  grid: [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1],
  ],
  category: PatternCategory.Spaceship,
};

const hwss: Pattern = {
  name: "Heavyweight Spaceship (HWSS)",
  description: "Heavyweight spaceship, moves horizontally",
  grid: [
    [0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1],
  ],
  category: PatternCategory.Spaceship,
};

// 其他有趣的图案
const gosperGliderGun: Pattern = {
  name: "Gosper Glider Gun",
  description: "First discovered infinite growth pattern",
  grid: [
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ],
  category: PatternCategory.Other,
};

const diehard: Pattern = {
  name: "Diehard",
  description: "Pattern that disappears after 130 steps",
  grid: [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1],
  ],
  category: PatternCategory.Other,
};

const acorn: Pattern = {
  name: "Acorn",
  description: "Pattern that stabilizes after 5206 steps",
  grid: [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1],
  ],
  category: PatternCategory.Other,
};

// 导出所有图案
export const patterns: Pattern[] = [
  // 静态图案
  block,
  beehive,
  loaf,
  boat,
  tub,

  // 振荡器
  blinker,
  toad,
  beacon,
  pulsar,
  pentadecathlon,

  // 飞船
  glider,
  lwss,
  mwss,
  hwss,

  // 其他
  gosperGliderGun,
  diehard,
  acorn,
];

// 按类别分组的图案
export const patternsByCategory = patterns.reduce((acc, pattern) => {
  if (!acc[pattern.category]) {
    acc[pattern.category] = [];
  }
  acc[pattern.category].push(pattern);
  return acc;
}, {} as Record<PatternCategory, Pattern[]>);

// 旋转图案（顺时针90度）
export function rotatePattern(pattern: number[][]): number[][] {
  const rows = pattern.length;
  const cols = pattern[0].length;
  const rotated = Array(cols)
    .fill(0)
    .map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = pattern[i][j];
    }
  }

  return rotated;
}

// 镜像图案（水平翻转）
export function mirrorPattern(pattern: number[][]): number[][] {
  return pattern.map((row) => [...row].reverse());
}
