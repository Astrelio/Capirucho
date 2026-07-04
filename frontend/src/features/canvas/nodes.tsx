import { NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { DoorOpen } from 'lucide-react';
import type { AvailabilityResult, RestaurantTable, Zone } from './types';

export type ZoneNodeData = {
  zone: Zone;
  readOnly?: boolean;
  onEnter?: (zoneId: string) => void;
} & Record<string, unknown>;

export type TableNodeData = {
  table: RestaurantTable;
  zoneName: string;
  readOnly?: boolean;
  availability?: AvailabilityResult;
  selectedForReserve?: boolean;
} & Record<string, unknown>;

export type ZoneFlowNode = Node<ZoneNodeData, 'zoneNode'>;
export type TableFlowNode = Node<TableNodeData, 'tableNode'>;

export function ZoneNodeView({ data, selected }: NodeProps<ZoneFlowNode>) {
  const { zone, readOnly, onEnter } = data;

  return (
    <div className={`zone-node ${readOnly ? 'readonly' : ''}`} style={{ borderColor: zone.color }} title={zone.name}>
      {!readOnly ? <NodeResizer isVisible={selected} minWidth={180} minHeight={150} color={zone.color} /> : null}
      <div className="zone-node-fill" style={{ background: hexToRgba(zone.color, 0.13) }}>
        <div className="node-header">
          <span className="color-swatch" style={{ background: zone.color }} />
          <strong>{zone.name}</strong>
        </div>
        {onEnter && !readOnly ? (
          <button className="icon-button nodrag" title="Entrar a zona" onClick={() => onEnter(zone.id)}>
            <DoorOpen size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function TableNodeView({ data, selected }: NodeProps<TableFlowNode>) {
  const { table, zoneName, readOnly, availability, selectedForReserve } = data;
  const status = availability?.status ?? (table.status === 'blocked' ? 'blocked' : 'available');
  const label = availability?.label ?? (table.status === 'blocked' ? 'Bloqueada' : 'Activa');
  const title = `${table.name} | ${zoneName} | ${table.seats} sillas | ${label}`;

  return (
    <div className="table-node-wrap" title={title}>
      {!readOnly ? <NodeResizer isVisible={selected} minWidth={70} minHeight={70} color="#a03b28" /> : null}
      <div
        className={`table-node shape-${table.shape} status-${status} ${selectedForReserve ? 'reserve-selected' : ''}`}
        style={{ transform: `rotate(${table.rotation}deg)` }}
      >
        <strong>{table.name}</strong>
        <span>{table.seats}</span>
      </div>
    </div>
  );
}

export const nodeTypes = {
  zoneNode: ZoneNodeView,
  tableNode: TableNodeView,
};

export function zoneToNode(zone: Zone, readOnly: boolean, onEnter?: (zoneId: string) => void): ZoneFlowNode {
  return {
    id: zone.id,
    type: 'zoneNode',
    position: { x: zone.x, y: zone.y },
    data: { zone, readOnly, onEnter },
    style: { width: zone.width, height: zone.height },
  };
}

export function tableToNode(
  table: RestaurantTable,
  zoneName: string,
  readOnly: boolean,
  availability?: AvailabilityResult,
  selectedForReserve?: boolean,
): TableFlowNode {
  return {
    id: table.id,
    type: 'tableNode',
    position: { x: table.x, y: table.y },
    data: { table, zoneName, readOnly, availability, selectedForReserve },
    style: { width: table.width, height: table.height },
  };
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const bigint = Number.parseInt(
    normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized,
    16,
  );
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
}
