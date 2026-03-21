import App from "./App";
import Accounts from "./components/pages/Accounts";
import ConnectApprove from "./components/pages/ConnectApprove";
import ErrorPage from "./components/pages/ErrorPage";
import More from "./components/pages/More";
import Onboarding from "./components/pages/Onboarding";
import Recieve from "./components/pages/Recieve";
import Send from "./components/pages/Send";
import SendSplTokens from "./components/pages/SendSPLtokens";
import PrivateKey from "./components/pages/Settings/PrivateKey";
import Settings from "./components/pages/Settings/Settings";
import ViewMnemonic from "./components/pages/Settings/ViewMnemonics";
import SignAllTransactionsApproval from "./components/pages/SignAllTransactionsApproval";
import SignAndSendTransactionApproval from "./components/pages/SignAndSendTransactionApproval";
import SignInApproval from "./components/pages/SignIn";
import SignMessage from "./components/pages/SignMessage";
import SignTransactionApproval from "./components/pages/SignTransactionApproval";
import Swap from "./components/pages/Swap";
import TokenInfo from "./components/pages/TokenInfo";
import TransactionHistory from "./components/pages/TransactionHistory";
import UnlockPopup from "./components/pages/UnlockPopup";

export const routes = [
  {
    path: '*',
    element: <ErrorPage />,
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
  },
  {
    path: '/signin-approval',
    element: <SignInApproval />
  },
  {
    path: '/accounts',
    element: <Accounts />
  },
  {
    path: '/token/:mint',
    element: <TokenInfo />
  },
  {
    path: '/tokens/send/:mint',
    element: <SendSplTokens />
  },
  {
    path: '/more',
    element: <More />
  },
  {
    path: '/swap',
    element: <Swap />
  },
  {
    path: '/transaction-history',
    element: <TransactionHistory />,
    errorElement: <ErrorPage />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/view-private-key',
    element: <PrivateKey />
  },
  {
    path: '/view-mnemonics',
    element: <ViewMnemonic />
  }
]