import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/background-message";

function App() {
  const [status, setStatus] = useState<string>("Loading...");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkVault() {
      const exists = await sendMessage<boolean>({
        type: "VAULT_EXISTS"
      });

      setStatus(exists ? "UNLOCK" : "CREATE");
    }

    checkVault();
  }, []);

  async function handleCreate() {
    const mnemonic = await sendMessage<string>({
      type: "VAULT_CREATE",
      password
    });

    console.log("Show mnemonic ONCE:", mnemonic);
    setStatus("UNLOCK");
  }

  async function handleUnlock() {
    const publicKey = await sendMessage<string>({
      type: "VAULT_UNLOCK",
      password
    });

    setStatus(`Connected: ${publicKey}`);
  }

  return (
    <div>
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
    </div>
  );
}

export default App;
