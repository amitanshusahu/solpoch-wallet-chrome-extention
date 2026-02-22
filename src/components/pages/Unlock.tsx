import { useEffect, useState } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";

export default function Unlock() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkInUnlocked() {
      const response = await sendMessage("VAULT_IS_UNLOCKED", undefined);
      setIsUnlocked(response);
    }
    checkInUnlocked();
  }, []);

  const handleUnlock = async () => {
    try {
      await sendMessage("VAULT_UNLOCK", { password });
      setIsUnlocked(true);
      await sendMessage("UNLOCK_POPUP_RESPONSE", { approved: true });
    } catch (error) {
      alert("Failed to unlock vault: " + (error as Error).message);
    }
  }

  return (
    <div>
      <h2>{isUnlocked ? "Vault is Unlocked" : "Vault is Locked"}</h2>
      <input type="text" onChange={(e) => setPassword(e.target.value)} value={password} />
      <button onClick={handleUnlock}>Unlock</button>
    </div>
  )
}