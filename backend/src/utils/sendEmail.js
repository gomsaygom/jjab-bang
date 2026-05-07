const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"짭방" <${process.env.FROM_EMAIL}>`,
    to,
    subject: '[짭방] 이메일 인증 코드',
    html: `
      <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:32px;">
        <h2 style="color:#4F8EF7;">짭방 이메일 인증</h2>
        <p>아래 6자리 코드를 입력해주세요. 코드는 10분간 유효합니다.</p>
        <div style="margin:24px 0; padding:20px; background:#f0f4ff; border-radius:12px; text-align:center;">
          <span style="font-size:36px; font-weight:bold; letter-spacing:8px; color:#4F8EF7;">${code}</span>
        </div>
        <p style="color:#999; font-size:12px;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"짭방" <${process.env.FROM_EMAIL}>`,
    to,
    subject: '[짭방] 비밀번호 재설정 코드',
    html: `
      <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:32px;">
        <h2 style="color:#4F8EF7;">비밀번호 재설정</h2>
        <p>아래 6자리 코드를 입력해주세요. 코드는 1시간 유효합니다.</p>
        <div style="margin:24px 0; padding:20px; background:#f0f4ff; border-radius:12px; text-align:center;">
          <span style="font-size:36px; font-weight:bold; letter-spacing:8px; color:#4F8EF7;">${code}</span>
        </div>
        <p style="color:#999; font-size:12px;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };