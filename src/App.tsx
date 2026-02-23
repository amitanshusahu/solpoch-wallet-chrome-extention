import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/chrome/message";
import { useNavigate } from "react-router-dom";

function App() {
  const [status, setStatus] = useState<string>("Loading...");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVault() {
      const exists = await sendMessage("VAULT_EXISTS", undefined);
      const isUnlocked = await sendMessage("VAULT_IS_UNLOCKED", undefined);

      if (exists && isUnlocked) {
        const activeAccount = await sendMessage("VAULT_GET_ACTIVE_ACCOUNT", undefined);
        setStatus(`Connected: ${activeAccount?.pubkey}`);
      } else if (exists && !isUnlocked) {
        setStatus("LOCKED");
      } else {
        navigate("/onboarding#?onboarding : true");
      }
    }

    checkVault();
  }, []);

  async function handleUnlock() {
    const account = await sendMessage("VAULT_UNLOCK", { password });
    setStatus(`Connected: ${account.pubkey}`);
  }

  return (
    <div className="flex flex-col gap-4 w-75 h-75">
      <h2>{status}</h2>

      {status !== "Loading..." && (
        <>
          {
            (status === "CREATE" || status === "LOCKED") && (
              <input
                type="password"
                placeholder="Enter vault password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              />
            )
          }

          {status === "LOCKED" && (
            <button onClick={handleUnlock}>Unlock Wallet</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;
