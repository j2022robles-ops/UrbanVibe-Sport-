import React, { useState, useEffect } from 'react';
import { UserRound, ShoppingBag, Heart, LogOut, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore, User } from '../store/useStore';
import { useRouter, Link } from '../router/Router';
import { formatPEN, WHATSAPP_PHONE } from '../utils/pricing';

export function AccountView() {
  const { user, setUser, logout, notify } = useStore();
  const { search, navigate } = useRouter();

  const isRegisterParam = search.includes('register=true');
  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userOrders, setUserOrders] = useState<any[]>([]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(orders => {
          if (Array.isArray(orders)) {
            // Filter by user email or show all if admin
            const mine = user.role === 'admin'
              ? orders
              : orders.filter((o: any) => o.customer?.email?.toLowerCase() === user.email.toLowerCase());
            setUserOrders(mine.length ? mine : orders.slice(0, 3));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      const userData: User = await res.json();
      setUser(userData);
      notify(`¡Bienvenido de vuelta, ${userData.nombre}!`);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regName,
          email: regEmail,
          whatsapp: regWhatsapp,
          password: regPassword
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      const userData: User = await res.json();
      try {
        const { saveUserToDb } = await import('../services/db');
        await saveUserToDb(userData);
      } catch {}
      setUser(userData);
      notify(`¡Cuenta creada! Tienes 20 % de descuento con el cupón CLUB20.`);
    } catch (err: any) {
      setError(err.message || 'Error al registrarte');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div id="main-content" className="auth-section">
        <div className="auth-card">
          <span className="eyebrow blue">CLUB ALTURA</span>
          <h1>{isRegister ? 'Muévete con nosotros.' : 'Qué bueno verte.'}</h1>
          <p className="muted">
            {isRegister
              ? 'Crea tu cuenta y usa CLUB20 para obtener un 20 % en tus prendas.'
              : 'Inicia sesión para ver tus pedidos y acceder a los beneficios del Club.'}
          </p>

          {error && <p className="error my-3">{error}</p>}

          {isRegister ? (
            <form onSubmit={handleRegister}>
              <label>
                Tu nombre
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ej. Valeria Quispe"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="valeria@ejemplo.com"
                />
              </label>

              <label>
                WhatsApp (para confirmar tus pedidos)
                <input
                  type="tel"
                  required
                  value={regWhatsapp}
                  onChange={e => setRegWhatsapp(e.target.value)}
                  placeholder="+51 925 147 306"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <button type="submit" className="button full mt-4" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>

              <button
                type="button"
                className="text-button full mt-3"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <label>
                Correo electrónico
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <button type="submit" className="button full mt-4" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>

              <div className="mt-4 p-3 bg-[var(--cream)] text-xs text-[var(--muted)]">
                <p><strong>Cuentas de demostración:</strong></p>
                <p>• Atleta: <code>demo@urbanvibesport.com</code> (clave: <code>demo</code>)</p>
                <p>• Admin: <code>admin@urbanvibesport.com</code> (clave: <code>admin</code>)</p>
              </div>

              <button
                type="button"
                className="text-button full mt-3"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
              >
                ¿Aún no tienes cuenta? Regístrate y gana 20%
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="container account-page">
      <nav className="breadcrumb" aria-label="Migas de pan">
        <Link to="/">Inicio</Link> / Mi cuenta
      </nav>

      <span className="eyebrow blue">TU ESPACIO EN URBAN VIBE</span>
      <h1>Hola, {user.nombre}</h1>

      <div className="account-layout">
        {/* Left Column: Member Card & Quick Links */}
        <aside>
          <div className="club-card">
            <span className="eyebrow text-white/80">MIEMBRO CLUB ALTURA</span>
            <strong>20 % OFF</strong>
            <p>
              Tu cupón activo es <strong>CLUB20</strong>. Se aplica en toda la colección ALTURA 2335 cuando compras con tu sesión iniciada.
            </p>
          </div>

          <Link to="/favoritos" className="account-shortcut">
            <Heart size={18} className="text-[#0047ff]" />
            <span>Mis prendas favoritas</span>
            <ArrowRight size={14} />
          </Link>

          {user.role === 'admin' && (
            <Link to="/admin" className="account-shortcut bg-[#0047ff]/5 border-[#0047ff]">
              <ShieldCheck size={18} className="text-[#0047ff]" />
              <span className="font-semibold text-[#0047ff]">Panel de Administración</span>
              <ArrowRight size={14} />
            </Link>
          )}

          <div className="p-4 border border-[var(--border)] mt-4 text-xs space-y-1">
            <p className="font-semibold">{user.nombre}</p>
            <p className="text-[var(--muted)]">{user.email}</p>
            {user.whatsapp && <p className="text-[var(--muted)]">{user.whatsapp}</p>}
          </div>

          <button
            type="button"
            className="button button-outline full mt-4 text-xs"
            onClick={logout}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </aside>

        {/* Right Column: Order History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Tus pedidos recientes</h2>

          {userOrders.length === 0 ? (
            <div className="p-8 border border-[var(--border)] text-center">
              <ShoppingBag size={32} className="text-[var(--muted)] mx-auto mb-2" />
              <p className="text-sm font-semibold">Aún no registras ningún pedido con esta cuenta.</p>
              <Link to="/catalogo" className="button mt-4">
                Explorar colección
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <article key={order.id} className="order-card">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow blue">PEDIDO {order.id}</span>
                      <p className="text-xs text-[var(--muted)] m-0">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' }) : 'Reciente'}
                      </p>
                    </div>
                    <span className="status-tag">{order.estado || 'Confirmado'}</span>
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

                  <div className="summary-line total font-bold pt-3 border-t border-[var(--border)]">
                    <span>Total pagado:</span>
                    <strong>{formatPEN(order.total)}</strong>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]">
                      Entrega en {order.customer?.distrito || 'Arequipa'}
                    </span>
                    <a
                      href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                        `¡Hola! Consulto el estado de mi pedido ${order.id}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0047ff] hover:underline"
                    >
                      Consultar por WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
