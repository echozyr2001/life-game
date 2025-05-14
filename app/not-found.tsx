"use client";

import Link from "next/link";
import { LifeGameBackground } from "@/components/LifeGameBackground";

export default function NotFound() {
  return (
    <>
      <LifeGameBackground />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          color: "#333", // 深灰色文本，确保对比度
          padding: "20px",
          position: "relative", // 确保内容在背景之上
          zIndex: 1, // 确保内容在背景之上
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
          }}
        >
          404
        </h1>
        <p
          style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)", marginBottom: "2rem" }}
        >
          Page not found
        </p>
        <Link
          href="/"
          style={{
            fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
            padding: "10px 20px",
            backgroundColor: "rgba(0, 0, 0, 0.1)", // 轻微的半透明背景增加可读性
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
            e.currentTarget.style.color = "#000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.color = "#333";
          }}
        >
          Back to Home
        </Link>
      </div>
    </>
  );
}
