const nodemailer = require('nodemailer');
const config = require('../config/config');

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and message'
      });
    }

    // In production, replace with actual email sending logic
    // For now, we'll just log and return success
    console.log('Contact form submission:', { name, email, subject, message });

    // Example nodemailer implementation (commented out)
    /*
    const transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: true,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: config.EMAIL_TO,
      subject: `Contact Form: ${subject || 'New Message'}`,
      text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <h4>Message:</h4>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    */

    res.status(200).json({
      success: true,
      message: 'Contact message sent successfully'
    });
  } catch (error) {
    next(error);
  }
}; 