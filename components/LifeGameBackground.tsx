"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { animate } from "motion";
import init, { Universe } from "life-game-core";
import useInterval from "./useInterval";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  XCircle,
  Globe,
} from "lucide-react";

const CELL_SIZE = 15; // 单元格大小 (px)
const ALIVE_COLOR = "#4A4A4A"; // 活细胞颜色 (深灰色)
const DEAD_COLOR = "#F5F5F5"; // 死细胞颜色 (浅灰色) // This is also the background color
// const GRID_COLOR = "#E2EBF0"; // 网格线颜色 (此颜色不再使用，但保留定义以防未来需要)
const CELL_PADDING = 1; // 细胞内边距，用于创建间隙
const INITIAL_SPEED = 150; // 游戏逻辑更新速度 (ms)
const ANIMATION_DURATION = 1; // 细胞动画时长 (ms)

interface CellAnimation {
  startTime: number;
  type: "appearing" | "disappearing";
}

export function LifeGameBackground() {
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
  const [grid, setGrid] = useState<Array<Array<number>>>([]);
  const [prevGrid, setPrevGrid] = useState<Array<Array<number>>>([]);
  const [cellAnimations, setCellAnimations] = useState<
    Array<Array<CellAnimation | null>>
  >([]);

  const universeRef = useRef<Universe | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [gameTickSpeed] = useState(INITIAL_SPEED);
  const [isRunning, setIsRunning] = useState(true); // 默认开始播放
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const calculateGridSize = useCallback(() => {
    const newCols = Math.floor(window.innerWidth / CELL_SIZE);
    const newRows = Math.floor(window.innerHeight / CELL_SIZE);
    return { rows: newRows, cols: newCols };
  }, []);

  const initializeGrids = useCallback((rows: number, cols: number) => {
    const emptyGrid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));
    const emptyAnimations = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));
    setGrid([...emptyGrid]);
    setPrevGrid([...emptyGrid]);
    setCellAnimations([...emptyAnimations]);
  }, []);

  const reinitializeUniverse = useCallback(
    (rows: number, cols: number) => {
      if (universeRef.current) {
        universeRef.current.free();
      }
      initializeGrids(rows, cols); // Initialize all grid-like states

      if (rows > 0 && cols > 0) {
        universeRef.current = new Universe(rows, cols);
        universeRef.current.random();
        const newGridData = universeRef.current.get_grid() as Array<
          Array<number>
        >;
        setGrid(newGridData);
        // prevGrid will be updated before the first simulation run
      }
    },
    [initializeGrids]
  );

  useEffect(() => {
    const newSize = calculateGridSize();
    setGridSize(newSize);

    init().then(() => {
      if (newSize.rows > 0 && newSize.cols > 0) {
        reinitializeUniverse(newSize.rows, newSize.cols);
      }
    });

    const handleResize = () => {
      const resized = calculateGridSize();
      setGridSize(resized);
      if (resized.rows > 0 && resized.cols > 0) {
        reinitializeUniverse(resized.rows, resized.cols);
      } else {
        initializeGrids(0, 0);
        if (universeRef.current) {
          universeRef.current.free();
          universeRef.current = null;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (universeRef.current) {
        universeRef.current.free();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [calculateGridSize, reinitializeUniverse, initializeGrids]);

  const runSimulation = useCallback(() => {
    if (
      !universeRef.current ||
      !gridSize.rows ||
      !gridSize.cols ||
      grid.length === 0 ||
      !isRunningRef.current // 检查是否正在运行
    ) {
      return;
    }

    // Store current grid as previous grid
    // setPrevGrid((currentGrid) => currentGrid.map((row) => [...row])); // Deep copy - prevGrid is now managed by core
    // No longer manually setting prevGrid here as core handles history for prev/next generation

    universeRef.current.next_generation();
    const newGridData = universeRef.current.get_grid() as Array<Array<number>>;

    setGrid(newGridData); // Update current grid

    // Update animations based on changes
    setCellAnimations((prevAnimations) => {
      const newAnimations = prevAnimations.map((row) =>
        row.map((cell) => (cell ? { ...cell } : null))
      ); // Deep copy
      for (let r = 0; r < gridSize.rows; r++) {
        for (let c = 0; c < gridSize.cols; c++) {
          const oldCellState = prevGrid[r]?.[c]; // Use optional chaining for safety during resize/init
          const newCellState = newGridData[r]?.[c];

          if (
            oldCellState !== undefined &&
            newCellState !== undefined &&
            oldCellState !== newCellState
          ) {
            newAnimations[r][c] = {
              startTime: Date.now(),
              type: newCellState === 1 ? "appearing" : "disappearing",
            };
          }
        }
      }
      return newAnimations;
    });
  }, [gridSize, universeRef, grid, prevGrid]); // Added grid and prevGrid to dependencies

  useInterval(() => {
    runSimulation();
  }, gameTickSpeed);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !gridSize.rows || !gridSize.cols) {
      animationFrameIdRef.current = requestAnimationFrame(drawCanvas);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayWidth = gridSize.cols * CELL_SIZE;
    const displayHeight = gridSize.rows * CELL_SIZE;
    const dpr = window.devicePixelRatio || 1;

    // Ensure canvas physical and logical sizes are set (important if they weren't set before)
    if (
      canvas.width !== displayWidth * dpr ||
      canvas.height !== displayHeight * dpr
    ) {
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr); // Scale only once after setting size
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight); // Clear canvas
    ctx.fillStyle = DEAD_COLOR; // Set background color
    ctx.fillRect(0, 0, displayWidth, displayHeight); // Fill background

    const currentTime = Date.now();

    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        const animation = cellAnimations[r]?.[c];
        const cellState = grid[r]?.[c];

        ctx.save(); // Save context state before applying alpha or transforms

        let alpha = 1;
        // let color = ALIVE_COLOR; // Default to alive color, alpha will handle visibility for dead cells
        const color = ALIVE_COLOR; // Default to alive color, alpha will handle visibility for dead cells

        if (animation) {
          const elapsedTime = currentTime - animation.startTime;
          // let progress = Math.min(1, elapsedTime / ANIMATION_DURATION);
          const progress = Math.min(1, elapsedTime / ANIMATION_DURATION);

          if (progress >= 1) {
            // Animation is complete
            // If animation is complete, treat as non-animated cell based on current grid state
            alpha = cellState === 1 ? 1 : 0;
            // color remains ALIVE_COLOR, alpha handles if it's drawn
          } else {
            // Animation is in progress
            if (animation.type === "appearing") {
              alpha = progress;
              // color remains ALIVE_COLOR
            } else {
              // disappearing
              alpha = 1 - progress;
              // color remains ALIVE_COLOR
            }
          }
        } else {
          // No animation, just draw based on current grid state
          alpha = cellState === 1 ? 1 : 0;
          // color remains ALIVE_COLOR
        }

        // Grid lines are no longer drawn

        if (alpha > 0.01) {
          // Changed threshold
          // Only draw if visible
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fillRect(
            c * CELL_SIZE + CELL_PADDING,
            r * CELL_SIZE + CELL_PADDING,
            CELL_SIZE - 2 * CELL_PADDING,
            CELL_SIZE - 2 * CELL_PADDING
          );
        }

        ctx.restore(); // Restore context state
      }
    }

    // Clean up finished animations (optional, but good practice)
    // This is tricky with React state. A better way might be to filter them out in runSimulation
    // or handle it when setting new animations.
    // For simplicity, we'll let new animations overwrite. If a cell stops changing, its animation will complete.

    animationFrameIdRef.current = requestAnimationFrame(drawCanvas);
  }, [grid, gridSize, cellAnimations, ANIMATION_DURATION]); // Added ANIMATION_DURATION

  useEffect(() => {
    // This effect replaces the old one that depended on [grid, gridSize]
    // It starts the animation loop.
    animationFrameIdRef.current = requestAnimationFrame(drawCanvas);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawCanvas]); // drawCanvas is memoized with useCallback

  useEffect(() => {
    if (canvasRef.current) {
      animate(canvasRef.current, { opacity: [0, 1] }, { duration: 1 });
    }
  }, []); // Run once on mount

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handlePrevGeneration = () => {
    if (universeRef.current && universeRef.current.has_history()) {
      setIsRunning(false); // Stop simulation when stepping
      universeRef.current.prev_generation();
      setGrid(universeRef.current.get_grid() as Array<Array<number>>);
    }
  };

  const handleNextGeneration = () => {
    if (universeRef.current) {
      setIsRunning(false); // Stop simulation when stepping
      universeRef.current.next_generation();
      setGrid(universeRef.current.get_grid() as Array<Array<number>>);
    }
  };

  const handleClear = () => {
    if (universeRef.current) {
      setIsRunning(false);
      universeRef.current.clear_history();
      universeRef.current.clear();
      setGrid(universeRef.current.get_grid() as Array<Array<number>>);
    }
  };

  const handleRandomize = () => {
    if (universeRef.current) {
      // setIsRunning(true); // Optionally start running after randomizing
      universeRef.current.clear_history();
      universeRef.current.random();
      setGrid(universeRef.current.get_grid() as Array<Array<number>>);
    }
  };

  // Update prevGrid when grid changes and not due to prev/next generation calls
  // This is important for animations if we are not relying on core's prev_grid for animation diffing
  useEffect(() => {
    // This effect ensures prevGrid is updated for animation diffing
    // when the grid changes for reasons other than stepping through history
    // (e.g., after randomize, clear, or during normal simulation ticks)
    // However, the current animation logic relies on diffing newGridData with prevGrid[r]?.[c]
    // which is updated in runSimulation.
    // For manual steps (prev/next), the animation might not be perfectly smooth
    // unless we also update prevGrid there or adjust animation logic.
    // For simplicity, we'll keep the current animation logic which might show abrupt changes on manual steps.
  }, [grid]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          opacity: 0, // Start with opacity 0, animation will take over
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          display: gridSize.rows > 0 && gridSize.cols > 0 ? "block" : "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          display: "flex",
          gap: "0.5rem",
          zIndex: 10,
        }}
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 text-white hover:bg-gray-700 p-2"
          onClick={handlePrevGeneration}
          disabled={!universeRef.current?.has_history()}
          title="Previous Generation"
        >
          <ArrowLeft size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 text-white hover:bg-gray-700 p-2"
          onClick={handlePlayPause}
          title={isRunning ? "Pause" : "Play"}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 text-white hover:bg-gray-700 p-2"
          onClick={handleNextGeneration}
          disabled={!universeRef.current}
          title="Next Generation"
        >
          <ArrowRight size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 text-white hover:bg-gray-700 p-2"
          onClick={handleClear}
          disabled={!universeRef.current}
          title="Clear"
        >
          <XCircle size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 text-white hover:bg-gray-700 p-2"
          onClick={handleRandomize}
          disabled={!universeRef.current}
          title="Randomize"
        >
          <Globe size={20} />
        </Button>
      </div>
    </>
  );
}
