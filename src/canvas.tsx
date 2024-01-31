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
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.id) {
        const { id, position, ...restProps } = child.props;
  
        let initialPosition = position;
        if (!initialPosition) {
          const defaultWidth = 100; 
          const defaultHeight = 100;
          initialPosition = {
            x: (window.innerWidth - defaultWidth) / 2,
            y: (window.innerHeight - defaultHeight) / 2
          };
        }
  
        const newComponent = {
          id,
          component: child,
          x: initialPosition.x,
          y: initialPosition.y,
          ...restProps,
          style: { ...(restProps.style || {}), position: 'absolute', left: initialPosition.x, top: initialPosition.y }
        };
        setComponents(prev => {
          const index = prev.findIndex(comp => comp.id === id);
          if (index !== -1) {
            const updatedComponents = [...prev];
            updatedComponents[index] = newComponent;
            return updatedComponents;
          }
          return [...prev, newComponent];
        });
      }
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
