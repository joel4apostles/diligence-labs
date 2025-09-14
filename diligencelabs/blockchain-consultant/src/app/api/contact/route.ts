import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, message, subject } = await request.json()

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Send notification email to admin
    const adminEmail = process.env.FROM_EMAIL || 'noreply@diligence-labs.com'
    
    const emailSent = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 20px;">Contact Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Name:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Email:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${email}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Subject:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${subject || 'General Inquiry'}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Message:</strong>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 8px; border-left: 4px solid #3b82f6;">
                  <p style="color: #4b5563; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #1f2937;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              This message was sent via the Diligence Labs contact form
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject || 'General Inquiry'}

Message:
${message}

---
This message was sent via the Diligence Labs contact form.
      `
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Message sent successfully! We'll get back to you soon." },
      { status: 200 }
    )

  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "An error occurred while sending your message" },
      { status: 500 }
    )
  }
}