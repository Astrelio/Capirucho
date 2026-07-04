import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Check, DoorOpen, Lock, Plus, RefreshCcw, RotateCw, Save, Trash2,
} from 'lucide-react';
import { createId, loadCanvas, saveLayout } from './service';
import type { CanvasData, RestaurantTable, TableShape, Zone } from './types';
import {
  nodeTypes, tableToNode, zoneToNode,
  type TableFlowNode, type ZoneFlowNode,
} from './nodes';
import { applyChangesWithSize, readNodeDimension, updateNodeSize } from './flowUtils';
import './canvas.css';

type AdminView = 'macro' | 'micro';

export default function AdminCanvas() {
  const [data, setData] = useState<CanvasData | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<AdminView>('macro');
  const [activeZoneId, setActiveZoneId] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(() => {
    loadCanvas()
      .then((d) => {
        setData(d);
        setActiveZoneId((cur) => (d.zones.some((z) => z.id === cur) ? cur : d.zones[0]?.id ?? ''));
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(reload, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  if (error) return <div className="canvas-message error">Error: {error}</div>;
  if (!data) return <div className="canvas-message">Cargando layout…</div>;

  const activeZone = data.zones.find((z) => z.id === activeZoneId);

  return (
    <div className="canvas-shell">
      {view === 'micro' && activeZone ? (
        <MicroAdmin
          data={data}
          zone={activeZone}
          onBack={() => setView('macro')}
          onSaved={(msg) => {
            setNotice(msg);
            reload();
          }}
          onReload={reload}
        />
      ) : (
        <MacroAdmin
          data={data}
          onEnterZone={(id) => {
            setActiveZoneId(id);
            setView('micro');
          }}
          onSaved={(msg) => {
            setNotice(msg);
            reload();
          }}
          onReload={reload}
        />
      )}

      {notice ? (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      ) : null}
    </div>
  );
}

function MacroAdmin({
  data, onEnterZone, onSaved, onReload,
}: {
  data: CanvasData;
  onEnterZone: (zoneId: string) => void;
  onSaved: (msg: string) => void;
  onReload: () => void;
}) {
  const [nodes, setNodes] = useState<ZoneFlowNode[]>(() => data.zones.map((z) => zoneToNode(z, false, onEnterZone)));
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(data.zones[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNodes(data.zones.map((z) => zoneToNode(z, false, onEnterZone)));
    setSelectedZoneId((cur) => (cur && data.zones.some((z) => z.id === cur) ? cur : data.zones[0]?.id ?? null));
  }, [data.zones, onEnterZone]);

  const selectedZone = nodes.find((n) => n.id === selectedZoneId)?.data.zone;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((cur) => applyChangesWithSize(changes, cur));
  }, []);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedZoneId(params.nodes[0]?.id ?? null);
  }, []);

  const updateSelectedZone = (patch: Partial<Zone>) => {
    if (!selectedZoneId) return;
    setNodes((cur) =>
      cur.map((n) => (n.id === selectedZoneId ? { ...n, data: { ...n.data, zone: { ...n.data.zone, ...patch } } } : n)),
    );
  };

  const createZone = () => {
    const n = nodes.length + 1;
    const zone: Zone = {
      id: createId(),
      restaurantId: data.restaurant.id,
      name: `Zona ${n}`,
      color: '#a03b28',
      x: 130 + n * 24,
      y: 110 + n * 18,
      width: 280,
      height: 210,
    };
    setNodes((cur) => [...cur.map((x) => ({ ...x, selected: false })), { ...zoneToNode(zone, false, onEnterZone), selected: true }]);
    setSelectedZoneId(zone.id);
  };

  const saveZones = async () => {
    setSaving(true);
    try {
      const nextZones = nodes.map((node) => {
        const zone = node.data.zone;
        return {
          ...zone,
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
          width: Math.round(readNodeDimension(node, 'width', zone.width)),
          height: Math.round(readNodeDimension(node, 'height', zone.height)),
        };
      });
      await saveLayout(data.restaurant.id, nextZones, undefined);
      onSaved('Zonas guardadas');
    } catch (e) {
      onSaved(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="canvas-layout">
      <div className="canvas-stage">
        <div className="stage-header">
          <div>
            <span className="eyebrow">Macro canvas</span>
            <h1>Zonas del restaurante</h1>
          </div>
          <div className="canvas-toolbar">
            <button onClick={createZone}><Plus size={16} />Zona</button>
            <button onClick={onReload}><RefreshCcw size={16} />Recargar</button>
            <button className="primary" onClick={saveZones} disabled={saving}>
              <Save size={16} />{saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="flow-frame">
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onSelectionChange={onSelectionChange}
            minZoom={0.35}
            maxZoom={1.8}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>

      <aside className="inspector">
        <div className="inspector-title">
          <span>Zona</span>
          <strong>{selectedZone?.name ?? 'Sin selección'}</strong>
        </div>

        {selectedZone ? (
          <div className="field-grid">
            <label>
              Nombre
              <input value={selectedZone.name} onChange={(e) => updateSelectedZone({ name: e.target.value })} />
            </label>
            <label>
              Color
              <input type="color" value={selectedZone.color} onChange={(e) => updateSelectedZone({ color: e.target.value })} />
            </label>
            <div className="size-row">
              <label>
                Ancho
                <input
                  type="number" min={180}
                  value={Math.round(readNodeDimension(nodes.find((n) => n.id === selectedZoneId), 'width', selectedZone.width))}
                  onChange={(e) => updateNodeSize(setNodes, selectedZoneId, 'width', Number(e.target.value))}
                />
              </label>
              <label>
                Alto
                <input
                  type="number" min={150}
                  value={Math.round(readNodeDimension(nodes.find((n) => n.id === selectedZoneId), 'height', selectedZone.height))}
                  onChange={(e) => updateNodeSize(setNodes, selectedZoneId, 'height', Number(e.target.value))}
                />
              </label>
            </div>
            <button className="primary full" onClick={() => onEnterZone(selectedZone.id)}>
              <DoorOpen size={16} />
              Entrar a zona
            </button>
          </div>
        ) : (
          <div className="empty-panel">Selecciona una zona</div>
        )}
      </aside>
    </section>
  );
}

function MicroAdmin({
  data, zone, onBack, onSaved, onReload,
}: {
  data: CanvasData;
  zone: Zone;
  onBack: () => void;
  onSaved: (msg: string) => void;
  onReload: () => void;
}) {
  const zoneTables = useMemo(() => data.tables.filter((t) => t.zoneId === zone.id), [data.tables, zone.id]);
  const [nodes, setNodes] = useState<TableFlowNode[]>(() => zoneTables.map((t) => tableToNode(t, zone.name, false)));
  const [selectedTableId, setSelectedTableId] = useState<string | null>(zoneTables[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNodes(zoneTables.map((t) => tableToNode(t, zone.name, false)));
    setSelectedTableId((cur) => (cur && zoneTables.some((t) => t.id === cur) ? cur : zoneTables[0]?.id ?? null));
  }, [zone.name, zoneTables]);

  const selectedTable = nodes.find((n) => n.id === selectedTableId)?.data.table;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((cur) => applyChangesWithSize(changes, cur));
  }, []);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedTableId(params.nodes[0]?.id ?? null);
  }, []);

  const updateSelectedTable = (patch: Partial<RestaurantTable>) => {
    if (!selectedTableId) return;
    setNodes((cur) =>
      cur.map((n) => (n.id === selectedTableId ? { ...n, data: { ...n.data, table: { ...n.data.table, ...patch } } } : n)),
    );
  };

  const createTable = () => {
    const n = nodes.length + 1;
    const table: RestaurantTable = {
      id: createId(),
      restaurantId: data.restaurant.id,
      zoneId: zone.id,
      name: `M${n}`,
      x: 120 + n * 18,
      y: 120 + n * 18,
      width: 112,
      height: 112,
      shape: 'round',
      seats: 4,
      rotation: 0,
      status: 'available',
    };
    setNodes((cur) => [...cur.map((x) => ({ ...x, selected: false })), { ...tableToNode(table, zone.name, false), selected: true }]);
    setSelectedTableId(table.id);
  };

  const deleteSelectedTable = () => {
    if (!selectedTableId) return;
    setNodes((cur) => cur.filter((n) => n.id !== selectedTableId));
    setSelectedTableId(null);
  };

  const saveTables = async () => {
    setSaving(true);
    try {
      const nextTables = nodes.map((node) => {
        const table = node.data.table;
        return {
          ...table,
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
          width: Math.round(readNodeDimension(node, 'width', table.width)),
          height: Math.round(readNodeDimension(node, 'height', table.height)),
        };
      });
      await saveLayout(data.restaurant.id, undefined, nextTables);
      onSaved('Mesas guardadas');
    } catch (e) {
      onSaved(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="canvas-layout">
      <div className="canvas-stage">
        <div className="stage-header">
          <div>
            <span className="eyebrow">Micro canvas</span>
            <h1>{zone.name}</h1>
          </div>
          <div className="canvas-toolbar">
            <button onClick={onBack}><ArrowLeft size={16} />Zonas</button>
            <button onClick={createTable}><Plus size={16} />Mesa</button>
            <button onClick={onReload}><RefreshCcw size={16} />Recargar</button>
            <button className="primary" onClick={saveTables} disabled={saving}>
              <Save size={16} />{saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="flow-frame zone-frame" style={{ borderColor: zone.color }}>
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onSelectionChange={onSelectionChange}
            minZoom={0.35}
            maxZoom={2}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>

      <aside className="inspector">
        <div className="inspector-title">
          <span>Mesa</span>
          <strong>{selectedTable?.name ?? 'Sin selección'}</strong>
        </div>

        {selectedTable ? (
          <div className="field-grid">
            <label>
              Nombre
              <input value={selectedTable.name} onChange={(e) => updateSelectedTable({ name: e.target.value })} />
            </label>
            <div className="size-row">
              <label>
                Sillas
                <input
                  type="number" min={1} max={20}
                  value={selectedTable.seats}
                  onChange={(e) => updateSelectedTable({ seats: Number(e.target.value) })}
                />
              </label>
              <label>
                Forma
                <select value={selectedTable.shape} onChange={(e) => updateSelectedTable({ shape: e.target.value as TableShape })}>
                  <option value="round">Redonda</option>
                  <option value="square">Cuadrada</option>
                  <option value="rectangle">Rectangular</option>
                  <option value="booth">Booth</option>
                </select>
              </label>
            </div>
            <div className="size-row">
              <label>
                Ancho
                <input
                  type="number" min={70}
                  value={Math.round(readNodeDimension(nodes.find((n) => n.id === selectedTableId), 'width', selectedTable.width))}
                  onChange={(e) => updateNodeSize(setNodes, selectedTableId, 'width', Number(e.target.value))}
                />
              </label>
              <label>
                Alto
                <input
                  type="number" min={70}
                  value={Math.round(readNodeDimension(nodes.find((n) => n.id === selectedTableId), 'height', selectedTable.height))}
                  onChange={(e) => updateNodeSize(setNodes, selectedTableId, 'height', Number(e.target.value))}
                />
              </label>
            </div>
            <label>
              Rotación
              <input
                type="range" min={0} max={345} step={15}
                value={selectedTable.rotation}
                onChange={(e) => updateSelectedTable({ rotation: Number(e.target.value) })}
              />
            </label>
            <button className="ghost" onClick={() => updateSelectedTable({ rotation: (selectedTable.rotation + 15) % 360 })}>
              <RotateCw size={16} />
              {selectedTable.rotation} grados
            </button>
            <label className="check-row">
              <input
                type="checkbox"
                checked={selectedTable.status === 'blocked'}
                onChange={(e) => updateSelectedTable({ status: e.target.checked ? 'blocked' : 'available' })}
              />
              <span><Lock size={15} />Bloqueada</span>
            </label>
            <button className="danger full" onClick={deleteSelectedTable}>
              <Trash2 size={16} />
              Eliminar mesa
            </button>
          </div>
        ) : (
          <div className="empty-panel">Selecciona una mesa</div>
        )}
      </aside>
    </section>
  );
}
