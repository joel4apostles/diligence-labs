// Email templates for expert application notifications

export interface ExpertApprovalEmailData {
  expertName: string
  expertEmail: string
  companyName?: string
  position?: string
  approvalDate: string
  dashboardUrl: string
  supportEmail: string
}

export interface ExpertRejectionEmailData {
  expertName: string
  expertEmail: string
  rejectionReason?: string
  rejectionDate: string
  supportEmail: string
}

export const expertApprovalEmailTemplate = (data: ExpertApprovalEmailData): { subject: string; html: string; text: string } => {
  const subject = 'Welcome to Diligence Labs - Expert Application Approved! 🎉'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expert Application Approved</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .highlight { background: #f0f8ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .badge { background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your Expert Application Has Been Approved</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.expertName},</p>
          
          <div class="highlight">
            <p><strong>Great news!</strong> Your application to become a verified expert at Diligence Labs has been <span class="badge">APPROVED</span></p>
          </div>
          
          <p>We're excited to welcome you to our expert network. Your expertise in blockchain technology and your professional background make you a valuable addition to our team.</p>
          
          <h3>🏆 Your Expert Profile</h3>
          <ul>
            <li><strong>Name:</strong> ${data.expertName}</li>
            <li><strong>Email:</strong> ${data.expertEmail}</li>
            ${data.companyName ? `<li><strong>Company:</strong> ${data.companyName}</li>` : ''}
            ${data.position ? `<li><strong>Position:</strong> ${data.position}</li>` : ''}
            <li><strong>Approval Date:</strong> ${data.approvalDate}</li>
            <li><strong>Expert Tier:</strong> Bronze (Starting Level)</li>
          </ul>
          
          <h3>🚀 What's Next?</h3>
          <p>As a verified expert, you can now:</p>
          <ul>
            <li>✅ Evaluate blockchain projects and receive rewards</li>
            <li>✅ Access exclusive expert-only features</li>
            <li>✅ Build your reputation and advance to higher tiers</li>
            <li>✅ Participate in our fee-sharing reward system</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${data.dashboardUrl}" class="btn">Access Expert Dashboard</a>
          </div>
          
          <p>If you have any questions or need assistance getting started, please don't hesitate to reach out to our support team.</p>
          
          <p>Welcome aboard!</p>
          <p><strong>The Diligence Labs Team</strong></p>
        </div>
        
        <div class="footer">
          <p>Need help? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
          <p>© 2024 Diligence Labs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Congratulations! Your Expert Application Has Been Approved
    
    Dear ${data.expertName},
    
    Great news! Your application to become a verified expert at Diligence Labs has been APPROVED.
    
    We're excited to welcome you to our expert network. Your expertise in blockchain technology and your professional background make you a valuable addition to our team.
    
    Your Expert Profile:
    - Name: ${data.expertName}
    - Email: ${data.expertEmail}
    ${data.companyName ? `- Company: ${data.companyName}` : ''}
    ${data.position ? `- Position: ${data.position}` : ''}
    - Approval Date: ${data.approvalDate}
    - Expert Tier: Bronze (Starting Level)
    
    What's Next?
    As a verified expert, you can now:
    ✅ Evaluate blockchain projects and receive rewards
    ✅ Access exclusive expert-only features  
    ✅ Build your reputation and advance to higher tiers
    ✅ Participate in our fee-sharing reward system
    
    Access your expert dashboard: ${data.dashboardUrl}
    
    If you have any questions or need assistance getting started, please contact us at ${data.supportEmail}.
    
    Welcome aboard!
    The Diligence Labs Team
  `
  
  return { subject, html, text }
}

export const expertRejectionEmailTemplate = (data: ExpertRejectionEmailData): { subject: string; html: string; text: string } => {
  const subject = 'Update on Your Diligence Labs Expert Application'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expert Application Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
          <p>Regarding Your Expert Application</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.expertName},</p>
          
          <p>Thank you for your interest in becoming a verified expert at Diligence Labs. We appreciate the time you took to submit your application.</p>
          
          <div class="highlight">
            <p>After careful review, we have decided not to approve your expert application at this time.</p>
          </div>
          
          ${data.rejectionReason ? `
            <h3>Feedback</h3>
            <p>${data.rejectionReason}</p>
          ` : ''}
          
          <h3>What's Next?</h3>
          <p>While we cannot approve your application at this time, we encourage you to:</p>
          <ul>
            <li>Continue building your expertise in blockchain technology</li>
            <li>Gain more experience in your field</li>
            <li>Consider reapplying in the future</li>
          </ul>
          
          <p>We value your interest in Diligence Labs and hope you'll continue to engage with our platform as a user.</p>
          
          <p>If you have any questions about this decision, please feel free to reach out to our support team.</p>
          
          <p>Best regards,</p>
          <p><strong>The Diligence Labs Team</strong></p>
        </div>
        
        <div class="footer">
          <p>Need help? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
          <p>© 2024 Diligence Labs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Application Update - Diligence Labs Expert Application
    
    Dear ${data.expertName},
    
    Thank you for your interest in becoming a verified expert at Diligence Labs. We appreciate the time you took to submit your application.
    
    After careful review, we have decided not to approve your expert application at this time.
    
    ${data.rejectionReason ? `Feedback: ${data.rejectionReason}` : ''}
    
    What's Next?
    While we cannot approve your application at this time, we encourage you to:
    - Continue building your expertise in blockchain technology
    - Gain more experience in your field  
    - Consider reapplying in the future
    
    We value your interest in Diligence Labs and hope you'll continue to engage with our platform as a user.
    
    If you have any questions about this decision, please contact us at ${data.supportEmail}.
    
    Best regards,
    The Diligence Labs Team
  `
  
  return { subject, html, text }
}