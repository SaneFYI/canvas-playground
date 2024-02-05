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
  id: string;
  componentIds: string[];
  midpoints: { x: number, y: number }[];
}

const calculateMidpointOfElement = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();

  return {
    x: rect.right - (rect.width / 2),
    y: rect.top + (rect.height / 2)
  }
}

const getIdOnDrop = (el: HTMLElement): string => {
  const componentId = el.id || getIdOnDrop(el.parentElement as HTMLElement);

  return componentId === 'root' ? '' : componentId;
}

export function ReactCanvas({ children }: CanvasProps) {
  const [components, setComponents] = useState<PositionedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const moveComponent = (id: string, newX: number, newY: number) => {
    setComponents(prev => prev.map(comp => {
      return comp.id === id ? { ...comp, x: newX, y: newY } : comp
    }));
  };

  const addConnection = (id1: string, id2: string) => {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    const dragMidpoint = el1 ? calculateMidpointOfElement(el1) : {x: 0, y: 0};
    const dropMidpoint = el2 ? calculateMidpointOfElement(el2) : {x: 0, y: 0};
    setConnections(prev => [...prev, {
      id: `${id1}-${id2}`,
      componentIds: [id1, id2],
      midpoints: [dragMidpoint, dropMidpoint]
    }]);
  };

  const removeConnection = (id1: string, id2: string) => {
    setConnections(prev => prev.filter(connection =>
      !connection.componentIds.includes(id1) || !connection.componentIds.includes(id2)));
  }

  const drawConnectionsToComponent = (x: number, y: number, componentId: string): void => {
    setConnections(prev => {
      return prev.map(connection => {
        if (connection.componentIds.includes(componentId)) {
          const otherId = connection.componentIds.find(id => id !== componentId);
          const connectedEl = otherId ? document.getElementById(otherId) : null;
          connection.midpoints = [
            {x, y},
            connectedEl ? calculateMidpointOfElement(connectedEl) : {x: 0, y: 0}
          ]
        }

        return connection;
      });
    })
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
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const midpoint = calculateMidpointOfElement(event.currentTarget);
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.setData('text/offset-x', String(event.clientX - boundingRect.left));
    event.dataTransfer.setData('text/offset-y', String(event.clientY - boundingRect.top));
    event.dataTransfer.setData('text/drag-start-x', String(midpoint.x));
    event.dataTransfer.setData('text/drag-start-y', String(midpoint.y));
    event.dataTransfer.setData('text/drag-width', String(boundingRect.width));
    event.dataTransfer.setData('text/drag-height', String(boundingRect.height));
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dragId = event.dataTransfer.getData('text/plain');
    drawConnectionsToComponent(event.clientX, event.clientY, dragId);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dragId = event.dataTransfer.getData('text/plain'); // component that is being dragged
    const dropId = getIdOnDrop(event.target as HTMLElement) // component that is getting dropped on
    const offsetX = parseFloat(event.dataTransfer.getData('text/offset-x'));
    const offsetY = parseFloat(event.dataTransfer.getData('text/offset-y'));
    const dragStartX = parseFloat(event.dataTransfer.getData('text/drag-start-x'));
    const dragStartY = parseFloat(event.dataTransfer.getData('text/drag-start-y'));
    const dragWidth = parseFloat(event.dataTransfer.getData('text/drag-width'));
    const dragHeight = parseFloat(event.dataTransfer.getData('text/drag-height'));
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    
    // handle case where drag does not end on another component
    if (!dropId || dropId === dragId) {
      moveComponent(dragId, x, y);
      const newMidpointX = event.clientX - offsetX + dragWidth / 2;
      const newMidpointY = event.clientY - offsetY + dragHeight / 2;
      drawConnectionsToComponent(newMidpointX, newMidpointY, dragId)
      return;
    }

    const existingConnection = connections.find(connection =>
        connection.componentIds.includes(dragId) && connection.componentIds.includes(dropId));

    existingConnection ?
      removeConnection(dragId, dropId) :
      addConnection(dragId, dropId);

    // redraw the connections to reflect original position of the dragged component
    drawConnectionsToComponent(dragStartX, dragStartY, dragId);
  };


  return (
    <div className="w-full h-full fixed top-0 left-0" onDragOver={onDragOver} onDrop={onDrop}>
      <svg className="w-full h-full absolute top-0 left-0" style={{ zIndex: '-1' }}>
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
