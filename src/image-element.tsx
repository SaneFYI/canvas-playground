import { CanvasElement, CanvasElementProps } from "./canvas-element";

export interface ImageElementProps extends CanvasElementProps {
  src: string;
}

export function ImageElement({ src, ...props }: ImageElementProps) {
  return (
    <CanvasElement {...props}>
      <img src={src} alt="" />
    </CanvasElement>
  )
}