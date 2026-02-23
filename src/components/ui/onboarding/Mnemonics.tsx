import { CopyIcon, InfoIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react";
import { sendMessage } from "../../../lib/utils/chrome/message";
export default function Mnemonics({
  goNextStep,
  password,
}: {
  goNextStep: () => void,
  password: string,
}) {
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [mnemonicAcknowledged, setMnemonicAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function createVaultAndGetMnemonic() {
      const res = await sendMessage("VAULT_CREATE", { password });
      setMnemonic(res);
    }
    createVaultAndGetMnemonic();
    const timeout = setTimeout(() => setMnemonic(undefined), 60000);
    return () => clearTimeout(timeout);
  }, [password]);

  useEffect(() => {
    return () => {
      setMnemonic(undefined);
    };
  }, []);

  const handleClipboardCopy = async () => {
    await navigator.clipboard.writeText(mnemonic || "");
    setCopied(true);
    setTimeout(() => {
      navigator.clipboard.writeText("");
      setCopied(false);
    }, 3000);
  }
  const handleNext = () => {
    goNextStep();
  }
  return (
    <div className="w-full h-full bg-bg p-8 flex flex-col justify-between">
      <div>
        <h2 className="text-sm">Why do I need a secret phrase ?</h2>
        <p className="text-xs text-gray-400 mt-2">
          A secret recovery phrase is the only way to recover your wallet if you lose your device. without it, there's no way to access your funds. It's crucial to store it securely and never share it with anyone.
        </p>

        <div className="grid text-xs grid-cols-3 gap-4 mt-8">
          {mnemonic ? mnemonic.split(" ").map((word, index) => (
            <div key={index} className="bg-white/5 px-3 py-1.5 rounded">{word}</div>
          )) : "Generating your secret phrase..."}
        </div>

        <button
          className="text-xs text-gray-400 p-3 w-full text-center mt-2 flex gap-2 justify-center items-center"
          onClick={handleClipboardCopy}
        >
          <CopyIcon size={14} />
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>

        <div className="rounded bg-primary/20 p-4 mt-4 flex gap-2">
          <InfoIcon size={14} weight="fill" className="text-primary" />
          <h3 className="text-xs">Never share this phrase with anyone. Solpoch will never ask for it.</h3>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 mt-4 flex items-start gap-2">
          <input type="checkbox" name="mnemonicAcknowledgement" id="mnemonicAcknowledgement" className="bg-primary" onChange={() => setMnemonicAcknowledged(!mnemonicAcknowledged)} />
          I have written it down on a paper or stored it in an encrypted note app
        </label>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-center text-xs inset-top mt-3 disabled:bg-primary/50"
          disabled={!mnemonicAcknowledged}
        >
          Continue
        </button>
      </div>
    </div>
  )
}