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

interface Connection {
  componentIds: string[];
  midpoints: { x: number, y: number }[];
}

function calculateMidpointOfElement(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return {
    x: rect.right - (rect.width / 2),
    y: rect.top + (rect.height / 2)
  }
}

function getIdOnDrop(el: HTMLElement): string {
  const componentId = el.id || getIdOnDrop(el.parentElement as HTMLElement);

  return componentId === 'root' ? '' : componentId;
}

export function ReactCanvas({ children }: CanvasProps) {
  const [components, setComponents] = useState<PositionedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

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
    const dragId = event.dataTransfer.getData('text/plain'); // component that is being dragged
    const dropId =  getIdOnDrop(event.target) // component that is getting dropped on
    const offsetX = parseFloat(event.dataTransfer.getData('text/offset-x'));
    const offsetY = parseFloat(event.dataTransfer.getData('text/offset-y'));
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    
    // handle case where drag does not end on another component
    if (!dropId || dropId === dragId) {
      moveComponent(dragId, x, y);
      return;
    }

    const existingConnection = connections.find(connection =>
        connection.componentIds.includes(dragId) && connection.componentIds.includes(dropId));

    if (!existingConnection) {
      const dragEl = document.getElementById(dragId);
      const dropEl = document.getElementById(dropId);
      const dragMidpoint = dragEl ? calculateMidpointOfElement(dragEl) : {x: 0, y: 0};
      const dropMidpoint = dropEl ? calculateMidpointOfElement(dropEl) : {x: 0, y: 0};
      console.log('should connect', dragId, dropId)
      setConnections(prev => [...prev, {
        id: `${dragId}-${dropId}`,
        componentIds: [dragId, dropId],
        midpoints: [dragMidpoint, dropMidpoint]
      }]);
    } else {
      console.log('should disconnect', dragId, dropId)
      setConnections(prev => prev.filter(connection => !connection.componentIds.includes(dragId) || !connection.componentIds.includes(dropId)));
    }
  };


  return (
    <div className="w-full h-full fixed top-0 left-0" onDragOver={onDragOver} onDrop={onDrop}>
      <svg className="w-full h-full absolute top-0 left-0" >
        {connections.map(item => (
          <line key={item.id} x1={item.midpoints[0].x.toString()} y1={item.midpoints[0].y.toString()} x2={item.midpoints[1].x.toString()} y2={item.midpoints[1].y.toString()} style={{ stroke: 'black', strokeWidth: 2 }} />
        ))}
      </svg>
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
