interface WalletErrorProps {
  error: string;
  onClear?: () => void;
}

const WalletError = ({ error, onClear }: WalletErrorProps) => {
  return (
    <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 whitespace-pre-wrap break-words">
            {error}
          </p>
          {onClear && (
            <button
              onClick={onClear}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletError;