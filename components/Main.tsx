"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import init, { Universe } from "life-game-core";
import useInterval from "./useInterval";

const numRows = 25;
const numCols = 35;

export function Main() {
  const [grid, setGrid] = useState<number[][]>([]);
  const universeRef = useRef<Universe | null>(null);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    init().then(() => {
      universeRef.current = new Universe();
      universeRef.current.random();
      setGrid(convertToGrid(universeRef.current.get_grid()));
    });
  }, []);

  const convertToGrid = (flatArray: Uint8Array): number[][] => {
    const grid = [];
    for (let i = 0; i < numRows; i++) {
      grid.push(Array.from(flatArray.slice(i * numCols, (i + 1) * numCols)));
    }
    return grid;
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current || !universeRef.current) {
      return;
    }
    universeRef.current.next_generation();
    setGrid(convertToGrid(universeRef.current.get_grid()));
  }, []);

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
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
                backgroundColor: grid[i][k] ? "#DC143C" : "",
                border: "1px solid #595959",
              }}
            ></div>
          ))
        )}
      </div>

      <div className="buttons m-3 p-5">
        <button
          type="button"
          className={`inline-flex item-center text-white ${
            running
              ? "bg-orange-700 hover:bg-orange-800 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
              : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          }  focus:outline-none focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50`}
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
            }
          }}
          disabled={!exists(grid)}
        >
          <span className="icon">{running ? "Pause" : "Play"}</span>
          <span className="mx-1">{running ? "Pause" : "Start"}</span>
        </button>

        <button
          type="button"
          className={`inline-flex item-center text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 focus:outline-none focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2`}
          onClick={() => {
            if (universeRef.current) {
              universeRef.current.random();
              setGrid(convertToGrid(universeRef.current.get_grid()));
            }
          }}
        >
          <span className="icon">globe</span>
          <span className="mx-1">Random</span>
        </button>

        <button
          type="button"
          className={`inline-flex item-center text-white bg-cyan-700 hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800 focus:outline-none focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2`}
          onClick={() => {
            if (universeRef.current) {
              universeRef.current.clear();
              setGrid(convertToGrid(universeRef.current.get_grid()));
            }
          }}
        >
          <span className="icon">XCircle</span>
          <span className="mx-1">Clear</span>
        </button>
      </div>
    </div>
  );
}
