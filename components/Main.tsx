"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import init, { Universe } from "life-game-core";
import useInterval from "./useInterval";
import { Globe, Pause, Play, XCircle } from "lucide-react";

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
