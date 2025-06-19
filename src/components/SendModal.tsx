
import { Button } from "@/components/ui/button";

interface SendModalProps {
  onClose: () => void;
}

const SendModal = ({ onClose }: SendModalProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="Enter Solana wallet address..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USDC)
          </label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Network fee:</span>
              <span>~$0.001</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 h-12 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          Send USDC
        </Button>
      </div>
    </div>
  );
};

export default SendModal;
