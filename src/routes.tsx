import App from "./App";
import ConnectApprove from "./components/pages/ConnectApprove";
import Onboarding from "./components/pages/Onboarding";
import Recieve from "./components/pages/Recieve";
import Send from "./components/pages/Send";
import SignAllTransactionsApproval from "./components/pages/SignAllTransactionsApproval";
import SignAndSendTransactionApproval from "./components/pages/SignAndSendTransactionApproval";
import SignMessage from "./components/pages/SignMessage";
import SignTransactionApproval from "./components/pages/SignTransactionApproval";
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
  },
  {
    path: '/recieve',
    element: <Recieve />
  },
  {
    path: '/send',
    element: <Send />
  },
  {
    path: '/sign-and-send-approval',
    element: <SignAndSendTransactionApproval />
  },
  {
    path: '/sign-transaction-approval',
    element: <SignTransactionApproval />
  },
  {
    path: '/sign-all-transactions-approval',
    element: <SignAllTransactionsApproval />
  },
  {
    path: '/sign-message-approval',
    element: <SignMessage />
  }
]