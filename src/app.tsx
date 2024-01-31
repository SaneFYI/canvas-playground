import { ReactCanvas } from "./canvas";
import { CanvasElement } from "./canvas-element";

export default function App() {
  return (
    <ReactCanvas>
      <CanvasElement id="1" position={{ x: 100, y: 100 }}>Your First Component</CanvasElement>
      <CanvasElement id="2" position={{ x: 100, y: 300 }}>Your Second Component</CanvasElement>
      <CanvasElement id="3">Your Third Component</CanvasElement>
    </ReactCanvas>
  )
}
