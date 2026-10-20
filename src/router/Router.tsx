import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface RouterContextType {
  path: string;
  search: string;
  navigate: (to: string, replace?: boolean) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  search: '',
  navigate: () => {},
  params: {}
});

export function useRouter() {
  return useContext(RouterContext);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState(() => ({
    path: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : ''
  }));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl({
        path: window.location.pathname,
        search: window.location.search
      });
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, replace = false) => {
    const url = new URL(to, window.location.origin);
    const path = url.pathname;
    const search = url.search;

    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setCurrentUrl({ path, search });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Extract dynamic params e.g. /producto/:slug
  let params: Record<string, string> = {};
  if (currentUrl.path.startsWith('/producto/')) {
    params.slug = currentUrl.path.replace('/producto/', '').replace(/\/$/, '');
  }

  return (
    <RouterContext.Provider
      value={{
        path: currentUrl.path,
        search: currentUrl.search,
        navigate,
        params
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function Link({
  to,
  children,
  className = '',
  onClick,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !to.startsWith('http') && !to.startsWith('//') && !to.startsWith('mailto:') && !to.startsWith('tel:') && !to.startsWith('#')) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
