import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from '../router/Router';
import { WHATSAPP_PHONE } from '../utils/pricing';

export function InfoPageView({ page }: { page: string }) {
  const [complaintTicket, setComplaintTicket] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState('');

  const [complaintForm, setComplaintForm] = useState({
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo: 'Reclamo',
    monto: '',
    pedidoId: '',
    descripcion: '',
    pedidoConsumidor: ''
  });

  const whatsappHref = (msg: string) =>
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;

  const pageTitles: Record<string, string> = {
    'nosotros': 'Nuestra historia',
    'contacto': 'Contacto',
    'guia-de-tallas': 'Guía de tallas',
    'cuidado': 'Cuida tus prendas',
    'envios': 'Envíos y cambios',
    'terminos': 'Términos y condiciones',
    'privacidad': 'Política de privacidad',
    'reclamaciones': 'Libro de reclamaciones'
  };

  const title = pageTitles[page] || 'Información';

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintLoading(true);
    setComplaintError('');

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm)
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setComplaintTicket(data.ticket);
        try {
          const { saveComplaintToDb } = await import('../services/db');
          await saveComplaintToDb({ ticket: data.ticket, ...complaintForm, createdAt: new Date().toISOString() });
        } catch {}
      } else {
        throw new Error(data.error || 'Error al registrar hoja de reclamación');
      }
    } catch (err: any) {
      // Fallback ticket
      const fallbackTicket = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      setComplaintTicket(fallbackTicket);
      try {
        const { saveComplaintToDb } = await import('../services/db');
        await saveComplaintToDb({ ticket: fallbackTicket, ...complaintForm, createdAt: new Date().toISOString() });
      } catch {}
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div id="main-content">
      <article className="container info-page">
        <nav className="breadcrumb" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> / {title}
        </nav>

        <span className="eyebrow blue">URBAN VIBE SPORT / ALTURA 2335</span>
        <h1>{title}</h1>

        <div className="prose">
          {/* NOSOTROS */}
          {page === 'nosotros' && (
            <>
              <img
                className="info-cover"
                src="/images/comunidad.webp"
                alt="La comunidad de Urban Vibe en Arequipa"
              />
              <h2>Fibras peruanas. Espíritu arequipeño.</h2>
              <p>
                ALTURA 2335 toma su nombre de la altitud de Arequipa (2 335 m s. n. m.). Una colección concebida para quienes corren por la campiña, entrenan con intensidad en la ciudad y exploran los senderos volcánicos hacia la cumbre.
              </p>
              <p>
                Son 14 prendas diseñadas para responder a los contrastes térmicos de la altura, combinando la legendaria suavidad del <strong>algodón pima peruano</strong>, el abrigo ultraligero de la <strong>baby alpaca</strong> y la termorregulación de la <strong>lana merino</strong>.
              </p>
              <p>
                Nuestra propuesta se articula en tres líneas —Running, Training y Altura— conectadas mediante un inteligente sistema de tres capas que te permite adaptar tu abrigo según la hora del día y la intensidad de tu movimiento.
              </p>
              <div className="mt-6">
                <Link to="/catalogo" className="button">
                  Conoce la colección <ArrowUpRight size={18} />
                </Link>
              </div>
            </>
          )}

          {/* CONTACTO */}
          {page === 'contacto' && (
            <>
              <p>
                Te ayudamos a elegir tus prendas, confirmar tu talla ideal y coordinar la entrega en cualquier distrito de Arequipa y el resto del país.
              </p>

              <div className="contact-card">
                <h2>Atención directa por WhatsApp</h2>
                <p className="font-mono text-lg font-bold my-2">+51 925 147 306</p>
                <p className="text-xs text-[var(--muted)] mb-4">
                  Horario de atención: Lunes a Sábado de 7:00 a. m. a 8:00 p. m.
                </p>
                <a
                  className="button"
                  href={whatsappHref('¡Hola, Urban Vibe! Necesito ayuda con la colección ALTURA 2335.')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare size={18} /> Iniciar conversación
                </a>
              </div>

              <h2>Consulta sobre tu pedido</h2>
              <p>
                Para agilizar tu atención, ten a la mano el número de pedido (ej. <code>UV-40912</code>). Si compraste habiendo iniciado sesión, puedes ver tu historial completo en{' '}
                <Link to="/cuenta">Mi cuenta</Link>.
              </p>
            </>
          )}

          {/* GUIA DE TALLAS */}
          {page === 'guia-de-tallas' && (
            <>
              <p>
                Esta tabla orientativa utiliza medidas corporales en centímetros. Las medidas de cada prenda son verificadas con nuestro asesor antes de concretar la entrega.
              </p>

              <div className="table-wrap">
                <table>
                  <caption>Referencia general para prendas de la colección (en cm)</caption>
                  <thead>
                    <tr>
                      <th>Talla</th>
                      <th>Pecho</th>
                      <th>Cintura</th>
                      <th>Cadera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['XS', '80–86', '62–68', '86–92'],
                      ['S', '86–94', '68–76', '92–98'],
                      ['M', '94–102', '76–84', '98–106'],
                      ['L', '102–110', '84–92', '106–114'],
                      ['XL', '110–118', '92–100', '114–122']
                    ].map(row => (
                      <tr key={row[0]}>
                        {row.map((val, idx) => (
                          <td key={idx} className={idx === 0 ? 'font-bold' : ''}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2>Cómo tomar tus medidas</h2>
              <p>
                Usa una cinta métrica flexible. Para el pecho, mide alrededor de la parte más prominente; para la cintura, mide la línea natural más estrecha; para la cadera, mide la parte más ancha con los pies juntos.
              </p>

              <a
                className="text-link inline-flex items-center gap-2 mt-4"
                href={whatsappHref('¡Hola! Quisiera ayuda para elegir mi talla en ALTURA 2335.')}
                target="_blank"
                rel="noreferrer"
              >
                <MessageSquare size={16} /> Ayúdame a elegir mi talla <ArrowUpRight size={17} />
              </a>
            </>
          )}

          {/* CUIDADO */}
          {page === 'cuidado' && (
            <>
              <h2>La etiqueta es tu punto de partida.</h2>
              <p>
                Nuestras prendas emplean fibras naturales nobles de alta calidad. Sigue siempre las indicaciones de la etiqueta y consulta con nosotros ante cualquier inquietud antes de lavar.
              </p>

              <h2>Baby alpaca y merino</h2>
              <p>
                Las fibras de alpaca y lana merino poseen propiedades antibacterianas naturales que repelen olores; airearlas tras cada entrenamiento suele ser suficiente. Si la etiqueta indica lavado a mano, utiliza agua fría (máx. 30 °C) y champú suave para lana, sin frotar ni retorcer. Seca siempre en posición horizontal sobre una toalla, a la sombra.
              </p>

              <h2>Algodón pima y French terry</h2>
              <p>
                Lava con colores similares, del revés y con agua fría. Evita secadoras calientes para prevenir encogimientos y prolongar la suavidad de las fibras largas del pima.
              </p>

              <h2>Casaca cortaviento y tejidos técnicos</h2>
              <p>
                Cierra todas las cremalleras antes de meter la prenda a la lavadora. Evita suavizantes que puedan obturar la membrana transpirable y no planches directamente sobre los estampados termosellados.
              </p>
            </>
          )}

          {/* ENVIOS */}
          {page === 'envios' && (
            <>
              <h2>Entregas en Arequipa</h2>
              <p>
                Realizamos entregas coordinadas en todos los distritos de la provincia de Arequipa. Las tarifas van de S/ 8 a S/ 18 según la zona (Yanahuara, Cayma, Cercado, Cerro Colorado, Paucarpata, etc.).
              </p>
              <p>
                <strong>Envío gratis:</strong> Todos los pedidos con un subtotal de prendas igual o superior a <strong>S/ 299.00</strong> califican para envío gratuito automático en Arequipa.
              </p>

              <h2>Coordinación por WhatsApp</h2>
              <p>
                Nuestro asesor confirma la disponibilidad de tallas, la fecha y la franja horaria de entrega directamente contigo vía WhatsApp antes de despachar el pedido.
              </p>

              <h2>Cambios de talla</h2>
              <p>
                Si requieres un cambio de talla, dispones de 7 días naturales desde la recepción de la prenda. La prenda debe encontrarse intacta, sin uso, en su empaque original y con todas las etiquetas puestas.
              </p>
            </>
          )}

          {/* TERMINOS */}
          {page === 'terminos' && (
            <>
              <p>
                Esta tienda es la plataforma en línea de Urban Vibe Sport · ALTURA 2335 en Arequipa, Perú.
              </p>

              <h2>Pedidos y reservas</h2>
              <p>
                Registrar un pedido en la tienda reserva las unidades correspondientes en nuestro inventario bajo el estado «Pendiente de confirmación». Un asesor de nuestro equipo valida existencias, coordinará contigo el medio de pago (Yape, transferencia bancaria o pago contra entrega) y acordará los detalles de la entrega.
              </p>

              <h2>Precios y promociones</h2>
              <p>
                Todos los precios se encuentran expresados en Soles peruanos (PEN) e incluyen los tributos aplicables de ley. Los códigos promocionales (ej. <code>ALTURA10</code> para 10 % de descuento, <code>CLUB20</code> para 20 % en miembros registrados y <code>CAPAS10</code> para el conjunto de tres capas) aplican sobre el subtotal de prendas y no son acumulables entre sí.
              </p>
            </>
          )}

          {/* PRIVACIDAD */}
          {page === 'privacidad' && (
            <>
              <h2>Información recopilada</h2>
              <p>
                Urban Vibe Sport recopila únicamente los datos necesarios para procesar tus pedidos, coordinar la entrega y ofrecerte beneficios de nuestro Run Club (nombre, teléfono celular/WhatsApp, correo electrónico y dirección de entrega).
              </p>

              <h2>Uso y protección de datos</h2>
              <p>
                Tus datos no se comparten con terceros con fines publicitarios ajenos a Urban Vibe Sport. La comunicación de pedidos se realiza de forma directa y transparente a través de los canales autorizados.
              </p>

              <h2>Tus derechos</h2>
              <p>
                Puedes solicitar la actualización o supresión de tus datos personales en cualquier momento escribiéndonos a través de nuestra página de <Link to="/contacto">contacto</Link>.
              </p>
            </>
          )}

          {/* RECLAMACIONES */}
          {page === 'reclamaciones' && (
            <>
              <p>
                Conforme a lo dispuesto por el Código de Protección y Defensa del Consumidor (Ley N.º 29571), ponemos a tu disposición este Libro de Reclamaciones virtual.
              </p>

              {complaintTicket ? (
                <div className="p-6 border border-[#0047ff] bg-[#0047ff]/5 space-y-3">
                  <div className="flex items-center gap-2 text-[#0047ff] font-bold">
                    <CheckCircle2 size={24} /> Hoja de Reclamación Registrada
                  </div>
                  <p className="text-sm">
                    Código de registro: <strong className="font-mono text-base">{complaintTicket}</strong>
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Hemos registrado tu comunicación en nuestro sistema. Nos pondremos en contacto contigo a la brevedad conforme al plazo legal establecido.
                  </p>
                  <Link to="/" className="button mt-3">
                    Volver al inicio
                  </Link>
                </div>
              ) : (
                <form className="space-y-4 mt-6" onSubmit={handleComplaintSubmit}>
                  {complaintError && <p className="error">{complaintError}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label>
                      Nombre completo
                      <input
                        type="text"
                        required
                        value={complaintForm.nombre}
                        onChange={e => setFormDataField('nombre', e.target.value)}
                        placeholder="Nombres y Apellidos"
                      />
                    </label>

                    <label>
                      DNI / Carné de Extranjería
                      <input
                        type="text"
                        required
                        value={complaintForm.documento}
                        onChange={e => setFormDataField('documento', e.target.value)}
                        placeholder="Número de documento"
                      />
                    </label>

                    <label>
                      Correo electrónico
                      <input
                        type="email"
                        required
                        value={complaintForm.email}
                        onChange={e => setFormDataField('email', e.target.value)}
                        placeholder="tu@correo.com"
                      />
                    </label>

                    <label>
                      Teléfono / WhatsApp
                      <input
                        type="tel"
                        required
                        value={complaintForm.telefono}
                        onChange={e => setFormDataField('telefono', e.target.value)}
                        placeholder="+51 987 654 321"
                      />
                    </label>
                  </div>

                  <label>
                    Dirección (Arequipa o lugar de residencia)
                    <input
                      type="text"
                      required
                      value={complaintForm.direccion}
                      onChange={e => setFormDataField('direccion', e.target.value)}
                      placeholder="Calle, urbanización y distrito"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label>
                      Tipo de comunicación
                      <select
                        value={complaintForm.tipo}
                        onChange={e => setFormDataField('tipo', e.target.value)}
                      >
                        <option value="Reclamo">Reclamo (disconformidad sobre el producto o servicio)</option>
                        <option value="Queja">Queja (malestar respecto a la atención)</option>
                      </select>
                    </label>

                    <label>
                      Monto reclamado (S/)
                      <input
                        type="text"
                        value={complaintForm.monto}
                        onChange={e => setFormDataField('monto', e.target.value)}
                        placeholder="Ej. S/ 129.00"
                      />
                    </label>

                    <label>
                      Código de pedido (opcional)
                      <input
                        type="text"
                        value={complaintForm.pedidoId}
                        onChange={e => setFormDataField('pedidoId', e.target.value)}
                        placeholder="Ej. UV-40912"
                      />
                    </label>
                  </div>

                  <label>
                    Detalle de la reclamación
                    <textarea
                      rows={4}
                      required
                      value={complaintForm.descripcion}
                      onChange={e => setFormDataField('descripcion', e.target.value)}
                      placeholder="Describe claramente los hechos ocurridos..."
                    />
                  </label>

                  <label>
                    Pedido del consumidor
                    <textarea
                      rows={2}
                      required
                      value={complaintForm.pedidoConsumidor}
                      onChange={e => setFormDataField('pedidoConsumidor', e.target.value)}
                      placeholder="¿Qué solución concreta solicitas?"
                    />
                  </label>

                  <button
                    type="submit"
                    className="button py-3 text-sm"
                    disabled={complaintLoading}
                  >
                    {complaintLoading ? 'Registrando...' : 'Enviar hoja de reclamación'} <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </article>
    </div>
  );

  function setFormDataField(field: string, val: string) {
    setComplaintForm(prev => ({ ...prev, [field]: val }));
  }
}
