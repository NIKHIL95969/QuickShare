import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error }
  }
}

export const sendVerificationEmail = async (email: string, username: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to QuikShare!</h2>
      <p>Hi ${username},</p>
      <p>Thank you for registering with QuikShare. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with QuikShare, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent from QuikShare. If you have any questions, please contact our support team.
      </p>
    </div>
  `

  const text = `
    Welcome to QuikShare!
    
    Hi ${username},
    
    Thank you for registering with QuikShare. Please verify your email address by visiting this link:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with QuikShare, please ignore this email.
  `

  return await sendEmail({
    to: email,
    subject: 'Verify your QuikShare account',
    html,
    text
  })
}

export const sendGroupInviteEmail = async (email: string, groupName: string, inviterName: string, inviteToken: string) => {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/groups/invite/accept?token=${inviteToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">You're invited to join a group!</h2>
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join the group "<strong>${groupName}</strong>" on QuikShare.</p>
      <p>Click the button below to accept the invitation:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" 
           style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Join Group
        </a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you don't want to join this group, you can simply ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent from QuikShare. If you have any questions, please contact our support team.
      </p>
    </div>
  `

  const text = `
    You're invited to join a group!
    
    ${inviterName} has invited you to join the group "${groupName}" on QuikShare.
    
    Click this link to accept the invitation:
    ${inviteUrl}
    
    This invitation will expire in 7 days.
    
    If you don't want to join this group, you can simply ignore this email.
  `

  return await sendEmail({
    to: email,
    subject: `Invitation to join "${groupName}" group`,
    html,
    text
  })
}

export const sendPasswordResetEmail = async (email: string, username: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password for your QuikShare account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent from QuikShare. If you have any questions, please contact our support team.
      </p>
    </div>
  `

  const text = `
    Password Reset Request
    
    Hi ${username},
    
    We received a request to reset your password for your QuikShare account.
    
    Click this link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
  `

  return await sendEmail({
    to: email,
    subject: 'Reset your QuikShare password',
    html,
    text
  })
}
