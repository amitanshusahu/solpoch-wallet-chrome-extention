import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/chrome/message";
import { useNavigate } from "react-router-dom";
import SafeArea from "./components/ui/layout/SafeArea";
import { useAccountStore } from "./store";
import Unlock from "./components/ui/home/Unlock";

function App() {
  const [status, setStatus] = useState<"LOCKED" | "UNLOCKED">("LOCKED");
  const setAccount = useAccountStore((state) => state.setAccount);
  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVault() {
      const exists = await sendMessage("VAULT_EXISTS", undefined);
      const isUnlocked = await sendMessage("VAULT_IS_UNLOCKED", undefined);

      if (exists && isUnlocked) {
        const activeAccount = await sendMessage("VAULT_GET_ACTIVE_ACCOUNT", undefined);
        setAccount(activeAccount);
        setStatus("UNLOCKED");
      } else if (exists && !isUnlocked) {
        setStatus("LOCKED");
      } else {
        navigate("/onboarding#?onboarding : true");
      }
    }

    checkVault();
  }, []);

  if (status === "LOCKED") {
    return <Unlock setStatus={setStatus} />;
  }

  return (
    <SafeArea>
      <div>
        <h2>{status}</h2>
        <h2>{account?.pubkey}</h2>
      </div>
      <div className="flex gap-2">
        <div>1</div>
        <div>1</div>
        <div>1</div>
        <div>1</div>
      </div>
      <div>token</div>
    </SafeArea>
  );
}

export default App;
