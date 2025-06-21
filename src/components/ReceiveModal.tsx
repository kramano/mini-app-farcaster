
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface ReceiveModalProps {
  onClose: () => void;
}

const ReceiveModal = ({ onClose }: ReceiveModalProps) => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || "No wallet connected";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="fy-space-y-6">
      <div className="fy-text-center">
        <div style={{ 
          background: 'var(--gradient-balance)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--radius-medium)', 
          padding: '24px'
        }}>
          <div style={{ 
            width: '128px', 
            height: '128px', 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: 'var(--radius-medium)', 
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '64px' }}>📱</div>
          </div>
          <p className="fy-label" style={{ marginBottom: '12px' }}>
            Your USDC Wallet Address
          </p>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: 'var(--radius-small)', 
            padding: '12px', 
            border: '2px dashed var(--border-separator)',
            backdropFilter: 'blur(10px)'
          }}>
            <code style={{ 
              fontSize: '12px', 
              fontFamily: 'monospace', 
              color: 'var(--text-dark)', 
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {walletAddress}
            </code>
          </div>
        </div>
        
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          Send only USDC (SPL Token) to this address on Solana network
        </div>
      </div>
      
      <div className="fy-flex fy-gap-3">
        <button
          onClick={copyAddress}
          className="fy-button-secondary"
          style={{ flex: 1, height: '48px' }}
        >
          Copy Address
        </button>
        <button
          onClick={onClose}
          className="fy-button-primary"
          style={{ 
            flex: 1, 
            height: '48px',
            background: 'var(--gradient-receive)',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ReceiveModal;
