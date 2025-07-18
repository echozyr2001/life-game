use js_sys::Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    rows: usize,
    cols: usize,
    grid: Vec<Vec<u8>>,
    history: Vec<Vec<Vec<u8>>>, // 添加历史状态记录
}

impl Default for Universe {
    fn default() -> Self {
        Universe {
            rows: 25,
            cols: 25,
            grid: vec![vec![0; 25]; 25],
            history: Vec::new(), // 初始化历史记录
        }
    }
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: Option<usize>, cols: Option<usize>) -> Self {
        let rows = rows.unwrap_or(25);
        let cols = cols.unwrap_or(25);
        Universe {
            rows,
            cols,
            grid: vec![vec![0; cols]; rows],
            history: Vec::new(), // 初始化历史记录
        }
    }

    pub fn random(&mut self) {
        for row in &mut self.grid {
            for cell in row {
                *cell = if js_sys::Math::random() > 0.7 { 1 } else { 0 };
            }
        }
    }

    pub fn clear(&mut self) {
        self.grid = vec![vec![0; self.cols]; self.rows];
    }

    // 清空历史记录
    pub fn clear_history(&mut self) {
        self.history.clear();
    }

    pub fn toggle_cell(&mut self, row: usize, col: usize) {
        if row < self.rows && col < self.cols {
            self.grid[row][col] ^= 1;
        }
    }

    pub fn next_generation(&mut self) {
        // 保存当前状态到历史
        self.history.push(self.grid.clone());
        // 限制历史记录长度，避免内存占用过大
        if self.history.len() > 100 {
            self.history.remove(0);
        }

        let mut new_grid = vec![vec![0; self.cols]; self.rows];

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

    // 回退到上一步
    pub fn prev_generation(&mut self) -> bool {
        if let Some(prev_grid) = self.history.pop() {
            self.grid = prev_grid;
            return true;
        }
        false
    }

    // 检查是否有历史可回退
    pub fn has_history(&self) -> bool {
        !self.history.is_empty()
    }

    pub fn get_grid(&self) -> Array {
        let outer_array = Array::new_with_length(self.rows as u32);

        for (i, row) in self.grid.iter().enumerate() {
            let row_array = Array::new_with_length(self.cols as u32);
            for (j, &cell) in row.iter().enumerate() {
                row_array.set(j as u32, JsValue::from_f64(cell as f64));
            }
            outer_array.set(i as u32, row_array.into());
        }

        outer_array
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
                    && new_row < self.rows as isize
                    && new_col >= 0
                    && new_col < self.cols as isize
                {
                    count += self.grid[new_row as usize][new_col as usize];
                }
            }
        }
        count
    }
}
