require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;



app.use(express.json({ limit: '1mb' }));

app.use(cors());

app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));




const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });
};

// =========================================
// API ROUTES & SECURITY
// =========================================

// Simple In-Memory Rate Limiter to prevent email spam/abuse
const rateLimitMap = new Map();
const checkRateLimit = (ip) => {
    const now = Date.now();
    const windowMs = 1 * 60 * 1000; // 1 minute
    const maxReq = 20; // Max 20 emails per IP within window

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    const data = rateLimitMap.get(ip);
    if (now > data.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    data.count++;
    return data.count <= maxReq;
};


app.set('trust proxy', 1);


app.post('/api/contact', async (req, res) => {
    try {
        // ---- Security: Rate Limiting ----
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests from this IP. Please wait 1 minute before trying again.'
            });
        }

        const { name, email, phone, company, subject, message } = req.body;

        // ---- Input Validation ----
        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push('Name is required (minimum 2 characters).');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('A valid email address is required.');
        }

        if (!message || message.trim().length < 10) {
            errors.push('Message is required (minimum 10 characters).');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors
            });
        }

        // ---- Check Gmail Configuration ----
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS ||
            process.env.GMAIL_USER === 'your-email@gmail.com') {
            console.warn('⚠️  Gmail not configured. Logging form data to console instead.');
            console.log('📧 Contact Form Submission:');
            console.log('   Name:', name);
            console.log('   Email:', email);
            console.log('   Phone:', phone || 'N/A');
            console.log('   Company:', company || 'N/A');
            console.log('   Subject:', subject || 'N/A');
            console.log('   Message:', message);
            console.log('---');

            return res.json({
                success: true,
                message: 'Form received! (Demo mode - configure Gmail in .env for email delivery)'
            });
        }

        // ---- Build Email ----
        const recipientEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER;

        // Security: Escape HTML to prevent XSS / HTML Injection in emails
        const escapeHTML = (str) => {
            if (typeof str !== 'string') return '';
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
        };

        const safeName = escapeHTML(name);
        const safeEmail = escapeHTML(email);
        const safePhone = escapeHTML(phone);
        const safeCompany = escapeHTML(company);
        const safeSubject = escapeHTML(subject);
        const safeMessage = escapeHTML(message);

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; border-radius: 12px; overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0f2744, #1e3a5f); padding: 28px 32px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">
                        <span style="color: #ffffff;">Office</span><span style="color: #4ade80;">Max</span>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.6); margin-left: 8px;">Contact Form</span>
                    </h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 32px;">
                    <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 18px;">New Contact Inquiry</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 120px; vertical-align: top;">Name</td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${safeName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Email</td>
                            <td style="padding: 10px 0; color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0;">
                                <a href="mailto:${safeEmail}" style="color: #16a34a;">${safeEmail}</a>
                            </td>
                        </tr>
                        ${phone ? `
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Phone</td>
                            <td style="padding: 10px 0; color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0;">${safePhone}</td>
                        </tr>` : ''}
                        ${company ? `
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Company</td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">${safeCompany}</td>
                        </tr>` : ''}
                        ${subject ? `
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Subject</td>
                            <td style="padding: 10px 0; color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0;">
                                <span style="background: #dcfce7; color: #16a34a; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${safeSubject}</span>
                            </td>
                        </tr>` : ''}
                    </table>
                    
                    <!-- Message -->
                    <div style="margin-top: 24px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                        <p style="color: #0f172a; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f1f5f9; padding: 16px 32px; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        This email was sent from the OfficeMax India website contact form.
                    </p>
                </div>
            </div>
        `;

        // ---- Send Email ----
        const transporter = createTransporter();

        const mailOptions = {
            from: `"OfficeMax Website" <${process.env.GMAIL_USER}>`,
            to: recipientEmail,
            replyTo: email,
            subject: `📩 New Inquiry: ${subject || 'General'} — from ${name}`,
            html: htmlContent,
            text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCompany: ${company || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`
        };

        await transporter.sendMail(mailOptions);

        console.log(` Email sent to ${recipientEmail} from ${name} (${email})`);

        res.json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        console.error(' Error sending email:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});



app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_PASS &&
            process.env.GMAIL_USER !== 'your-email@gmail.com')
    });
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║                                          ║');
    console.log('  ║   🏢 OfficeMax India — Portfolio Server  ║');
    console.log(`  ║   🌐 http://localhost:${PORT}               ║`);
    console.log('  ║                                          ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');

    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
        console.log('  Gmail not configured. Contact form runs in demo mode.');
        console.log('   Copy .env.example to .env and add your Gmail App Password.');
        console.log('');
    } else {
        console.log(`   Gmail configured: ${process.env.GMAIL_USER}`);
        console.log(`  Emails will be sent to: ${process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER}`);
        console.log('');
    }
});
