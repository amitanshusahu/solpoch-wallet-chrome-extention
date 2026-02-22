import App from "./App";
import ConnectApprove from "./components/pages/ConnectApprove";
import Unlock from "./components/pages/Unlock";

export const routes = [
  {
    path: '*',
    element: <div>Not Found</div>
  },
  {
    path: '/',
    element: <App />
  },
  {
    path: '/connect',
    element: <ConnectApprove />
  },
  {
    path: '/unlock',
    element: <Unlock />
  }
]