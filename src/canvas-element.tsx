import type { HTMLAttributes } from "react";
import { XYPosition } from "./types";

export interface CanvasElementProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  id: string;
  position?: XYPosition;
}

export function CanvasElement({ id, children, ...rest }: CanvasElementProps) {
  return (
    <div id={id} {...rest}>
      {children}
    </div>
  )
}