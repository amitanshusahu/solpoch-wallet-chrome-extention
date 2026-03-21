import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { chromeStoragePersister } from './lib/storage/index.ts';

const router = createHashRouter(routes);
const queryClient = new QueryClient({});

persistQueryClient({
  queryClient,
  persister: chromeStoragePersister,
  maxAge: 24 * 60 * 60 * 1000,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
)