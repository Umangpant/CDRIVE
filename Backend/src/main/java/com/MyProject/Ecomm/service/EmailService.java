package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.dto.EmailEvent;
import com.MyProject.Ecomm.messaging.MessagingConstants;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.Map;

@Service
public class EmailService {

    private static final DecimalFormat PRICE_FORMAT = new DecimalFormat("#0.00");
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(EmailEvent event) {
        validateEvent(event);
        if (!mailEnabled) {
            log.info("Mail delivery is disabled. Skipping event type={} for {}", event.getType(), event.getTo());
            return;
        }
        validateMailConfiguration();
        String html = buildHtml(event);
        sendHtmlEmail(event.getTo(), event.getSubject(), html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to {} with subject {}", to, subject);
        } catch (MailAuthenticationException ex) {
            log.error(
                    "Brevo SMTP authentication failed for configured login {}. Brevo requires the SMTP login email as BREVO_SMTP_USERNAME and an SMTP key as BREVO_SMTP_PASSWORD.",
                    maskEmail(mailUsername),
                    ex
            );
            throw new IllegalStateException(
                    "Brevo SMTP authentication failed. Use the Brevo SMTP login email as BREVO_SMTP_USERNAME and a generated SMTP key as BREVO_SMTP_PASSWORD.",
                    ex
            );
        } catch (MailException ex) {
            throw new IllegalStateException("Brevo SMTP accepted the connection but email delivery failed", ex);
        } catch (MessagingException ex) {
            throw new IllegalStateException("Failed to prepare email message", ex);
        }
    }

    private String buildHtml(EmailEvent event) {
        return switch (event.getType()) {
            case MessagingConstants.USER_REGISTERED_EVENT ->
                    buildWelcomeEmail(event.getData(), "Welcome to CDrive", "Customer");
            case MessagingConstants.ADMIN_REGISTERED_EVENT ->
                    buildWelcomeEmail(event.getData(), "Welcome to CDrive Admin", "Administrator");
            case MessagingConstants.RESERVATION_APPROVED_EVENT ->
                    buildReservationApprovedEmail(event.getData());
            case MessagingConstants.PASSWORD_RESET_EVENT ->
                    buildPasswordResetEmail(event.getData());
            default -> throw new IllegalArgumentException("Unsupported email event type: " + event.getType());
        };
    }

    private String buildWelcomeEmail(Map<String, Object> data, String title, String audience) {
        String name = escape(data.get("name"));
        String email = escape(data.get("email"));
        String role = escape(data.get("role"));

        String body = """
                <p style="margin:0 0 16px;">Hi %s,</p>
                <p style="margin:0 0 16px;">Your %s account is now active. We are excited to have you with us.</p>
                <div style="background:#f7f9fc;border-radius:12px;padding:16px;margin:24px 0;">
                  <p style="margin:0 0 8px;"><strong>Email:</strong> %s</p>
                  <p style="margin:0;"><strong>Role:</strong> %s</p>
                </div>
                <p style="margin:0;">You can now sign in and start using CDrive.</p>
                """.formatted(name, audience, email, role);

        return wrapTemplate(title, body);
    }

    private String buildReservationApprovedEmail(Map<String, Object> data) {
        String name = escape(data.get("name"));
        String reservationId = escape(data.get("reservationId"));
        String carName = escape(data.get("carName"));
        String pickupLocation = escape(data.get("pickupLocation"));
        String preferredDate = escape(data.get("preferredDate"));
        String preferredTime = escape(data.get("preferredTime"));
        String bookingDate = escape(data.get("bookingDate"));
        String numberOfDays = escape(data.get("numberOfDays"));
        String totalPrice = formatPrice(data.get("totalPrice"));

        String body = """
                <p style="margin:0 0 16px;">Hi %s,</p>
                <p style="margin:0 0 16px;">Your reservation request has been approved. Here are your confirmed details.</p>
                <div style="background:#f7f9fc;border-radius:12px;padding:16px;margin:24px 0;">
                  <p style="margin:0 0 8px;"><strong>Reservation ID:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Vehicle:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Pickup location:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Booking date:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Preferred date:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Preferred time:</strong> %s</p>
                  <p style="margin:0 0 8px;"><strong>Number of days:</strong> %s</p>
                  <p style="margin:0;"><strong>Total price:</strong> %s</p>
                </div>
                <p style="margin:0;">Thank you for choosing CDrive. We look forward to serving you.</p>
                """.formatted(name, reservationId, carName, pickupLocation, bookingDate,
                preferredDate, preferredTime, numberOfDays, totalPrice);

        return wrapTemplate("Reservation Approved", body);
    }

