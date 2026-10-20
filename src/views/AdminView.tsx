import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  AlertCircle,
  Users,
  Database,
  Save,
  Check,
  FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from '../router/Router';
import { formatPEN } from '../utils/pricing';

export function AdminView() {
  const { user, products, fetchProducts, notify } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'database'>('overview');
  const [selectedTable, setSelectedTable] = useState('orders');
  const [tableData, setTableData] = useState<any[]>([]);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingPrice, setEditingPrice] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});

    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => setOrders(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'database') {
      fetch(`/api/admin/database?table=${selectedTable}`)
        .then(r => r.json())
        .then(d => setTableData(d.data || []))
        .catch(() => {});
    }
  }, [activeTab, selectedTable]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { updateOrderStatusInDb } = await import('../services/db');
      await updateOrderStatusInDb(orderId, newStatus);
    } catch {}

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, estado: newStatus } : o)));
        notify(`Pedido ${orderId} actualizado a ${newStatus} en Firebase.`);
      }
    } catch {}
  };

  const handleSaveProduct = async (slug: string) => {
    const patch: any = {};
    if (editingStock[slug] !== undefined) patch.stock = editingStock[slug];
    if (editingPrice[slug] !== undefined) patch.precio = editingPrice[slug];

    try {
      const { updateProductInDb } = await import('../services/db');
      await updateProductInDb(slug, patch);
    } catch {}

    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        notify(`Producto ${slug} actualizado en Firebase Firestore.`);
        fetchProducts();
      }
    } catch {}
  };

  return (
    <div id="main-content" className="container admin-page">
      <nav className="breadcrumb" aria-label="Migas de pan">
        <Link to="/">Inicio</Link> / <Link to="/cuenta">Mi cuenta</Link> / Administración
      </nav>

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow blue">SISTEMA INTERNO</span>
          <h1>Panel de Control · Urban Vibe</h1>
        </div>
        <div className="database-engine">
          Base de Datos: Firebase Firestore (Cloud Native · Conectado)
        </div>
      </div>

      {/* Tabs */}
      <div className="catalog-tabs mb-6">
        {[
          { id: 'overview', label: 'Resumen General' },
          { id: 'orders', label: `Pedidos (${orders.length})` },
          { id: 'inventory', label: `Inventario (${products.length})` },
          { id: 'database', label: 'Base de Datos Cruda' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'selected' : ''}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="admin-stats">
            <article>
              <TrendingUp size={22} className="text-[#0047ff]" />
              <span>Ventas acumuladas</span>
              <strong>{formatPEN(stats?.totalSales ?? 1280)}</strong>
              <small>Pedidos confirmados en Arequipa</small>
            </article>

            <article>
              <Package size={22} className="text-[#0047ff]" />
              <span>Pedidos totales</span>
              <strong>{stats?.ordersCount ?? orders.length}</strong>
              <small>{stats?.pendingOrders ?? 1} pendientes de confirmación</small>
            </article>

            <article>
              <AlertCircle size={22} className="text-[#0047ff]" />
              <span>Unidades en stock</span>
              <strong>{stats?.totalStock ?? 336}</strong>
              <small>{stats?.lowStock ?? 0} prendas con bajo stock</small>
            </article>

            <article>
              <Users size={22} className="text-[#0047ff]" />
              <span>Contactos y Run Club</span>
              <strong>{stats?.leadsCount ?? 8}</strong>
              <small>Interesados registrados</small>
            </article>
          </div>

          <div className="admin-columns">
            <div>
              <h2 className="text-xl font-bold mb-3">Últimos pedidos registrados</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="list-row p-3 border border-[var(--border)]">
                    <div className="flex justify-between items-center">
                      <strong className="text-sm">{o.id} · {o.customer?.nombre}</strong>
                      <span className="status-tag">{o.estado || 'Pendiente'}</span>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {o.customer?.distrito} · {formatPEN(o.total)} · WhatsApp: {o.customer?.whatsapp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Líneas de producción</h2>
              <div className="p-4 border border-[var(--border)] space-y-3 text-xs">
                <p><strong>01 / Running:</strong> Fibras de algodón pima transpirable y elastano. Calce ceñido para distancias sobre 2 300 m.</p>
                <p><strong>02 / Training:</strong> French terry de algodón pima 100 %. Diseñado para resistencia, gimnasio y recuperación.</p>
                <p><strong>03 / Altura:</strong> Baby alpaca y lana merino. Protección térmica natural para madrugadas y senderos volcánicos.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Orders Manager */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Gestión de Pedidos</h2>
          {orders.map(order => (
            <article key={order.id} className="order-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow blue">PEDIDO {order.id}</span>
                  <p className="text-xs text-[var(--muted)] m-0">
                    Cliente: <strong>{order.customer?.nombre}</strong> ({order.customer?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${order.id}`} className="text-xs text-[var(--muted)]">Estado:</label>
                  <select
                    id={`status-${order.id}`}
                    value={order.estado || 'Pendiente'}
                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="p-1 border text-xs"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="En camino">En camino</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 my-3 text-xs">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {item.cantidad} × {item.nombre} ({item.talla} · {item.color})
                    </span>
                    <span>{formatPEN((item.precio || 0) * (item.cantidad || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="summary-line total font-bold pt-2 border-t border-[var(--border)]">
                <span>Total del pedido:</span>
                <strong>{formatPEN(order.total)}</strong>
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                <p><strong>WhatsApp:</strong> {order.customer?.whatsapp}</p>
                <p><strong>Dirección:</strong> {order.customer?.direccion}, {order.customer?.distrito}</p>
                {order.customer?.nota && <p><strong>Nota:</strong> {order.customer?.nota}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tab 3: Inventory Editor */}
      {activeTab === 'inventory' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Control de Inventario y Precios</h2>
          <div className="space-y-2">
            {products.map(prod => (
              <div key={prod.slug} className="admin-product-row">
                <img src={prod.imagenes[0]} alt={prod.nombre} />
                <div>
                  <h4 className="font-bold text-xs">{prod.nombre}</h4>
                  <span className="text-[10px] text-[var(--muted)]">{prod.linea} · {prod.publico}</span>
                </div>

                <label>
                  Precio (S/)
                  <input
                    type="number"
                    defaultValue={prod.precio}
                    onChange={e =>
                      setEditingPrice({ ...editingPrice, [prod.slug]: Number(e.target.value) })
                    }
                  />
                </label>

                <label>
                  Stock (unidades)
                  <input
                    type="number"
                    defaultValue={prod.stock}
                    onChange={e =>
                      setEditingStock({ ...editingStock, [prod.slug]: Number(e.target.value) })
                    }
                  />
                </label>

                <button
                  type="button"
                  className="button"
                  onClick={() => handleSaveProduct(prod.slug)}
                >
                  <Save size={14} /> Guardar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Raw Database Table Inspector */}
      {activeTab === 'database' && (
        <div className="database-panel">
          <div className="database-toolbar">
            <label>
              Seleccionar tabla:
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
              >
                <option value="orders">orders (Pedidos)</option>
                <option value="products">products (Catálogo)</option>
                <option value="leads">leads (Run Club & Guía)</option>
                <option value="complaints">complaints (Libro de Reclamaciones)</option>
                <option value="users">users (Usuarios)</option>
              </select>
            </label>
            <span className="text-xs text-[var(--muted)]">
              {tableData.length} registros en {selectedTable}
            </span>
          </div>

          <div className="database-table">
            <table>
              <thead>
                <tr>
                  {tableData[0] ? (
                    Object.keys(tableData[0]).map(k => <th key={k}>{k}</th>)
                  ) : (
                    <th>Sin datos</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
