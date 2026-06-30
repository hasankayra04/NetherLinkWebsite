import React, { useEffect, useRef } from "react";

export default function SkinRenderer({ url, scale = 4 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      const s = scale;
      ctx.drawImage(img, 8, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);       // head
      ctx.drawImage(img, 40, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);      // head overlay
      ctx.drawImage(img, 20, 20, 8, 12, 4 * s, 8 * s, 8 * s, 12 * s); // body
      ctx.drawImage(img, 44, 20, 4, 12, 0, 8 * s, 4 * s, 12 * s);    // right arm
      ctx.drawImage(img, 36, 52, 4, 12, 12 * s, 8 * s, 4 * s, 12 * s); // left arm
      ctx.drawImage(img, 4, 20, 4, 12, 4 * s, 20 * s, 4 * s, 12 * s); // right leg
      ctx.drawImage(img, 20, 52, 4, 12, 8 * s, 20 * s, 4 * s, 12 * s); // left leg
    };
    img.src = url;
  }, [url, scale]);
  return (
    <canvas
      ref={ref}
      width={16 * scale}
      height={32 * scale}
      style={{ display: "block", imageRendering: "pixelated" }}
    />
  );
}
