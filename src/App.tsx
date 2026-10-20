import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { VideoModal } from './components/VideoModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { WhatsAppFloating } from './components/WhatsAppFloating';

import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { LookbookView } from './views/LookbookView';
import { RunClubView } from './views/RunClubView';
import { AccountView } from './views/AccountView';
import { AdminView } from './views/AdminView';
import { InfoPageView } from './views/InfoPageView';
import { CheckCircle2, X } from 'lucide-react';

function AppContent() {
  const { path, navigate } = useRouter();
  const { toast, notify, fetchProducts, fetchConfig } = useStore();

  useEffect(() => {
    fetchProducts();
    fetchConfig();
    import('./lib/firebase').then(({ testConnection }) => {
      testConnection().catch(() => {});
    });
  }, []);

  // Handle route matching
  const renderView = () => {
    if (path === '/') return <HomeView />;
    if (path === '/catalogo') return <CatalogView />;
    if (path === '/favoritos') return <CatalogView favoritesOnly />;
    if (path.startsWith('/producto/')) return <ProductDetailView />;
    if (path === '/checkout') return <CheckoutView />;
    if (path === '/lookbook') return <LookbookView />;
    if (path === '/run-club') return <RunClubView />;
    if (path === '/cuenta' || path === '/login') return <AccountView />;
    if (path === '/admin') return <AdminView />;

    // Shortcuts
    if (path === '/hombre') {
      navigate('/catalogo?publico=Hombre', true);
      return null;
    }
    if (path === '/mujer') {
      navigate('/catalogo?publico=Mujer', true);
      return null;
    }
    if (path === '/running' || path === '/training' || path === '/altura') {
      const linea = path.replace('/', '');
      navigate(`/catalogo?linea=${linea[0].toUpperCase() + linea.slice(1)}`, true);
      return null;
    }

    // Info pages
    const infoPages = [
      'nosotros',
      'contacto',
      'guia-de-tallas',
      'cuidado',
      'envios',
      'terminos',
      'privacidad',
      'reclamaciones'
    ];
    const pageSlug = path.replace('/', '');
    if (infoPages.includes(pageSlug)) {
      return <InfoPageView page={pageSlug} />;
    }

    // 404 Not Found
    return (
      <div id="main-content" className="container empty-state py-24 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold mt-2">Página no encontrada</h2>
        <p className="text-[var(--muted)] mt-2">
          La ruta que buscas no existe o cambió de lugar.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="button mt-6"
        >
          Volver al inicio
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#151515]">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />

      {/* Global Overlays & Drawers */}
      <CartDrawer />
      <SearchModal />
      <VideoModal />
      <SizeGuideModal />
      <WhatsAppFloating />

      {/* Global Toast */}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => notify('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
