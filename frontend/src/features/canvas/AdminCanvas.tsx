import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeChange,
  type NodeMouseHandler,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Check, DoorOpen, Lock, Plus, RefreshCcw, RotateCw, Ruler, Save, Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createId, loadCanvas, saveLayout } from './service';
import {
  DEFAULT_CANVAS,
  metersToPx,
  pxToMeters,
  TABLE_SHAPES,
  ZONE_TYPES,
  type CanvasConfig,
  type CanvasData,
  type RestaurantTable,
  type TableShape,
  type Zone,
  type ZoneType,
} from './types';
import {
  nodeTypes, tableToNode, zoneToNode,
  type TableFlowNode, type ZoneFlowNode,
} from './nodes';
import { applyChangesWithSize, readNodeDimension, updateNodeSize } from './flowUtils';
import './canvas.css';

type AdminView = 'macro' | 'micro';

export default function AdminCanvas() {
  const { role } = useAuth();
  const isSuper = role === 'super_admin';

  const [data, setData] = useState<CanvasData | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<AdminView>('macro');
  const [activeZoneId, setActiveZoneId] = useState('');
  const [notice, setNotice] = useState('');
  const [canvasCfg, setCanvasCfg] = useState<CanvasConfig>(DEFAULT_CANVAS);

  const reload = useCallback(() => {
    loadCanvas()
      .then((d) => {
        setData(d);
        setCanvasCfg(d.canvas);
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

  const enterZone = useCallback((id: string) => {
    setActiveZoneId(id);
    setView('micro');
  }, []);

  const handleSaved = useCallback((msg: string) => {
    setNotice(msg);
    reload();
  }, [reload]);

  if (error) return <div className="canvas-message error">Error: {error}</div>;
  if (!data) return <div className="canvas-message">Cargando layout…</div>;

  const activeZone = data.zones.find((z) => z.id === activeZoneId);

  return (
    <div className="canvas-shell">
      {view === 'micro' && activeZone ? (
        <MicroAdmin
          data={data}
          zone={activeZone}
          isSuper={isSuper}
          onBack={() => setView('macro')}
          onSaved={handleSaved}
          onReload={reload}
        />
      ) : (
        <MacroAdmin
          data={data}
          isSuper={isSuper}
          canvasCfg={canvasCfg}
          onCanvasCfg={setCanvasCfg}
          onEnterZone={enterZone}
          onSaved={handleSaved}
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
  data, isSuper, canvasCfg, onCanvasCfg, onEnterZone, onSaved, onReload,
}: {
  data: CanvasData;
  isSuper: boolean;
  canvasCfg: CanvasConfig;
  onCanvasCfg: (cfg: CanvasConfig) => void;
  onEnterZone: (zoneId: string) => void;
  onSaved: (msg: string) => void;
  onReload: () => void;
}) {
  const [nodes, setNodes] = useState<ZoneFlowNode[]>(() => data.zones.map((z) => zoneToNode(z, !isSuper, onEnterZone)));
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(data.zones[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNodes(data.zones.map((z) => zoneToNode(z, !isSuper, onEnterZone)));
    setSelectedZoneId((cur) => (cur && data.zones.some((z) => z.id === cur) ? cur : data.zones[0]?.id ?? null));
  }, [data.zones, onEnterZone, isSuper]);

  const selectedZone = nodes.find((n) => n.id === selectedZoneId)?.data.zone;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((cur) => applyChangesWithSize(changes, cur));
  }, []);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedZoneId(params.nodes[0]?.id ?? null);
  }, []);

  // Sin permisos de edición: click en zona -> entrar (solo visualización).
  const onNodeClick: NodeMouseHandler<ZoneFlowNode> = useCallback(
    (_, node) => { if (!isSuper) onEnterZone(node.id); },
    [isSuper, onEnterZone],
  );

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
      zoneType: 'comedor',
      x: 130 + n * 24,
      y: 110 + n * 18,
      width: metersToPx(6),
      height: metersToPx(4),
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
      await saveLayout(data.restaurant.id, nextZones, undefined, canvasCfg);
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
          {isSuper ? (
            <div className="canvas-toolbar">
              <button onClick={createZone}><Plus size={16} />Zona</button>
              <button onClick={onReload}><RefreshCcw size={16} />Recargar</button>
              <button className="primary" onClick={saveZones} disabled={saving}>
                <Save size={16} />{saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flow-frame">
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onSelectionChange={onSelectionChange}
            onNodeClick={onNodeClick}
            nodesDraggable={isSuper}
            minZoom={0.35}
            maxZoom={1.8}
            fitView
          >
            <Background gap={PX_GRID} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
          {nodes.length === 0 ? <div className="flow-empty">No hay zonas guardadas</div> : null}
        </div>
      </div>

      <ZoneInspector
        isSuper={isSuper}
        canvasCfg={canvasCfg}
        onCanvasCfg={onCanvasCfg}
        selectedZone={selectedZone}
        selectedZoneId={selectedZoneId}
        nodes={nodes}
        setNodes={setNodes}
        updateSelectedZone={updateSelectedZone}
        onEnterZone={onEnterZone}
      />
    </section>
  );
}

/** Panel de edición de zonas + config del lienzo. Solo super_admin. */
function ZoneInspector({
  isSuper, canvasCfg, onCanvasCfg, selectedZone, selectedZoneId, nodes, setNodes, updateSelectedZone, onEnterZone,
}: {
  isSuper: boolean;
  canvasCfg: CanvasConfig;
  onCanvasCfg: (cfg: CanvasConfig) => void;
  selectedZone: Zone | undefined;
  selectedZoneId: string | null;
  nodes: ZoneFlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<ZoneFlowNode[]>>;
  updateSelectedZone: (patch: Partial<Zone>) => void;
  onEnterZone: (zoneId: string) => void;
}) {
  if (!isSuper) return null;

  const wPx = selectedZone
    ? readNodeDimension(nodes.find((n) => n.id === selectedZoneId), 'width', selectedZone.width)
    : 0;
  const hPx = selectedZone
    ? readNodeDimension(nodes.find((n) => n.id === selectedZoneId), 'height', selectedZone.height)
    : 0;

  return (
    <aside className="inspector">
      <div className="inspector-title">
        <span><Ruler size={12} /> Terreno (metros)</span>
        <strong>{canvasCfg.widthM} × {canvasCfg.heightM} m</strong>
      </div>

      <div className="field-grid" style={{ marginBottom: 18 }}>
        <div className="size-row">
          <label>
            Ancho total (m)
            <input
              type="number" min={1} step={0.5}
              value={canvasCfg.widthM}
              onChange={(e) => onCanvasCfg({ ...canvasCfg, widthM: Number(e.target.value) })}
            />
          </label>
          <label>
            Largo total (m)
            <input
              type="number" min={1} step={0.5}
              value={canvasCfg.heightM}
              onChange={(e) => onCanvasCfg({ ...canvasCfg, heightM: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

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
            Tipo de zona
            <select
              value={selectedZone.zoneType}
              onChange={(e) => {
                const zoneType = e.target.value as ZoneType;
                const preset = ZONE_TYPES.find((z) => z.value === zoneType);
                updateSelectedZone({ zoneType, ...(preset ? { color: preset.color } : {}) });
              }}
            >
              {ZONE_TYPES.map((z) => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </label>
          <label>
            Color
            <input type="color" value={selectedZone.color} onChange={(e) => updateSelectedZone({ color: e.target.value })} />
          </label>
          <div className="size-row">
            <label>
              Ancho (m)
              <input
                type="number" min={1} step={0.5}
                value={pxToMeters(wPx)}
                onChange={(e) => updateNodeSize(setNodes, selectedZoneId, 'width', metersToPx(Number(e.target.value)))}
              />
            </label>
            <label>
              Largo (m)
              <input
                type="number" min={1} step={0.5}
                value={pxToMeters(hPx)}
                onChange={(e) => updateNodeSize(setNodes, selectedZoneId, 'height', metersToPx(Number(e.target.value)))}
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
  );
}

function MicroAdmin({
  data, zone, isSuper, onBack, onSaved, onReload,
}: {
  data: CanvasData;
  zone: Zone;
  isSuper: boolean;
  onBack: () => void;
  onSaved: (msg: string) => void;
  onReload: () => void;
}) {
  const zoneTables = useMemo(() => data.tables.filter((t) => t.zoneId === zone.id), [data.tables, zone.id]);
  const [nodes, setNodes] = useState<TableFlowNode[]>(() => zoneTables.map((t) => tableToNode(t, zone.name, !isSuper)));
  const [selectedTableId, setSelectedTableId] = useState<string | null>(zoneTables[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNodes(zoneTables.map((t) => tableToNode(t, zone.name, !isSuper)));
    setSelectedTableId((cur) => (cur && zoneTables.some((t) => t.id === cur) ? cur : zoneTables[0]?.id ?? null));
  }, [zone.name, zoneTables, isSuper]);

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
      width: metersToPx(1.2),
      height: metersToPx(1.2),
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
      await saveLayout(data.restaurant.id, undefined, nextTables, undefined, [zone.id]);
      onSaved('Mesas guardadas');
    } catch (e) {
      onSaved(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const wPx = selectedTable
    ? readNodeDimension(nodes.find((n) => n.id === selectedTableId), 'width', selectedTable.width)
    : 0;
  const hPx = selectedTable
    ? readNodeDimension(nodes.find((n) => n.id === selectedTableId), 'height', selectedTable.height)
    : 0;

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
            {isSuper ? (
              <>
                <button onClick={createTable}><Plus size={16} />Mesa</button>
                <button onClick={onReload}><RefreshCcw size={16} />Recargar</button>
                <button className="primary" onClick={saveTables} disabled={saving}>
                  <Save size={16} />{saving ? 'Guardando…' : 'Guardar'}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flow-frame zone-frame" style={{ borderColor: zone.color }}>
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onSelectionChange={onSelectionChange}
            nodesDraggable={isSuper}
            minZoom={0.35}
            maxZoom={2}
            fitView
          >
            <Background gap={PX_GRID} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
          {nodes.length === 0 ? <div className="flow-empty">No hay mesas en esta zona</div> : null}
        </div>
      </div>

      <TableInspector
        isSuper={isSuper}
        selectedTable={selectedTable}
        widthM={pxToMeters(wPx)}
        heightM={pxToMeters(hPx)}
        selectedTableId={selectedTableId}
        setNodes={setNodes}
        updateSelectedTable={updateSelectedTable}
        deleteSelectedTable={deleteSelectedTable}
      />
    </section>
  );
}

/** Panel de edición de mesas. Solo super_admin. */
function TableInspector({
  isSuper, selectedTable, widthM, heightM, selectedTableId, setNodes, updateSelectedTable, deleteSelectedTable,
}: {
  isSuper: boolean;
  selectedTable: RestaurantTable | undefined;
  widthM: number;
  heightM: number;
  selectedTableId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<TableFlowNode[]>>;
  updateSelectedTable: (patch: Partial<RestaurantTable>) => void;
  deleteSelectedTable: () => void;
}) {
  if (!isSuper) return null;

  return (
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
                {TABLE_SHAPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="size-row">
            <label>
              Ancho (m)
              <input
                type="number" min={0.5} step={0.1}
                value={widthM}
                onChange={(e) => updateNodeSize(setNodes, selectedTableId, 'width', metersToPx(Number(e.target.value)))}
              />
            </label>
            <label>
              Largo (m)
              <input
                type="number" min={0.5} step={0.1}
                value={heightM}
                onChange={(e) => updateNodeSize(setNodes, selectedTableId, 'height', metersToPx(Number(e.target.value)))}
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
  );
}

const PX_GRID = 25;