    private String buildPasswordResetEmail(Map<String, Object> data) {
        String name = escape(data.get("name"));
        String resetLink = escape(data.get("resetLink"));
        String expiresInMinutes = escape(data.get("expiresInMinutes"));

        String body = """
                <p style="margin:0 0 16px;">Hi %s,</p>
                <p style="margin:0 0 16px;">We received a request to reset your CDrive password.</p>
                <p style="margin:0 0 24px;">If you made this request, use the button below to choose a new password. This link expires in %s minutes.</p>
                <p style="margin:0 0 24px;">
                  <a href="%s" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">Reset Password</a>
                </p>
                <p style="margin:0 0 16px;">If the button does not work, copy and paste this link into your browser:</p>
                <p style="margin:0 0 16px;word-break:break-all;"><a href="%s">%s</a></p>
                <p style="margin:0;">If you did not request this change, you can safely ignore this email.</p>
                """.formatted(name, expiresInMinutes, resetLink, resetLink, resetLink);

        return wrapTemplate("Reset Your Password", body);
    }

    private String wrapTemplate(String title, String body) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <body style="margin:0;padding:24px;background:#eef3f8;font-family:Arial,sans-serif;color:#1f2937;">
                  <table role="presentation" style="width:100%%;border-collapse:collapse;">
                    <tr>
                      <td align="center">
                        <table role="presentation" style="width:100%%;max-width:640px;border-collapse:collapse;background:#ffffff;border-radius:18px;overflow:hidden;">
                          <tr>
                            <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
                              <h1 style="margin:0;font-size:28px;font-weight:700;">%s</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:32px;line-height:1.6;font-size:15px;">
                              %s
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(title, body);
    }

    private void validateEvent(EmailEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Email event must not be null");
        }
        if (!StringUtils.hasText(event.getTo())) {
            throw new IllegalArgumentException("Email recipient is required");
        }
        if (!StringUtils.hasText(event.getSubject())) {
            throw new IllegalArgumentException("Email subject is required");
        }
        if (!StringUtils.hasText(event.getType())) {
            throw new IllegalArgumentException("Email type is required");
        }
    }

    private void validateMailConfiguration() {
        if (!StringUtils.hasText(fromAddress) || !StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
            throw new IllegalStateException(
                    "Mail delivery is enabled but Brevo SMTP is not fully configured. Set APP_MAIL_ENABLED=true, BREVO_SMTP_USERNAME, BREVO_SMTP_PASSWORD, and APP_MAIL_FROM.");
        }
        if (fromAddress.equalsIgnoreCase(mailUsername)) {
            log.warn("APP_MAIL_FROM currently matches BREVO_SMTP_USERNAME. Brevo recommends using a verified sender address in the From field instead of the SMTP login.");
        }
    }

    private String escape(Object value) {
        if (value == null) {
            return "N/A";
        }
        if (value instanceof LocalDate localDate) {
            return HtmlUtils.htmlEscape(localDate.toString());
        }
        return HtmlUtils.htmlEscape(String.valueOf(value));
    }

    private String formatPrice(Object value) {
        if (value == null) {
            return "N/A";
        }
        if (value instanceof Number number) {
            return "INR " + PRICE_FORMAT.format(number.doubleValue());
        }
        try {
            return "INR " + PRICE_FORMAT.format(Double.parseDouble(String.valueOf(value)));
        } catch (NumberFormatException ex) {
            return escape(value);
        }
    }

    private String maskEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return "<missing>";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
