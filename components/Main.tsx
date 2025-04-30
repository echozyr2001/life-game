"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import init, { Universe } from "life-game-core";
import useInterval from "./useInterval";
import { PatternSelector } from "./PatternSelector";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Pause,
  Play,
  XCircle,
  Grid3X3,
} from "lucide-react";

export function Main() {
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 25 });
  const [tempGridSize, setTempGridSize] = useState({ rows: 25, cols: 25 });
  const [grid, setGrid] = useState<Array<Array<number>>>([]);
  const universeRef = useRef<Universe | null>(null);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(150);
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPattern, setDragPattern] = useState<number[][]>([]);
  const [dragPosition, setDragPosition] = useState({ row: 0, col: 0 });

  const reinitializeUniverse = useCallback(() => {
    if (universeRef.current) {
      universeRef.current.free(); // 释放之前的实例
    }
    universeRef.current = new Universe(gridSize.rows, gridSize.cols);
    universeRef.current.random();
    setGrid(universeRef.current.get_grid() as Array<Array<number>>);
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

  const runSimulation = useCallback(() => {
    if (!runningRef.current || !universeRef.current) {
      return;
    }
    universeRef.current.next_generation();
    setGrid(universeRef.current.get_grid() as Array<Array<number>>);
  }, []);

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

    // 绘制基本网格
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

    // 如果处于拖拽模式，绘制半透明的预览图案
    if (isDragging && dragPattern.length) {
      const patternRows = dragPattern.length;
      const patternCols = dragPattern[0].length;

      // 设置半透明效果
      ctx.globalAlpha = 0.6;

      for (let i = 0; i < patternRows; i++) {
        for (let j = 0; j < patternCols; j++) {
          const row = dragPosition.row + i;
          const col = dragPosition.col + j;

          // 确保在网格范围内
          if (
            row >= 0 &&
            row < gridSize.rows &&
            col >= 0 &&
            col < gridSize.cols
          ) {
            if (dragPattern[i][j]) {
              ctx.fillStyle = "#4B91F7"; // 使用不同颜色以区分
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
              ctx.strokeStyle = "#3B82F6";
              ctx.strokeRect(
                col * cellSize,
                row * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }
      }

      // 恢复透明度
      ctx.globalAlpha = 1.0;
    }
  }, [grid, gridSize, isDragging, dragPattern, dragPosition]);

  // 处理鼠标移动事件
  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const cellSize = 15;

      // 计算鼠标位置相对于 Canvas 的坐标
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 计算对应的网格单元格（网格吸附）
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      // 考虑图案大小，确保图案的左上角在有效位置
      const patternRows = dragPattern.length;
      const patternCols = dragPattern[0]?.length || 0;

      // 计算有效的放置位置（确保图案不会超出网格边界）
      const validRow = Math.min(Math.max(0, row), gridSize.rows - patternRows);
      const validCol = Math.min(Math.max(0, col), gridSize.cols - patternCols);

      setDragPosition({ row: validRow, col: validCol });
    },
    [isDragging, dragPattern, gridSize]
  );

  // 处理 Canvas 点击事件
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !universeRef.current) return;

      // 如果处于拖拽模式，放置图案
      if (isDragging && dragPattern.length) {
        const patternRows = dragPattern.length;
        const patternCols = dragPattern[0].length;

        // 清除历史记录
        universeRef.current.clear_history();

        // 放置图案
        for (let i = 0; i < patternRows; i++) {
          for (let j = 0; j < patternCols; j++) {
            const row = dragPosition.row + i;
            const col = dragPosition.col + j;

            // 确保在网格范围内
            if (
              row >= 0 &&
              row < gridSize.rows &&
              col >= 0 &&
              col < gridSize.cols
            ) {
              // 如果图案中的单元格为活细胞，则设置对应位置为活细胞
              if (dragPattern[i][j] === 1) {
                // 如果当前单元格状态与要设置的状态不同，则切换
                if (grid[row][col] !== 1) {
                  universeRef.current.toggle_cell(row, col);
                }
              }
            }
          }
        }

        // 更新网格
        setGrid(universeRef.current.get_grid() as Array<Array<number>>);

        // 退出拖拽模式
        setIsDragging(false);
        setDragPattern([]);
        return;
      }

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
        setGrid(universeRef.current.get_grid() as Array<Array<number>>);
      }
    },
    [gridSize, isDragging, dragPattern, dragPosition, grid]
  );

  // 处理开始拖拽
  const handleStartDragging = useCallback(
    (pattern: number[][]) => {
      setIsDragging(true);
      setDragPattern(pattern);

      // 初始化拖拽位置（居中）
      const patternRows = pattern.length;
      const patternCols = pattern[0].length;
      const startRow = Math.max(
        0,
        Math.floor((gridSize.rows - patternRows) / 2)
      );
      const startCol = Math.max(
        0,
        Math.floor((gridSize.cols - patternCols) / 2)
      );

      setDragPosition({ row: startRow, col: startCol });
    },
    [gridSize]
  );

  // 处理选中的图案（直接放置，不拖拽）
  const handleSelectPattern = useCallback(
    (pattern: number[][]) => {
      if (!universeRef.current) return;

      // 计算放置图案的起始位置（居中放置）
      const patternRows = pattern.length;
      const patternCols = pattern[0].length;
      const startRow = Math.max(
        0,
        Math.floor((gridSize.rows - patternRows) / 2)
      );
      const startCol = Math.max(
        0,
        Math.floor((gridSize.cols - patternCols) / 2)
      );

      // 清除历史记录
      universeRef.current.clear_history();

      // 放置图案
      for (let i = 0; i < patternRows; i++) {
        for (let j = 0; j < patternCols; j++) {
          const row = startRow + i;
          const col = startCol + j;
          if (row < gridSize.rows && col < gridSize.cols) {
            // 如果图案中的单元格为活细胞，则设置对应位置为活细胞
            if (pattern[i][j] === 1) {
              universeRef.current.toggle_cell(row, col);
            }
          }
        }
      }

      // 更新网格
      setGrid(universeRef.current.get_grid() as Array<Array<number>>);
    },
    [gridSize]
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
          onMouseMove={handleCanvasMouseMove}
          style={{
            border: "1px solid #E2EBF0",
            cursor: isDragging ? "crosshair" : "pointer",
          }}
        />
      </div>

      {showPatternSelector && (
        <PatternSelector
          onSelectPattern={handleSelectPattern}
          onStartDragging={handleStartDragging}
          onClose={() => setShowPatternSelector(false)}
        />
      )}

      <div className="buttons m-3 p-5 gap-4 flex justify-center flex-wrap">
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
              universeRef.current.clear_history(); // 清空历史
              universeRef.current.random();
              setGrid(universeRef.current.get_grid() as Array<Array<number>>);
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
              universeRef.current.clear_history(); // 清空历史
              universeRef.current.clear();
              setGrid(universeRef.current.get_grid() as Array<Array<number>>);
            }
          }}
        >
          <span className="icon">
            <XCircle />
          </span>
          <span className="mx-1">Clear</span>
        </Button>

        {/* 单步后退按钮 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (
              universeRef.current &&
              universeRef.current.has_history &&
              universeRef.current.has_history()
            ) {
              universeRef.current.prev_generation();
              setGrid(universeRef.current.get_grid() as Array<Array<number>>);
            }
          }}
          disabled={
            !universeRef.current ||
            !universeRef.current.has_history ||
            !universeRef.current.has_history()
          }
        >
          <span className="icon">
            <ArrowLeft />
          </span>
          <span className="mx-1">Step Back</span>
        </Button>

        {/* 单步前进按钮 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (universeRef.current) {
              universeRef.current.next_generation();
              setGrid(universeRef.current.get_grid() as Array<Array<number>>);
            }
          }}
          disabled={!exists(grid)}
        >
          <span className="icon">
            <ArrowRight />
          </span>
          <span className="mx-1">Step Forward</span>
        </Button>

        {/* 添加经典图案按钮 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowPatternSelector(true)}
        >
          <span className="icon">
            <Grid3X3 />
          </span>
          <span className="mx-1">Add classic patterns</span>
        </Button>
      </div>
    </div>
  );
}
