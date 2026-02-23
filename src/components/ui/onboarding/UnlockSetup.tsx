import { InfoIcon } from "@phosphor-icons/react";
import { useState, type ChangeEvent } from "react";

export default function Unlock({
  goNextStep,
  setPassword,
  password,
}: {
  goNextStep: () => void;
  setPassword: (password: string) => void;
  password: string;
}) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const handelPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  const handelConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }
  return (
    <div className="w-full h-full bg-bg p-8 flex flex-col justify-between">
      <div>
        <h1 className="text-lg mb-2 font-bold">Setup Unlock Pin</h1>
        <p className="text-sm text-gray-400 mb-6">
          This password will be required every time you want to access your funds, so make sure to choose one that is strong and memorable.
        </p>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={password}
          onChange={handelPasswordChange}
        />
        <input
          type="password"
          placeholder="Confirm your password"
          className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={confirmPassword}
          onChange={handelConfirmPasswordChange}
        />

        <div className="rounded bg-primary/20 p-4 mt-4 flex gap-2">
          <InfoIcon size={14} weight="fill" className="text-primary" />
          <h3 className="text-xs">your password must be at least 8 characters long. you should include a mix of letters, numbers, and symbols to make it more secure.</h3>
        </div>

      </div>
      <button
        // onClick={handleNext}
        className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-center text-xs inset-top mt-3 disabled:bg-primary/50"
        disabled={password.length < 8 || password !== confirmPassword}
        onClick={goNextStep}
      >
        Continue
      </button>
    </div>
  )
}