import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Copy, Users, Mail, Wallet } from "lucide-react";

const DemoInfo = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

    const testEmails = [
        { email: "alice@example.com", name: "Alice Smith", address: "GVzuPLLgfNE5FrCKuHnWqghFWYvqFWo6BrW8X5m1Q6Tc" },
        { email: "bob@example.com", name: "Bob Johnson", address: "DaVDxpJ2KFQRB8PQZHuX4YF8jWdgXYtKmZoQT9HbGbJG" },
        { email: "charlie@example.com", name: "Charlie Brown", address: "8W6R2Nz3FjJQJ6YQgGJkKxQ5uMp9NvCx3LrEbHtPqC8D" },
        { email: "demo@dynamic.xyz", name: "Dynamic Demo", address: "FeH5oJ3QY2UGJb8PcN9xVrZ1LsKpMmWzEtRq4DvFgH7A" },
        { email: "test@solana.com", name: "Solana Test", address: "9Gj5NqM8WzF7YxPvU3BsKmH2LzEtRq4DvFgH7AFeH5oJ" }
    ];

    const copyEmail = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            setCopiedEmail(email);
            setTimeout(() => setCopiedEmail(null), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-auto p-4 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                                <div className="font-medium text-sm">Demo Recipients</div>
                                <div className="text-xs text-gray-500">Test email addresses available</div>
                            </div>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Available Test Recipients
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Click any email to copy it, then use it as a recipient in the Send modal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {testEmails.map((user) => (
                                <div
                                    key={user.email}
                                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => copyEmail(user.email)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{user.name}</span>
                                            {copiedEmail === user.email && (
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                    Copied!
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">{user.email}</div>
                                        <div className="text-xs text-gray-400 font-mono truncate">
                                            {user.address.slice(0, 8)}...{user.address.slice(-4)}
                                        </div>
                                    </div>
                                    <Copy className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                </div>
                            ))}

                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Wallet className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-blue-800">
                                        <div className="font-medium mb-1">How it works:</div>
                                        <ul className="space-y-1 text-blue-700">
                                            <li>• Email addresses are resolved to Solana wallet addresses</li>
                                            <li>• If recipient has no USDC account, one is created automatically</li>
                                            <li>• Transactions are sent on Solana Devnet</li>
                                            <li>• Real transactions, not simulated!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default DemoInfo;