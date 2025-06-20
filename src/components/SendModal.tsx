import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, DollarSign, AlertCircle } from "lucide-react";
import { useSendUsdc } from "@/hooks/useSendUsdc";

interface SendModalProps {
    onClose: () => void;
    balance: string;
    usdcMintAddress?: string;
    onTransactionSuccess?: () => void;
}

const SendModal = ({ onClose, balance, usdcMintAddress, onTransactionSuccess }: SendModalProps) => {
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [errors, setErrors] = useState<{ email?: string; amount?: string }>({});

    // Hook handles all the business logic
    const { sendUsdc, isLoading, error, clearError } = useSendUsdc({
        usdcMintAddress,
        onSuccess: (result) => {
            console.log('USDC sent successfully:', result);
            onTransactionSuccess?.();
            onClose();
        },
        onError: (error) => {
            console.error('USDC send failed:', error);
            // Error handling is done in the hook via toast notifications
        }
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateAmount = (amount: string) => {
        const num = parseFloat(amount);
        const balanceNum = parseFloat(balance);

        if (isNaN(num) || num <= 0) {
            return "Amount must be greater than 0";
        }

        if (num > balanceNum) {
            return "Insufficient balance";
        }

        return null;
    };

    const handleSubmit = async () => {
        // Clear any previous container-level errors
        clearError();

        const newErrors: { email?: string; amount?: string } = {};

        // Validate email
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate amount
        const amountError = validateAmount(amount);
        if (!amount) {
            newErrors.amount = "Amount is required";
        } else if (amountError) {
            newErrors.amount = amountError;
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                await sendUsdc(email, amount);
            } catch (error) {
                console.error("Send failed:", error);
            }
        }
    };

    const handleAmountChange = (value: string) => {
        // Only allow numbers and decimal point
        const sanitized = value.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            return;
        }

        // Limit to 6 decimal places (USDC precision)
        if (parts[1] && parts[1].length > 6) {
            return;
        }

        setAmount(sanitized);

        // Clear amount error when user types
        if (errors.amount) {
            setErrors(prev => ({ ...prev, amount: undefined }));
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);

        // Clear email error when user types
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const setMaxAmount = () => {
        setAmount(balance);
    };

    return (
        <div className="space-y-6">
            {/* Hook-level error display */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Recipient Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Send to
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                    </p>
                )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount
                </Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="amount"
                        type="text"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className={`pl-10 pr-20 h-12 ${errors.amount ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={setMaxAmount}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200 transition-colors"
                        disabled={isLoading}
                    >
                        MAX
                    </button>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Available: {balance} USDC</span>
                    {amount && !errors.amount && (
                        <span>≈ ${parseFloat(amount || '0').toFixed(2)}</span>
                    )}
                </div>
                {errors.amount && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount}
                    </p>
                )}
            </div>

            {/* Transaction Preview */}
            {amount && !errors.amount && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Transaction Summary</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">{amount} USDC</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Network fee:</span>
                            <span className="font-medium">~$0.001</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{amount} USDC + fees</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Alert */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                    If the recipient doesn't have a USDC account, we'll create one for them automatically.
                    The transaction will be sent on Solana Devnet.
                </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !email || !amount}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Send USDC
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SendModal;