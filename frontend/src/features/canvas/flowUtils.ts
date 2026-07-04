import { applyNodeChanges, type Node, type NodeChange } from '@xyflow/react';

export function applyChangesWithSize<T extends Node>(changes: NodeChange[], current: T[]): T[] {
  const sizeChanges = new Map<string, { width: number; height: number }>();

  changes.forEach((change) => {
    if (change.type === 'dimensions' && 'dimensions' in change && change.dimensions) {
      sizeChanges.set(change.id, change.dimensions);
    }
  });

  return (applyNodeChanges(changes, current) as T[]).map((node) => {
    const size = sizeChanges.get(node.id);
    if (!size) return node;
    return { ...node, style: { ...node.style, width: size.width, height: size.height } };
  });
}

export function updateNodeSize<T extends Node>(
  setNodes: React.Dispatch<React.SetStateAction<T[]>>,
  nodeId: string | null,
  dimension: 'width' | 'height',
  value: number,
) {
  if (!nodeId || !Number.isFinite(value)) return;

  setNodes((current) =>
    current.map((node) =>
      node.id === nodeId ? { ...node, style: { ...node.style, [dimension]: value } } : node,
    ),
  );
}

export function readNodeDimension(node: Node | undefined, dimension: 'width' | 'height', fallback: number) {
  if (!node) return fallback;

  const styleValue = node.style?.[dimension];
  const nodeValue = dimension === 'width' ? node.width : node.height;
  const measuredValue = dimension === 'width' ? node.measured?.width : node.measured?.height;
  const value = nodeValue ?? measuredValue ?? styleValue ?? fallback;

  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}
