interface CanvasNode {
  id: string;
  [key: string]: any;
}

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface Storage {
  create: (node: CanvasNode) => CanvasNode[];
  update: (node: AtLeast<CanvasNode, "id">) => CanvasNode[];
  replace: (node: CanvasNode) => CanvasNode[];
  delete: (node: AtLeast<CanvasNode, "id">) => CanvasNode[];
}

export class MemoryStorage implements Storage {
  private nodes: Map<string, CanvasNode>;

  constructor() {
    this.nodes = new Map<string, CanvasNode>();
    this.hydrate();
  }

  private async hydrate() {
    const storedNodes = localStorage.getItem('canvasNodes');
    if (storedNodes) {
      const parsedNodes: CanvasNode[] = JSON.parse(storedNodes);
      parsedNodes.forEach(node => this.nodes.set(node.id, node));
    }
  }

  private async persist() {
    const nodesArray = Array.from(this.nodes.values());
    localStorage.setItem('canvasNodes', JSON.stringify(nodesArray));
  }

  create(node: CanvasNode): CanvasNode[] {
    this.nodes.set(node.id, node);
    this.persist();
    return Array.from(this.nodes.values());
  }

  update(node: AtLeast<CanvasNode, "id">): CanvasNode[] {
    if (this.nodes.has(node.id)) {
      const existingNode = this.nodes.get(node.id);
      this.nodes.set(node.id, { ...existingNode, ...node });
      this.persist();
    }
    return Array.from(this.nodes.values());
  }

  replace(node: CanvasNode): CanvasNode[] {
    this.nodes.set(node.id, node);
    this.persist();
    return Array.from(this.nodes.values());
  }

  delete(node: AtLeast<CanvasNode, "id">): CanvasNode[] {
    this.nodes.delete(node.id);
    this.persist();
    return Array.from(this.nodes.values());
  }
}