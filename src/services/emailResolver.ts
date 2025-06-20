// src/services/emailResolver.ts

export interface AddressMapping {
    email: string;
    address: string;
    name?: string;
    verified: boolean;
}

// Demo address mappings - in production this would be a database lookup
const EMAIL_TO_ADDRESS_MAP: AddressMapping[] = [
    {
        email: "alice@example.com",
        address: "GVzuPLLgfNE5FrCKuHnWqghFWYvqFWo6BrW8X5m1Q6Tc",
        name: "Alice Smith",
        verified: true
    },
    {
        email: "bob@example.com",
        address: "DaVDxpJ2KFQRB8PQZHuX4YF8jWdgXYtKmZoQT9HbGbJG",
        name: "Bob Johnson",
        verified: true
    },
    {
        email: "charlie@example.com",
        address: "8W6R2Nz3FjJQJ6YQgGJkKxQ5uMp9NvCx3LrEbHtPqC8D",
        name: "Charlie Brown",
        verified: true
    },
    {
        email: "demo@dynamic.xyz",
        address: "FeH5oJ3QY2UGJb8PcN9xVrZ1LsKpMmWzEtRq4DvFgH7A",
        name: "Dynamic Demo",
        verified: true
    },
    {
        email: "test@solana.com",
        address: "9Gj5NqM8WzF7YxPvU3BsKmH2LzEtRq4DvFgH7AFeH5oJ",
        name: "Solana Test",
        verified: true
    }
];

export class EmailResolver {
    /**
     * Resolve an email address to a Solana wallet address
     */
    static async resolveEmailToAddress(email: string): Promise<string | null> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mapping = EMAIL_TO_ADDRESS_MAP.find(
            m => m.email.toLowerCase() === email.toLowerCase()
        );

        return mapping?.address || null;
    }

    /**
     * Get user info by email
     */
    static async getUserByEmail(email: string): Promise<AddressMapping | null> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return EMAIL_TO_ADDRESS_MAP.find(
            m => m.email.toLowerCase() === email.toLowerCase()
        ) || null;
    }

    /**
     * Register a new email-to-address mapping (for demo purposes)
     */
    static async registerEmailMapping(email: string, address: string, name?: string): Promise<boolean> {
        // In production, this would be stored in a database
        const existingIndex = EMAIL_TO_ADDRESS_MAP.findIndex(
            m => m.email.toLowerCase() === email.toLowerCase()
        );

        const mapping: AddressMapping = {
            email: email.toLowerCase(),
            address,
            name,
            verified: false // Would require email verification in production
        };

        if (existingIndex >= 0) {
            EMAIL_TO_ADDRESS_MAP[existingIndex] = mapping;
        } else {
            EMAIL_TO_ADDRESS_MAP.push(mapping);
        }

        return true;
    }

    /**
     * Validate if an email address exists in our system
     */
    static async isEmailRegistered(email: string): Promise<boolean> {
        const user = await this.getUserByEmail(email);
        return user !== null;
    }

    /**
     * Get all registered emails (for testing/demo purposes)
     */
    static getRegisteredEmails(): string[] {
        return EMAIL_TO_ADDRESS_MAP.map(m => m.email);
    }

    /**
     * Generate a deterministic address for unregistered emails
     * This creates a temporary "holding" address based on the email
     * In production, you might create escrow accounts or use a different approach
     */
    static generateTemporaryAddress(email: string): string {
        // This is a simple hash-based approach for demo purposes
        // In production, you'd want a more sophisticated system
        const hash = this.simpleHash(email);

        // Generate a fake but consistent address based on email hash
        const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let result = "";

        for (let i = 0; i < 44; i++) {
            result += chars[hash % chars.length];
            hash = Math.floor(hash / chars.length);
        }

        return result;
    }

    private static simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Error types for better error handling
export class EmailResolverError extends Error {
    constructor(
        message: string,
        public code: 'EMAIL_NOT_FOUND' | 'INVALID_EMAIL' | 'NETWORK_ERROR' | 'UNKNOWN'
    ) {
        super(message);
        this.name = 'EmailResolverError';
    }
}

export default EmailResolver;