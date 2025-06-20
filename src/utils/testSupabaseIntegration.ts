// src/utils/testSupabaseIntegration.ts
// Utility for testing Supabase integration

import EmailWalletService, { EmailWalletError } from '@/services/emailWallet';
import EmailResolver from '@/services/emailResolver';

export interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Test suite for Supabase integration
 * Call this from the browser console to verify everything works
 */
export class SupabaseIntegrationTest {
  
  /**
   * Test if Supabase is properly configured
   */
  static async testConfiguration(): Promise<TestResult> {
    try {
      const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      return {
        test: 'Supabase Configuration',
        success: isConfigured,
        error: isConfigured ? undefined : 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set',
        data: {
          hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      };
    } catch (error) {
      return {
        test: 'Supabase Configuration',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test email resolution (should use fallback if Supabase not configured)
   */
  static async testEmailResolution(): Promise<TestResult> {
    try {
      // Test with a known demo email
      const address = await EmailResolver.resolveEmailToAddress('alice@example.com');
      
      return {
        test: 'Email Resolution',
        success: !!address,
        data: { 
          email: 'alice@example.com', 
          address,
          usingSupabase: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
        }
      };
    } catch (error) {
      return {
        test: 'Email Resolution',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test user info retrieval
   */
  static async testUserInfo(): Promise<TestResult> {
    try {
      const userInfo = await EmailResolver.getUserByEmail('alice@example.com');
      
      return {
        test: 'User Info Retrieval',
        success: !!userInfo,
        data: userInfo
      };
    } catch (error) {
      return {
        test: 'User Info Retrieval',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test email registration status check
   */
  static async testEmailRegistrationCheck(): Promise<TestResult> {
    try {
      const isRegistered = await EmailResolver.isEmailRegistered('alice@example.com');
      const isNotRegistered = await EmailResolver.isEmailRegistered('nonexistent@example.com');
      
      return {
        test: 'Email Registration Check',
        success: isRegistered && !isNotRegistered,
        data: {
          'alice@example.com': isRegistered,
          'nonexistent@example.com': isNotRegistered
        }
      };
    } catch (error) {
      return {
        test: 'Email Registration Check',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Supabase direct operations (only if configured)
   */
  static async testSupabaseOperations(): Promise<TestResult> {
    try {
      const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      if (!isConfigured) {
        return {
          test: 'Supabase Operations',
          success: true,
          data: { message: 'Skipped - Supabase not configured (using fallback)' }
        };
      }

      // Test a simple read operation
      const testEmail = 'test@supabase.example';
      const result = await EmailWalletService.getWalletByEmail(testEmail);
      
      return {
        test: 'Supabase Operations',
        success: true,
        data: { 
          message: 'Supabase connection successful',
          testQuery: `Looked up ${testEmail}`,
          result: result || 'Not found (expected)'
        }
      };
    } catch (error) {
      return {
        test: 'Supabase Operations',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Running Supabase Integration Tests...\n');
    
    const tests = [
      this.testConfiguration(),
      this.testEmailResolution(),
      this.testUserInfo(),
      this.testEmailRegistrationCheck(),
      this.testSupabaseOperations()
    ];

    const results = await Promise.all(tests);
    
    // Log results
    results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.test}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.data) {
        console.log(`   Data:`, result.data);
      }
      
      console.log('');
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Results: ${successCount}/${results.length} tests passed`);
    
    return results;
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabase = SupabaseIntegrationTest;
}

export default SupabaseIntegrationTest;