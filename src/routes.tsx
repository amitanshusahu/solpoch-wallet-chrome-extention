import App from "./App";
import ConnectApprove from "./components/pages/ConnectApprove";
import Onboarding from "./components/pages/Onboarding";
import UnlockPopup from "./components/pages/UnlockPopup";

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
    element: <UnlockPopup />
  },
  {
    path: '/onboarding',
    element: <Onboarding />
  }
]