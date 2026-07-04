import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background, Controls, ReactFlow, type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, CalendarDays, Check, Clock, Save, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getAvailability, loadCanvas, loadReservations, reserveTable, subscribeCanvas, timeSlots, todayInputValue,
} from './service';
import type { CanvasData, ReservationSlot, Zone } from './types';
import { nodeTypes, tableToNode, zoneToNode, type TableFlowNode, type ZoneFlowNode } from './nodes';
import './canvas.css';

export default function PublicCanvas() {
  const [data, setData] = useState<CanvasData | null>(null);
  const [error, setError] = useState('');
  const [activeZoneId, setActiveZoneId] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(() => {
    loadCanvas()
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(reload, [reload]);
  useEffect(() => subscribeCanvas(reload), [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  if (error) return <div className="canvas-message error">Error: {error}</div>;
  if (!data) return <div className="canvas-message">Cargando mapa…</div>;

  const activeZone = data.zones.find((z) => z.id === activeZoneId);

  return (
    <div className="canvas-shell public-shell">
      <header className="public-topbar">
        <Link to="/" className="back-home">← El Capirucho</Link>
        <span className="eyebrow">Reserva tu mesa</span>
      </header>

      {activeZone ? (
        <PublicMicro
          data={data}
          zone={activeZone}
          onBack={() => setActiveZoneId('')}
          onNotice={setNotice}
        />
      ) : (
        <PublicMacro data={data} onEnterZone={setActiveZoneId} />
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

function PublicMacro({ data, onEnterZone }: { data: CanvasData; onEnterZone: (zoneId: string) => void }) {
  const nodes = useMemo(() => data.zones.map((z) => zoneToNode(z, true, onEnterZone)), [data.zones, onEnterZone]);
  const onNodeClick: NodeMouseHandler<ZoneFlowNode> = useCallback((_, node) => onEnterZone(node.id), [onEnterZone]);

  return (
    <section className="single-canvas">
      <div className="stage-header">
        <div>
          <span className="eyebrow">Vista pública</span>
          <h1>Zonas disponibles</h1>
        </div>
      </div>
      <div className="flow-frame">
        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          minZoom={0.35}
          maxZoom={1.8}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  );
}

function PublicMicro({
  data, zone, onBack, onNotice,
}: {
  data: CanvasData;
  zone: Zone;
  onBack: () => void;
  onNotice: (msg: string) => void;
}) {
  const [date, setDate] = useState(todayInputValue());
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(4);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationSlot[]>([]);
  const [reserving, setReserving] = useState(false);

  const refreshReservations = useCallback(() => {
    loadReservations(data.restaurant.id, date)
      .then(setReservations)
      .catch(() => {});
  }, [data.restaurant.id, date]);

  useEffect(refreshReservations, [refreshReservations]);
  useEffect(() => subscribeCanvas(refreshReservations), [refreshReservations]);

  const availability = useMemo(
    () => getAvailability(data.tables, reservations, { zoneId: zone.id, time, partySize }),
    [data.tables, reservations, zone.id, time, partySize],
  );

  const availabilityByTable = useMemo(() => new Map(availability.map((i) => [i.table.id, i])), [availability]);

  const nodes = useMemo(
    () => availability.map((i) => tableToNode(i.table, zone.name, true, i, selectedTableId === i.table.id)),
    [availability, selectedTableId, zone.name],
  );

  const selectedAvailability = selectedTableId ? availabilityByTable.get(selectedTableId) : undefined;

  const onNodeClick: NodeMouseHandler<TableFlowNode> = useCallback(
    (_, node) => {
      const item = availabilityByTable.get(node.id);
      setSelectedTableId(node.id);
      if (item?.status !== 'available') onNotice(item?.label ?? 'Mesa no disponible');
    },
    [availabilityByTable, onNotice],
  );

  const reserve = async () => {
    if (!selectedTableId) {
      onNotice('Selecciona una mesa');
      return;
    }

    setReserving(true);
    try {
      const result = await reserveTable({
        restaurantId: data.restaurant.id,
        tableId: selectedTableId,
        guestName: guestName.trim() || 'Cliente',
        guestPhone: guestPhone.trim() || undefined,
        date,
        time,
        partySize,
      });

      if (!result.ok) {
        onNotice(result.message);
        refreshReservations();
        return;
      }

      setSelectedTableId(null);
      setGuestName('');
      onNotice('Reserva confirmada');
      refreshReservations();
    } finally {
      setReserving(false);
    }
  };

  return (
    <section className="public-layout">
      <div className="canvas-stage">
        <div className="stage-header">
          <div>
            <span className="eyebrow">Reserva</span>
            <h1>{zone.name}</h1>
          </div>
          <div className="canvas-toolbar">
            <button onClick={onBack}><ArrowLeft size={16} />Zonas</button>
          </div>
        </div>

        <div className="booking-bar">
          <label>
            <CalendarDays size={16} />
            <input type="date" value={date} min={todayInputValue()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            <Clock size={16} />
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </label>
          <label>
            <Users size={16} />
            <input type="number" min={1} max={20} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
          </label>
        </div>

        <div className="flow-frame zone-frame" style={{ borderColor: zone.color }}>
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            minZoom={0.35}
            maxZoom={2}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      <aside className="inspector booking-panel">
        <div className="inspector-title">
          <span>Mesa</span>
          <strong>{selectedAvailability?.table.name ?? 'Sin selección'}</strong>
        </div>

        <div className="status-list">
          <span className="dot available" />
          Disponible
          <span className="dot reserved" />
          Reservada
          <span className="dot blocked" />
          Bloqueada
          <span className="dot small" />
          Capacidad
        </div>

        <div className="field-grid">
          <label>
            Cliente
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nombre" />
          </label>
          <label>
            Teléfono
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Opcional" />
          </label>
          <div className="booking-summary">
            <span>{date}</span>
            <strong>{time}</strong>
            <span>{partySize} personas</span>
          </div>
          <button
            className="primary full"
            disabled={selectedAvailability?.status !== 'available' || reserving}
            onClick={reserve}
          >
            <Save size={16} />
            {reserving ? 'Reservando…' : 'Reservar'}
          </button>
        </div>
      </aside>
    </section>
  );
}
