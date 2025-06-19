
import { useState } from "react";
import WalletCard from "@/components/WalletCard";
import Modal from "@/components/Modal";
import SendModal from "@/components/SendModal";
import ReceiveModal from "@/components/ReceiveModal";
import EarnModal from "@/components/EarnModal";

const Index = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <WalletCard onAction={setActiveModal} />
      
      <Modal isOpen={activeModal === "send"} onClose={closeModal} title="Send USDC">
        <SendModal onClose={closeModal} />
      </Modal>
      
      <Modal isOpen={activeModal === "receive"} onClose={closeModal} title="Receive USDC">
        <ReceiveModal onClose={closeModal} />
      </Modal>
      
      <Modal isOpen={activeModal === "earn"} onClose={closeModal} title="Start Earning">
        <EarnModal onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default Index;
