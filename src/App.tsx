import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/chrome/message";
import { Link } from "react-router-dom";

function App() {
  const [status, setStatus] = useState<string>("Loading...");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkVault() {
      const exists = await sendMessage("VAULT_EXISTS", undefined);
      setStatus(exists ? "UNLOCK" : "CREATE");
    }

    checkVault();
  }, []);

  async function handleCreate() {
    const mnemonic = await sendMessage("VAULT_CREATE", { password });

    console.log("Show mnemonic ONCE:", mnemonic);
    setStatus("UNLOCK");
  }

  async function handleUnlock() {
    const account = await sendMessage("VAULT_UNLOCK", { password });
    setStatus(`Connected: ${account.pubkey}`);
  }

  async function handleClear() {
    await sendMessage("VAULT_CLEAR", undefined);
    setStatus("CREATE");
  }

  return (
    <div className="flex flex-col gap-4 w-75 h-75">
      <h2>{status}</h2>

      {status !== "Loading..." && (
        <>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {status === "CREATE" && (
            <button onClick={handleCreate}>Create Wallet</button>
          )}

          {status === "UNLOCK" && (
            <button onClick={handleUnlock}>Unlock Wallet</button>
          )}
        </>
      )}

      <Link to="/badass">Go to BadAss Component</Link>
      <button onClick={handleClear} className="p-4 bg-gray-50">Logout</button>
    </div>
  );
}

export default App;
