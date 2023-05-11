import React from "react";
import classNames from "classnames";
import { ColorCircle } from "./ColorCircle";

export default function ColorSelector({ className, colors = [], selectedColor, onColorSelected = () => {} }) {
  function sameColors(color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
  }

  return (
    <div className={classNames(className, "d-flex justify-content-center")}>
      {colors.map((c, index) => (
        <ColorCircle
          key={index}
          id={index}
          color={c}
          isSelected={sameColors(c, selectedColor)}
          onSelected={() => onColorSelected(c)}
        />
      ))}
    </div>
  );
}
