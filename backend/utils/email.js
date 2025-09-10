const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOtpEmail = async (email, otp) => {
  // Check if we should force console mode (for development or when email is unavailable)
  const forceConsoleMode = process.env.EMAIL_CONSOLE_MODE === 'true' || 
    process.env.NODE_ENV === 'development' || 
    (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'dev@kindnest.com');
  
  if (forceConsoleMode) {
    // For development/demo - log OTP to console instead of sending email
    console.log(`📧 Console Mode: OTP for ${email}: ${otp}`);
    console.log(`🔐 Enter this code in the app: ${otp}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true; // Always return success for demo
  }

  // Production mode - actually send email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your KindNest Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin-bottom: 10px;">🪺 KindNest</h1>
          <h2 style="color: #374151; margin-bottom: 20px;">Your Verification Code</h2>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <p style="color: #6b7280; margin-bottom: 10px;">Enter this code in your KindNest app:</p>
          <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
          <p style="color: #9ca3af; font-size: 14px;">This code expires in 10 minutes</p>
        </div>
        
        <div style="text-align: center; color: #6b7280;">
          <p>Welcome to KindNest - where support flows naturally ✨</p>
          <p style="font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    console.log(`📧 Sending OTP email to ${email}...`);
    
    // Add timeout to prevent hanging
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 10000) // 10 second timeout
    );
    
    await Promise.race([emailPromise, timeoutPromise]);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message || error);
    // Fall back to console logging if email fails
    console.log(`📧 Email failed - Showing OTP for ${email}: ${otp}`);
    console.log(`🔐 Enter this code in the app: ${otp}`);
    return true; // Still return true so authentication can proceed
  }
};

module.exports = { sendOtpEmail };