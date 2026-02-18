import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { sendMessage } from "../../lib/utils/chrome/message";

export default function ConnectApprove() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get("origin");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await sendMessage("APPROVAL_RESPONSE", { approved: true });
    window.close();
  };

  const handleReject = async () => {
    setLoading(true);
    await sendMessage("APPROVAL_RESPONSE", { approved: false });
    window.close();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2>Connection Request</h2>
      <p>Website requesting access:</p>
      <p className="font-bold">{origin}</p>
      
      <div className="flex gap-2">
        <button 
          onClick={handleApprove} 
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded"
        >
          Approve
        </button>
        <button 
          onClick={handleReject} 
          disabled={loading}
          className="bg-red-500 text-white p-2 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}