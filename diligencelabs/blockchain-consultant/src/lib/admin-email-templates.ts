// Admin notification email templates for user management

// Subscription status notification template
export const getSubscriptionStatusTemplate = (userName: string, subscriptionStatus: string, details: string, actionRequired?: string) => {
  const statusColors = {
    ACTIVE: '#10b981',
    EXPIRED: '#ef4444',
    CANCELLED: '#f59e0b',
    SUSPENDED: '#dc2626',
    PENDING: '#6366f1'
  }
  
  const statusColor = statusColors[subscriptionStatus as keyof typeof statusColors] || '#6b7280'
  
  return {
    subject: `Subscription Status Update - ${subscriptionStatus} | Diligence Labs`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Subscription Status Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, ${statusColor} 0%, ${statusColor}cc 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: 600; color: white; margin-bottom: 8px; }
          .header-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
          .text { color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
          .status-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 25px 0; }
          .action-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, ${statusColor} 0%, ${statusColor}cc 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #111111; padding: 30px; text-align: center; border-top: 1px solid #2d2d2d; }
          .footer-text { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Subscription Update</div>
          </div>
          
          <div class="content">
            <h1 class="title">Subscription Status Update</h1>
            
            <p class="text">Hello ${userName},</p>
            
            <p class="text">
              We're writing to inform you about an important update to your subscription status.
            </p>
            
            <div class="status-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">Current Status:</p>
              <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: ${statusColor}; text-transform: uppercase;">
                ${subscriptionStatus}
              </p>
              <p style="margin: 0; color: #d1d5db; line-height: 1.6;">
                ${details}
              </p>
            </div>
            
            ${actionRequired ? `
            <div class="action-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #fbbf24;">⚠️ Action Required</p>
              <p style="margin: 0; color: #fbbf24; font-size: 14px; line-height: 1.5;">
                ${actionRequired}
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'https://diligence-labs.com'}/dashboard" class="button">
                View Dashboard
              </a>
            </div>
            
            <p style="margin: 25px 0 0 0; font-size: 14px; color: #9ca3af;">
              If you have any questions about this update, please contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Best regards,<br>
              The Diligence Labs Team
            </p>
            <div style="margin: 20px 0 0 0; padding: 20px 0 0 0; border-top: 1px solid #2d2d2d;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2024 Diligence Labs. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Malicious activity alert template
export const getMaliciousActivityTemplate = (userName: string, activityType: string, details: string, ipAddress?: string, timestamp?: string) => {
  return {
    subject: `🚨 Security Alert: Suspicious Activity Detected | Diligence Labs`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Security Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: 600; color: white; margin-bottom: 8px; }
          .header-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
          .text { color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
          .alert-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 25px 0; }
          .details-box { background: #1f1f1f; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .action-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #111111; padding: 30px; text-align: center; border-top: 1px solid #2d2d2d; }
          .footer-text { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚨 Security Alert</div>
            <div class="header-text">Diligence Labs - Account Protection</div>
          </div>
          
          <div class="content">
            <h1 class="title">Suspicious Activity Detected</h1>
            
            <p class="text">Hello ${userName},</p>
            
            <p class="text">
              Our security systems have detected potentially suspicious activity on your account. 
              We're notifying you as a precautionary measure to ensure your account remains secure.
            </p>
            
            <div class="alert-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #fca5a5;">🛡️ Activity Type:</p>
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #ef4444; text-transform: uppercase;">
                ${activityType}
              </p>
              <p style="margin: 0; color: #d1d5db; line-height: 1.6;">
                ${details}
              </p>
            </div>
            
            ${ipAddress || timestamp ? `
            <div class="details-box">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #9ca3af;">Activity Details:</p>
              ${timestamp ? `<p style="margin: 0 0 8px 0; color: #d1d5db;">⏰ Time: ${timestamp}</p>` : ''}
              ${ipAddress ? `<p style="margin: 0; color: #d1d5db;">📍 IP Address: ${ipAddress}</p>` : ''}
            </div>
            ` : ''}
            
            <div class="action-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #fbbf24;">🔐 Immediate Actions Taken:</p>
              <ul style="margin: 10px 0 0 0; color: #fbbf24; font-size: 14px; line-height: 1.5;">
                <li>Your account has been temporarily monitored for additional security</li>
                <li>All active sessions have been logged and reviewed</li>
                <li>Additional verification may be required for sensitive actions</li>
              </ul>
            </div>
            
            <div class="action-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #fbbf24;">✅ What You Should Do:</p>
              <ul style="margin: 10px 0 0 0; color: #fbbf24; font-size: 14px; line-height: 1.5;">
                <li>Change your password immediately if you suspect unauthorized access</li>
                <li>Review your recent account activity in your dashboard</li>
                <li>Contact our support team if this activity wasn't authorized by you</li>
                <li>Enable two-factor authentication if not already active</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'https://diligence-labs.com'}/dashboard/profile" class="button">
                Secure My Account
              </a>
            </div>
            
            <p style="margin: 25px 0 0 0; font-size: 12px; color: #9ca3af;">
              If this activity was authorized by you, no further action is needed. 
              Our security systems will continue to monitor your account for protection.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Security Team<br>
              Diligence Labs
            </p>
            <div style="margin: 20px 0 0 0; padding: 20px 0 0 0; border-top: 1px solid #2d2d2d;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                This is an automated security notification. Do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Subscription expiration warning template
export const getSubscriptionExpirationTemplate = (userName: string, planName: string, expirationDate: string, daysRemaining: number) => {
  const urgencyColor = daysRemaining <= 3 ? '#ef4444' : daysRemaining <= 7 ? '#f59e0b' : '#10b981'
  const urgencyText = daysRemaining <= 3 ? '🚨 URGENT' : daysRemaining <= 7 ? '⚠️ SOON' : '📅 REMINDER'
  
  return {
    subject: `${urgencyText}: Your ${planName} subscription expires in ${daysRemaining} days | Diligence Labs`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Subscription Expiration Notice</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, ${urgencyColor} 0%, ${urgencyColor}cc 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: 600; color: white; margin-bottom: 8px; }
          .header-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
          .text { color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
          .expiration-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin: 25px 0; }
          .benefits-box { background: #1f1f1f; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #111111; padding: 30px; text-align: center; border-top: 1px solid #2d2d2d; }
          .footer-text { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Subscription Renewal Notice</div>
          </div>
          
          <div class="content">
            <h1 class="title">${urgencyText}: Subscription Expiring Soon</h1>
            
            <p class="text">Hello ${userName},</p>
            
            <p class="text">
              Your ${planName} subscription with Diligence Labs 
              will expire soon. Don't miss out on continued access to our premium blockchain consulting services.
            </p>
            
            <div class="expiration-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">Current Plan:</p>
              <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: ${urgencyColor};">
                ${planName}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">Expiration Date:</p>
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #ffffff;">
                ${expirationDate}
              </p>
              <p style="margin: 0; font-size: 24px; font-weight: 600; color: ${urgencyColor};">
                ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining
              </p>
            </div>
            
            <div class="benefits-box">
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                🚀 Don't lose access to:
              </p>
              <ul style="margin: 0; color: #d1d5db; line-height: 1.6;">
                <li>Expert blockchain consultation sessions</li>
                <li>Comprehensive due diligence reports</li>
                <li>Token launch and strategy guidance</li>
                <li>Priority support and personalized advice</li>
                <li>Exclusive market insights and analysis</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'https://diligence-labs.com'}/dashboard#subscription" class="button">
                Renew Subscription
              </a>
            </div>
            
            <p class="text" style="font-size: 14px; color: #9ca3af;">
              Renew now to avoid any interruption in service. If you have any questions about your subscription 
              or need assistance with renewal, our support team is here to help.
            </p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="mailto:support@diligence-labs.com" style="color: #10b981; text-decoration: none;">
                📧 Contact Support
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Best regards,<br>
              The Diligence Labs Team
            </p>
            <div style="margin: 20px 0 0 0; padding: 20px 0 0 0; border-top: 1px solid #2d2d2d;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2024 Diligence Labs. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}