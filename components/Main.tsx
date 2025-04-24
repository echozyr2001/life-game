"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      const grid = [];
      for (let i = 0; i < gridSize.rows; i++) {
        grid.push(
          Array.from(
            flatArray.slice(i * gridSize.cols, (i + 1) * gridSize.cols)
          )
        );
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

  useInterval(() => {
    runSimulation();
  }, 150);

  const exists = (grid: number[][]) => {
    return grid.length > 0 && grid.some((row) => row.includes(1));
  };

  return (
    <div className="container text-center py-5">
      <h1 className="mb-8 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Game of Life
      </h1>

      <div className="my-4 flex justify-center gap-4">
        <div>
          <label>rows: </label>
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
          <label>cols: </label>
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
          width: "fit-content",
          margin: "0 auto",
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                if (universeRef.current) {
                  universeRef.current.toggle_cell(i, k);
                  setGrid(convertToGrid(universeRef.current.get_grid()));
                }
              }}
              style={{
                width: 15,
                height: 15,
                backgroundColor: grid[i][k] ? "#A0C4DB" : "#F8FAFC",
                border: "1px solid #E2EBF0",
                transition: "background-color 0.2s ease",
              }}
            ></div>
          ))
        )}
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
