"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import init, { Universe } from "life-game-core";
import useInterval from "./useInterval";
import { Globe, Pause, Play, XCircle } from "lucide-react";

export function Main() {
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 25 });
  const [tempGridSize, setTempGridSize] = useState({ rows: 25, cols: 25 });
  const [grid, setGrid] = useState<number[][]>([]);
  const universeRef = useRef<Universe | null>(null);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(150);

  const reinitializeUniverse = useCallback(() => {
    if (universeRef.current) {
      universeRef.current.free(); // 释放之前的实例
    }
    universeRef.current = new Universe(gridSize.rows, gridSize.cols);
    universeRef.current.random();
    setGrid(convertToGrid(universeRef.current.get_grid()));
  }, [gridSize]);

  useEffect(() => {
    init().then(() => {
      reinitializeUniverse();
    });
  }, [reinitializeUniverse]);

  const handleApplyGridSize = () => {
    if (running) {
      setRunning(false);
      runningRef.current = false;
    }
    setGridSize(tempGridSize);
  };

  const convertToGrid = useCallback(
    (flatArray: Uint8Array): number[][] => {
      const grid: number[][] = [];

      // 创建一个新的二维数组，初始值全为0
      for (let i = 0; i < gridSize.rows; i++) {
        grid[i] = new Array(gridSize.cols).fill(0);
      }

      // 填充实际数据
      const totalCells = Math.min(
        flatArray.length,
        gridSize.rows * gridSize.cols
      );
      for (let idx = 0; idx < totalCells; idx++) {
        const row = Math.floor(idx / gridSize.cols);
        const col = idx % gridSize.cols;
        if (row < gridSize.rows && col < gridSize.cols) {
          grid[row][col] = flatArray[idx];
        }
      }

      return grid;
    },
    [gridSize]
  );

  const runSimulation = useCallback(() => {
    if (!runningRef.current || !universeRef.current) {
      return;
    }
    universeRef.current.next_generation();
    setGrid(convertToGrid(universeRef.current.get_grid()));
  }, [convertToGrid]);

  // 根据网格大小动态调整速度
  useEffect(() => {
    const cellCount = gridSize.rows * gridSize.cols;
    const newSpeed = Math.max(50, Math.min(500, 150 + (cellCount - 625) / 10));
    setSpeed(newSpeed);
  }, [gridSize]);

  useInterval(() => {
    runSimulation();
  }, speed);

  // 使用 Canvas 渲染网格
  useEffect(() => {
    if (!canvasRef.current || !grid.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 15;
    const displayWidth = gridSize.cols * cellSize;
    const displayHeight = gridSize.rows * cellSize;

    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;

    // 设置 Canvas 的显示尺寸（CSS 尺寸）
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // 设置 Canvas 的实际尺寸（考虑像素比）
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // 根据像素比缩放绘图上下文
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    for (let i = 0; i < gridSize.rows; i++) {
      if (!grid[i]) continue; // 跳过不存在的行
      for (let j = 0; j < gridSize.cols; j++) {
        const cellValue = grid[i][j] || 0; // 如果单元格不存在，默认为0
        ctx.fillStyle = cellValue ? "#A0C4DB" : "#F8FAFC";
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#E2EBF0";
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [grid, gridSize]);

  // 处理 Canvas 点击事件
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !universeRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const cellSize = 15;

      // 计算点击位置相对于 Canvas 的坐标
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 计算对应的网格单元格
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
        universeRef.current.toggle_cell(row, col);
        setGrid(convertToGrid(universeRef.current.get_grid()));
      }
    },
    [gridSize, convertToGrid]
  );

  const exists = (grid: number[][]) => {
    return grid.length > 0 && grid.some((row) => row.includes(1));
  };

  return (
    <div className="container text-center py-5">
      <h1 className="mb-8 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Game of Life
      </h1>

      <div className="my-4 flex justify-center gap-4 flex-wrap items-center">
        <div>
          <label>Rows: </label>
          <input
            type="number"
            value={tempGridSize.rows}
            onChange={(e) =>
              setTempGridSize({
                ...tempGridSize,
                rows: Math.max(
                  5,
                  Math.min(100, parseInt(e.target.value) || 25)
                ),
              })
            }
            min="5"
            max="100"
            className="w-20 px-2 border rounded"
          />
        </div>
        <div>
          <label>Cols: </label>
          <input
            type="number"
            value={tempGridSize.cols}
            onChange={(e) =>
              setTempGridSize({
                ...tempGridSize,
                cols: Math.max(
                  5,
                  Math.min(100, parseInt(e.target.value) || 25)
                ),
              })
            }
            min="5"
            max="100"
            className="w-20 px-2 border rounded"
          />
        </div>
        <Button onClick={handleApplyGridSize} variant="outline">
          Apply
        </Button>
        <div className="ml-4 flex items-center gap-2">
          <label>Speed: </label>
          <Slider
            className="w-32"
            min={50}
            max={500}
            value={[500 - speed + 50]}
            onValueChange={(values) => {
              if (values.length > 0) {
                setSpeed(500 - values[0] + 50);
              }
            }}
          />
        </div>
      </div>

      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            border: "1px solid #E2EBF0",
            cursor: "pointer",
          }}
        />
      </div>

      <div className="buttons m-3 p-5 gap-8 flex justify-center">
        <Button
          variant={running ? "destructive" : "default"}
          size="lg"
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
            }
          }}
          disabled={!exists(grid)}
        >
          <span className="icon">{running ? <Pause /> : <Play />}</span>
          <span className="mx-1">{running ? "Pause" : "Start"}</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (universeRef.current) {
              universeRef.current.random();
              setGrid(convertToGrid(universeRef.current.get_grid()));
            }
          }}
        >
          <span className="icon">
            <Globe />
          </span>
          <span className="mx-1">Random</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            if (universeRef.current) {
              universeRef.current.clear();
              setGrid(convertToGrid(universeRef.current.get_grid()));
            }
          }}
        >
          <span className="icon">
            <XCircle />
          </span>
          <span className="mx-1">Clear</span>
        </Button>
      </div>
    </div>
  );
}
