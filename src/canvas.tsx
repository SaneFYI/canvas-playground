import React, { ReactNode, useEffect, useState } from 'react';

interface CanvasProps {
  children: ReactNode[];
}

interface PositionedComponent {
  id: string;
  component: ReactNode;
  x: number;
  y: number;
}

export function ReactCanvas({ children }: CanvasProps) {
  const [components, setComponents] = useState<PositionedComponent[]>([]);

  const moveComponent = (id: string, newX: number, newY: number) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, x: newX, y: newY } : comp
    ));
  };

  useEffect(() => {
    children.forEach((child, index) => {
      const id = `canvas-element-${index}`;
      setComponents(prev => [...prev, { component: child, id, x: 100 * index, y: 100 * index }]);
    });
  }, [children]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.setData('text/offset-x', String(event.clientX - event.currentTarget.getBoundingClientRect().left));
    event.dataTransfer.setData('text/offset-y', String(event.clientY - event.currentTarget.getBoundingClientRect().top));
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const offsetX = parseFloat(event.dataTransfer.getData('text/offset-x'));
    const offsetY = parseFloat(event.dataTransfer.getData('text/offset-y'));
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    moveComponent(id, x, y);
  };


  return (
    <div className="w-full h-full fixed top-0 left-0" onDragOver={onDragOver} onDrop={onDrop}>
      {components.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => onDragStart(e, item.id)}
          style={{ position: 'absolute', left: item.x, top: item.y }}
        >
          {item.component}
        </div>
      ))}
    </div>
  );
};
