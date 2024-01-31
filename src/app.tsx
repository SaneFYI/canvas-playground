import { ReactCanvas } from "./canvas";
import { CanvasElement } from "./canvas-element";
import { ImageElement } from "./image-element";

export default function App() {
  return (
    <ReactCanvas>
      <CanvasElement id="1" position={{ x: 100, y: 100 }}>Your First Component</CanvasElement>
      <CanvasElement id="2" position={{ x: 100, y: 300 }}>Your Second Component</CanvasElement>
      <CanvasElement id="3">Your Third Component</CanvasElement>
      <ImageElement id="kitten" position={{ x: 400, y: 100 }} src="https://placekitten.com/200/200" />
    </ReactCanvas>
  )
}
