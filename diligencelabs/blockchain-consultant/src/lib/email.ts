import * as nodemailer from 'nodemailer'

interface EmailConfig {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // For production, use SendGrid, AWS SES, or other email service
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // For development, use Ethereal Email (test account)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.email@example.com',
        pass: 'ethereal.pass'
      }
    })
  }
}

export const sendEmail = async ({ to, subject, html, text }: EmailConfig): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@diligence-labs.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    }
    
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Email verification template
export const getEmailVerificationTemplate = (verificationUrl: string, userName: string = 'User') => {
  return {
    subject: 'Verify your email address - Diligence Labs',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Verification</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: white; margin-bottom: 10px; }
          .header-text { color: #94a3b8; font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
          .text { color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #059669, #047857); }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { color: #64748b; font-size: 14px; }
          .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Blockchain Consulting & Advisory</div>
          </div>
          
          <div class="content">
            <h1 class="title">Welcome to Diligence Labs, ${userName}!</h1>
            
            <p class="text">
              Thank you for registering with Diligence Labs. To complete your registration and access our 
              blockchain consulting services, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="divider"></div>
            
            <p class="text">
              <strong>What happens next?</strong><br>
              Once verified, you'll have access to:
            </p>
            
            <ul style="color: #475569; line-height: 1.6;">
              <li>Strategic Advisory consultations</li>
              <li>Due Diligence reports</li>
              <li>Token Launch consultation</li>
              <li>Blockchain Integration Advisory</li>
            </ul>
            
            <p class="text" style="font-size: 14px; color: #64748b; margin-top: 30px;">
              If you didn't create this account, please ignore this email. 
              This verification link will expire in 24 hours.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              © 2024 Diligence Labs. All rights reserved.<br>
              <a href="mailto:support@diligence-labs.com" style="color: #10b981;">support@diligence-labs.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Password reset email template
export const getPasswordResetTemplate = (resetUrl: string, userName: string = 'User') => {
  return {
    subject: 'Reset Your Password - Diligence Labs',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: 600; color: white; margin-bottom: 8px; }
          .header-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
          .text { color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
          .button:hover { transform: translateY(-1px); }
          .warning-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 25px 0; }
          .link-box { background: #1f1f1f; padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6; margin: 20px 0; word-break: break-all; color: #6b7280; font-size: 14px; }
          .footer { background: #111111; padding: 30px; text-align: center; border-top: 1px solid #2d2d2d; }
          .footer-text { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Password Reset Request</div>
          </div>
          
          <div class="content">
            <h1 class="title">Reset Your Password</h1>
            
            <p class="text">Hello ${userName},</p>
            
            <p class="text">
              We received a request to reset your password for your Diligence Labs account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div class="warning-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #fca5a5;">⚠️ Security Notice</p>
              <p style="margin: 0; color: #fca5a5; font-size: 14px;">
                This password reset was triggered after multiple failed login attempts. 
                If this wasn't you, please contact our support team immediately.
              </p>
            </div>
            
            <p class="text">To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p style="margin: 30px 0 20px 0; font-size: 14px; color: #9ca3af;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <div class="link-box">${resetUrl}</div>
            
            <p style="margin: 25px 0 0 0; font-size: 14px; color: #9ca3af;">
              This password reset link will expire in 1 hour for security reasons.
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

// Account status change notification template
export const getAccountStatusTemplate = (userName: string, newStatus: string, reason?: string) => {
  const statusColors = {
    SUSPENDED: '#ef4444',
    RESTRICTED: '#f59e0b', 
    DISABLED: '#dc2626',
    ACTIVE: '#10b981'
  }
  
  const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#6b7280'
  
  return {
    subject: `Account Status Update - Diligence Labs`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Account Status Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: 600; color: white; margin-bottom: 8px; }
          .header-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
          .text { color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
          .status-box { background: #1f1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 25px 0; }
          .reason-box { background: #1f1f1f; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .footer { background: #111111; padding: 30px; text-align: center; border-top: 1px solid #2d2d2d; }
          .footer-text { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Account Status Update</div>
          </div>
          
          <div class="content">
            <h1 class="title">Account Status Changed</h1>
            
            <p class="text">Hello ${userName},</p>
            
            <p class="text">
              Your account status has been updated by our administration team.
            </p>
            
            <div class="status-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">New Status:</p>
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: ${statusColor}; text-transform: capitalize;">
                ${newStatus.toLowerCase()}
              </p>
            </div>
            
            ${reason ? `
            <div class="reason-box">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">Reason:</p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                ${reason}
              </p>
            </div>
            ` : ''}
            
            <p style="margin: 25px 0 0 0; font-size: 14px; color: #9ca3af;">
              If you have any questions about this change, please contact our support team.
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

// Account creation invitation template
export const getAccountCreationInviteTemplate = (createAccountUrl: string, consultationType: string, isFree: boolean = false) => {
  const headerColors = isFree ? ['#10b981', '#059669'] : ['#3b82f6', '#1d4ed8']
  const headerText = isFree ? 'Your Free Consultation is Confirmed!' : 'Thank you for your consultation booking!'
  const consultationValue = isFree ? 'Value: $300 (FREE for first-time clients)' : ''
  
  return {
    subject: isFree ? 'Free Consultation Confirmed - Create Your Account | Diligence Labs' : 'Create Your Account - Diligence Labs',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Create Your Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, ${headerColors[0]}, ${headerColors[1]}); padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: white; margin-bottom: 10px; }
          .header-text { color: ${isFree ? '#a7f3d0' : '#bfdbfe'}; font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
          .text { color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${headerColors[0]}, ${headerColors[1]}); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .consultation-info { background: ${isFree ? '#d1fae5' : '#f1f5f9'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${headerColors[0]}; margin: 20px 0; }
          .free-notice { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Diligence Labs</div>
            <div class="header-text">Blockchain Consulting & Advisory</div>
          </div>
          
          <div class="content">
            <h1 class="title">${headerText}</h1>
            ${isFree ? '<p style="color: #059669; font-size: 18px; font-weight: 600; margin-bottom: 20px;">🎉 Congratulations on claiming your complimentary consultation!</p>' : ''}
            
            <div class="consultation-info">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e293b;">
                Consultation Type: ${consultationType.replace('_', ' ')}
              </p>
              ${isFree ? `<p style="margin: 0; font-size: 14px; color: ${isFree ? '#047857' : '#1e293b'};">${consultationValue}</p>` : ''}
            </div>
            
            ${isFree ? `
            <div class="free-notice">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">
                🚀 What's Next?
              </p>
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                Our team will contact you within 24 hours to schedule your complimentary consultation session. 
                We'll work with your schedule to find the perfect time!
              </p>
            </div>
            ` : ''}
            
            <p class="text">
              We've received your ${isFree ? 'free ' : ''}consultation request. To help you manage your consultation and access 
              additional features, we invite you to create a secure account with us.
            </p>
            
            <p class="text">
              <strong>Benefits of creating an account:</strong>
            </p>
            
            <ul style="color: #475569; line-height: 1.6;">
              <li>Track your consultation progress</li>
              <li>Access your personalized dashboard</li>
              <li>View and download reports</li>
              <li>Book additional consultations</li>
              <li>Receive updates and notifications</li>
              ${isFree ? '<li>Unlock exclusive member pricing for future services</li>' : ''}
            </ul>
            
            <div style="text-align: center;">
              <a href="${createAccountUrl}" class="button">Create My Account</a>
            </div>
            
            <p class="text" style="font-size: 14px; color: #64748b; margin-top: 30px;">
              This is optional - we'll process your consultation either way. 
              This invitation link will expire in 7 days.
            </p>
            ${isFree ? '<p style="font-size: 12px; color: #64748b; margin-top: 10px; text-align: center;">This free consultation offer is limited to one per client.</p>' : ''}
          </div>
          
          <div class="footer">
            <p class="footer-text">
              © 2024 Diligence Labs. All rights reserved.<br>
              <a href="mailto:support@diligence-labs.com" style="color: ${headerColors[0]};">support@diligence-labs.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}