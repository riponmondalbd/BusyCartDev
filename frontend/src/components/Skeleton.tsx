import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  circle = false,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height: circle ? width : height,
        borderRadius: circle ? "50%" : borderRadius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
