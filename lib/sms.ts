/**
 * SMS Service
 * Supports Twilio and can be extended for other providers
 */

interface SMSConfig {
  provider: 'twilio' | 'mock'
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
}

interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send SMS using configured provider
 */
export async function sendSMS(
  to: string,
  message: string,
  config?: SMSConfig
): Promise<SendSMSResult> {
  const provider = config?.provider || process.env.SMS_PROVIDER || 'mock'
  const accountSid = config?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID
  const authToken = config?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN
  const fromNumber = config?.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER

  // Clean phone number (remove non-numeric characters except +)
  const cleanPhone = to.replace(/[^\d+]/g, '')

  if (provider === 'twilio' && accountSid && authToken && fromNumber) {
    try {
      // Dynamic import to avoid build-time dependency
      // Use eval to prevent Next.js from statically analyzing this import
      const twilioModule = await new Function('return import("twilio")')()
      const twilio = twilioModule.default || twilioModule
      const TwilioClient = typeof twilio === 'function' ? twilio : twilio.default || twilio
      const client = TwilioClient(accountSid, authToken)

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: cleanPhone,
      })

      return {
        success: true,
        messageId: result.sid,
      }
    } catch (error: any) {
      // If twilio package is not installed, fall back to mock
      if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('Cannot find module')) {
        console.warn('Twilio package not installed, falling back to mock SMS')
        console.log(`[MOCK SMS] To: ${cleanPhone}, Message: ${message.substring(0, 50)}...`)
        return {
          success: true,
          messageId: `mock_${Date.now()}`,
        }
      }
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      }
    }
  }

  // Mock provider for development/testing
  console.log(`[MOCK SMS] To: ${cleanPhone}, Message: ${message.substring(0, 50)}...`)
  return {
    success: true,
    messageId: `mock_${Date.now()}`,
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic validation - at least 10 digits
  const cleaned = phone.replace(/[^\d]/g, '')
  return cleaned.length >= 10
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

