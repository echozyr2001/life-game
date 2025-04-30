"use client";

import { useState, useEffect, useRef } from "react";
import {
  Pattern,
  PatternCategory,
  patternsByCategory,
  rotatePattern,
  mirrorPattern,
} from "@/lib/patterns";
import { Button } from "@/components/ui/button";
import { RotateCw, FlipHorizontal, X } from "lucide-react";

interface PatternSelectorProps {
  onSelectPattern: (pattern: number[][]) => void;
  onStartDragging: (pattern: number[][]) => void;
  onClose: () => void;
}

export function PatternSelector({
  onSelectPattern,
  onStartDragging,
  onClose,
}: PatternSelectorProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<PatternCategory | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [currentPattern, setCurrentPattern] = useState<number[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初始化选择第一个类别
  useEffect(() => {
    const categories = Object.keys(patternsByCategory) as PatternCategory[];
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [selectedCategory]);

  // 当选择图案时，设置当前图案
  useEffect(() => {
    if (selectedPattern) {
      setCurrentPattern(selectedPattern.grid);
    }
  }, [selectedPattern]);

  // 渲染图案预览
  useEffect(() => {
    if (!canvasRef.current || !currentPattern.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxPreviewSize = 300; // 预览的最大尺寸
    const rows = currentPattern.length;
    const cols = currentPattern[0].length;

    // 动态计算单元格大小，确保图案完全适应预览区域
    const cellSizeX = Math.floor(maxPreviewSize / cols);
    const cellSizeY = Math.floor(maxPreviewSize / rows);
    const cellSize = Math.max(5, Math.min(cellSizeX, cellSizeY, 15)); // 最小5px，最大15px

    // 计算实际显示尺寸
    const width = cols * cellSize;
    const height = rows * cellSize;

    // 设置Canvas尺寸
    canvas.width = width;
    canvas.height = height;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制图案
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = currentPattern[i][j] ? "#A0C4DB" : "#F8FAFC";
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#E2EBF0";
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [currentPattern]);

  // 旋转当前图案
  const handleRotate = () => {
    if (currentPattern.length) {
      setCurrentPattern(rotatePattern(currentPattern));
    }
  };

  // 镜像当前图案
  const handleMirror = () => {
    if (currentPattern.length) {
      setCurrentPattern(mirrorPattern(currentPattern));
    }
  };

  // 应用选中的图案
  const handleApply = () => {
    if (currentPattern.length) {
      onStartDragging(currentPattern);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Choose a pattern</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* 类别选择 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {Object.keys(patternsByCategory).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category as PatternCategory)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 图案网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {selectedCategory &&
            patternsByCategory[selectedCategory].map((pattern) => (
              <div
                key={pattern.name}
                className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                  selectedPattern?.name === pattern.name
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedPattern(pattern)}
              >
                <h3 className="font-medium mb-1">{pattern.name}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {pattern.description}
                </p>
                <div className="flex justify-center">
                  <PatternPreview pattern={pattern.grid} />
                </div>
              </div>
            ))}
        </div>

        {/* 预览和操作 */}
        {selectedPattern && (
          <div className="border-t pt-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div>
                <h3 className="text-lg font-medium mb-2">Preview</h3>
                <div className="border rounded p-3 bg-gray-50">
                  <div
                    className="flex justify-center items-center"
                    style={{
                      maxWidth: "300px",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{
                        border: "1px solid #E2EBF0",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRotate}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Rotate
                  </Button>
                  <Button variant="outline" onClick={handleMirror}>
                    <FlipHorizontal className="mr-2 h-4 w-4" />
                    Mirror
                  </Button>
                </div>
                <Button onClick={handleApply}>Apply Pattern</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 小型图案预览组件
function PatternPreview({ pattern }: { pattern: number[][] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maxPreviewSize = 120; // 预览的最大尺寸

  useEffect(() => {
    if (!canvasRef.current || !pattern.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = pattern.length;
    const cols = pattern[0].length;

    // 动态计算单元格大小，确保图案完全适应预览区域
    // 计算水平和垂直方向的单元格大小，取较小值确保完全显示
    const cellSizeX = Math.floor(maxPreviewSize / cols);
    const cellSizeY = Math.floor(maxPreviewSize / rows);
    const cellSize = Math.max(1, Math.min(cellSizeX, cellSizeY));

    // 计算实际显示尺寸
    const width = cols * cellSize;
    const height = rows * cellSize;

    // 设置Canvas尺寸
    canvas.width = width;
    canvas.height = height;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制图案
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = pattern[i][j] ? "#A0C4DB" : "#F8FAFC";
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#E2EBF0";
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [pattern]);

  return (
    <div
      className="flex justify-center items-center"
      style={{ width: maxPreviewSize, height: maxPreviewSize }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #E2EBF0",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
}
