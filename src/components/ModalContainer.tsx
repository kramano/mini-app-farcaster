import Modal from './Modal';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import EarnModal from './EarnModal';
import { ModalType } from '@/hooks/useModalState';

interface ModalContainerProps {
  activeModal: ModalType;
  onClose: () => void;
}

const ModalContainer = ({ activeModal, onClose }: ModalContainerProps) => {
  return (
    <>
      <Modal isOpen={activeModal === "send"} onClose={onClose} title="Send USDC">
        <SendModal onClose={onClose} />
      </Modal>

      <Modal isOpen={activeModal === "receive"} onClose={onClose} title="Receive USDC">
        <ReceiveModal onClose={onClose} />
      </Modal>

      <Modal isOpen={activeModal === "earn"} onClose={onClose} title="Start Earning">
        <EarnModal onClose={onClose} />
      </Modal>
    </>
  );
};

export default ModalContainer;