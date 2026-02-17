import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes.tsx';
const router = createMemoryRouter(routes, {
  initialEntries: ['/'],
});;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
