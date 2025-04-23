use wasm_bindgen::prelude::*;

const NUM_ROWS: usize = 25;
const NUM_COLS: usize = 35;

#[wasm_bindgen]
pub struct Universe {
    grid: [[u8; NUM_COLS]; NUM_ROWS],
}

impl Default for Universe {
    fn default() -> Self {
        Universe {
            grid: [[0; NUM_COLS]; NUM_ROWS],
        }
    }
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Universe {
            grid: [[0; NUM_COLS]; NUM_ROWS],
        }
    }

    pub fn random(&mut self) {
        for i in 0..NUM_ROWS {
            for j in 0..NUM_COLS {
                self.grid[i][j] = if js_sys::Math::random() > 0.7 { 1 } else { 0 };
            }
        }
    }

    pub fn clear(&mut self) {
        self.grid = [[0; NUM_COLS]; NUM_ROWS];
    }

    pub fn toggle_cell(&mut self, row: usize, col: usize) {
        self.grid[row][col] ^= 1;
    }

    pub fn next_generation(&mut self) {
        let mut new_grid = [[0; NUM_COLS]; NUM_ROWS];

        for (i, row) in self.grid.iter().enumerate() {
            for (j, &cell) in row.iter().enumerate() {
                let neighbors = self.count_neighbors(i, j);

                new_grid[i][j] = match (cell, neighbors) {
                    (1, x) if x < 2 => 0, // 少于2个邻居，死亡
                    (1, 2) | (1, 3) => 1, // 2或3个邻居，存活
                    (1, _) => 0,          // 多于3个邻居，死亡
                    (0, 3) => 1,          // 恰好3个邻居，复活
                    (otherwise, _) => otherwise,
                };
            }
        }

        self.grid = new_grid;
    }

    pub fn get_grid(&self) -> Vec<u8> {
        self.grid.iter().flatten().cloned().collect()
    }

    fn count_neighbors(&self, row: usize, col: usize) -> u8 {
        let mut count = 0;
        for i in -1..=1 {
            for j in -1..=1 {
                if i == 0 && j == 0 {
                    continue;
                }

                let new_row = row as isize + i;
                let new_col = col as isize + j;

                if new_row >= 0
                    && new_row < NUM_ROWS as isize
                    && new_col >= 0
                    && new_col < NUM_COLS as isize
                {
                    count += self.grid[new_row as usize][new_col as usize];
                }
            }
        }
        count
    }
}
