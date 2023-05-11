import React from "react";
import "./ColorCircle.scss";

export function ColorCircle({ isSelected, color, onSelected = () => {}, id }) {
  const circleId = `circle-id-${id}`;

  return (
    <div className="color-circle">
      <input
        type="radio"
        name="color"
        id={circleId}
        value={color}
        checked={isSelected}
        onChange={(e) => {
          if (e.target.checked) {
            onSelected();
          }
        }}
      />
      <label htmlFor={circleId}>
        <span className="circle" style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }} />
      </label>
    </div>
  );
}
