import App from "./App";
import BadAss from "./BadAss";
import ConnectApprove from "./components/pages/ConnectApprove";

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
    path: '/badass',
    element: <BadAss />
  },
  {
    path: '/connect',
    element: <ConnectApprove />
  }
]