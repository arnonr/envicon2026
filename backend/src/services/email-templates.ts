import { appUrl, escapeHtml } from "./email";

interface ReviewerInvitationData {
  reviewerName: string;
  setupLink: string;
}

export function buildReviewerInvitationEmail(data: ReviewerInvitationData): { subject: string; htmlBody: string } {
  const { reviewerName, setupLink } = data;

  const body = `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
      เรียน <strong>${escapeHtml(reviewerName)}</strong>
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
      คณะกรรมการจัดงานประชุมวิชาการนานาชาติด้านวิทยาศาสตร์และเทคโนโลยีสิ่งแวดล้อม
      <strong>ENVICON 2026</strong>
      มีความยินดีที่ได้เชิญท่านให้เกียรติเป็น <strong>ผู้ประเมินผลงานวิจัย</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;margin:24px 0">
      <tr><td style="padding:20px 24px">
        <div style="font-size:14px;font-weight:600;color:#065f46;margin-bottom:10px">สิ่งที่ท่านจะได้รับมอบหมาย</div>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
          <li>ตรวจประเมินบทความวิจัยที่ส่งเข้าร่วมประชุม</li>
          <li>ให้ข้อเสนอแนะและความเห็นเพื่อพัฒนาผลงาน</li>
          <li>ประเมินคุณภาพผลงานตามเกณฑ์ที่กำหนด</li>
        </ul>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 8px">
      ท่านสามารถเข้าสู่ระบบเพื่อดำเนินการได้โดยกดปุ่มด้านล่าง
    </p>
    <p style="font-size:13px;color:#6b7280;line-height:1.7;margin:0 0 20px">
      (ลิงก์มีอายุ 72 ชั่วโมง นับจากอีเมลฉบับนี้ส่ง)
    </p>

    <div style="text-align:center;margin:8px 0 28px">
      <a href="${setupLink}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600">
        ตั้งรหัสผ่านเพื่อเข้าสู่ระบบ
      </a>
    </div>

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0">
      หากท่านมีข้อสงสัยประการใด สามารถติดต่อคณะกรรมการได้ตามข้อมูลด้านล่าง
    </p>
  `;

  return {
    subject: "คำเชิญเป็นผู้ประเมินผลงานวิจัย — ENVICON 2026",
    htmlBody: emailLayout(body),
  };
}

interface ReviewAssignmentData {
  reviewerName: string;
  title: string;
  dueDate: string;
  reviewLink: string;
  setupLink?: string;
}

export function buildReviewAssignmentEmail(data: ReviewAssignmentData): { subject: string; htmlBody: string } {
  const { reviewerName, title, dueDate, reviewLink, setupLink } = data;

  const setupHtml = setupLink ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border:1px solid #fcd34d;border-radius:6px;margin:24px 0">
      <tr><td style="padding:16px 20px">
        <div style="font-size:14px;font-weight:600;color:#92400e;margin-bottom:6px">ก่อนเริ่มประเมิน</div>
        <div style="font-size:14px;color:#78350f;line-height:1.7">
          ท่านยังไม่ได้ตั้งรหัสผ่าน กรุณา
          <a href="${setupLink}" style="color:#059669;font-weight:600;text-decoration:underline">ตั้งรหัสผ่าน</a>
          ก่อนเข้าสู่ระบบ
        </div>
      </td></tr>
    </table>
  ` : "";

  const body = `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
      เรียน <strong>${escapeHtml(reviewerName)}</strong>
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
      ท่านได้รับมอบหมายให้เป็น <strong>ผู้ประเมินผลงานวิจัย</strong> สำหรับการประชุมวิชาการ ENVICON 2026
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:24px 0">
      <tr><td style="padding:16px 20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;width:120px;vertical-align:top">ชื่อผลงาน</td>
            <td style="font-size:14px;color:#111827;font-weight:500;padding:4px 0;line-height:1.6">${escapeHtml(title)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:8px 0 4px;vertical-align:top">กำหนดส่งผล</td>
            <td style="font-size:14px;color:#dc2626;font-weight:600;padding:8px 0 4px">${escapeHtml(dueDate)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${setupHtml}

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      กรุณาดำเนินการประเมินผลงานภายในกำหนดเวลาที่ระบุ โดยกดปุ่มด้านล่างเพื่อเข้าสู่แบบประเมิน
    </p>

    <div style="text-align:center;margin:8px 0 28px">
      <a href="${reviewLink}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600">
        เปิดแบบประเมินผลงาน
      </a>
    </div>

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0">
      หากท่านมีข้อสงสัยหรือไม่สามารถดำเนินการได้ กรุณาแจ้งให้คณะกรรมการทราบตามข้อมูลติดต่อด้านล่าง
    </p>
  `;

  return {
    subject: `มอบหมายประเมินผลงาน: ${title}`,
    htmlBody: emailLayout(body),
  };
}

interface AuthorResultData {
  authorName: string;
  title: string;
  submissionId: string;
  decision: "accept" | "reject" | "revise";
  adminNote?: string | null;
  reviewerComments: { reviewerIndex: number; comment: string }[];
}

function emailLayout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Sarabun',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">

  <!-- Header -->
  <tr>
    <td style="background-color:#059669;padding:28px 32px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px">ENVICON 2026</div>
      <div style="font-size:13px;color:#d1fae5;margin-top:4px">International Conference on Environmental Science and Technology</div>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:32px">
      ${body}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center">
      <div style="font-size:14px;color:#6b7280;margin-bottom:4px">ขอแสดงความนับถือ</div>
      <div style="font-size:14px;font-weight:600;color:#374151">คณะกรรมการจัดงาน ENVICON 2026</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:6px">
        อีเมล: <a href="mailto:fiit@technopark.kmutnb.ac.th" style="color:#059669;text-decoration:none">fiit@technopark.kmutnb.ac.th</a>
      </div>
    </td>
  </tr>

</table>

<div style="font-size:11px;color:#9ca3af;margin-top:16px;text-align:center">
  อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ
</div>
</td></tr>
</table>
</body>
</html>`;
}

export function buildAuthorResultEmail(data: AuthorResultData): { subject: string; htmlBody: string } {
  const { authorName, title, submissionId, decision, adminNote, reviewerComments } = data;

  const decisionText =
    decision === "accept" ? "ผ่านการพิจารณา" :
    decision === "reject" ? "ไม่ผ่านการพิจารณา" :
    "ขอให้แก้ไขผลงาน";

  const mainContent = mainContentByDecision(data);

  const commentsHtml = reviewerComments.length > 0 ? `
    <div style="background-color:#f0fdf4;border-left:4px solid #059669;padding:16px;margin:24px 0;border-radius:4px">
      <div style="font-size:15px;font-weight:600;color:#065f46;margin-bottom:12px">ข้อเสนอแนะจากผู้พิจารณา</div>
      ${reviewerComments.map((rc, i) => `
        <div style="margin-bottom:${i < reviewerComments.length - 1 ? '16px' : '0'}">
          <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:4px">ผู้พิจารณาท่านที่ ${rc.reviewerIndex}</div>
          <div style="font-size:14px;color:#4b5563;line-height:1.6;white-space:pre-wrap">${escapeHtml(rc.comment)}</div>
        </div>
      `).join("")}
    </div>
  ` : "";

  const adminNoteHtml = adminNote ? `
    <div style="margin-top:20px;padding:12px 16px;background-color:#fffbeb;border-radius:4px;border:1px solid #fbbf24">
      <div style="font-size:13px;font-weight:600;color:#92400e;margin-bottom:4px">หมายเหตุจากคณะกรรมการ</div>
      <div style="font-size:14px;color:#78350f;line-height:1.6">${escapeHtml(adminNote)}</div>
    </div>
  ` : "";

  const subject = `ผลการพิจารณาผลงาน: ${title} — ${decisionText}`;

  const body = `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
      เรียน <strong>${escapeHtml(authorName)}</strong>
    </p>

    ${mainContent}

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:24px 0">
      <tr><td style="padding:16px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;width:120px">ชื่อผลงาน</td>
            <td style="font-size:14px;color:#111827;font-weight:500;padding:4px 0">${escapeHtml(title)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0">เลขที่ผลงาน</td>
            <td style="font-size:14px;color:#111827;padding:4px 0"><code style="background:#e5e7eb;padding:2px 6px;border-radius:3px;font-size:12px">${escapeHtml(submissionId)}</code></td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0">ผลการพิจารณา</td>
            <td style="font-size:14px;padding:4px 0"><span style="color:${decision === 'accept' ? '#059669' : decision === 'reject' ? '#dc2626' : '#d97706'};font-weight:600">${escapeHtml(decisionText)}</span></td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${commentsHtml}
    ${adminNoteHtml}

    <div style="text-align:center;margin:28px 0 8px">
      <a href="${appUrl(`/submissions/${submissionId}`)}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600">
        ดูรายละเอียดและข้อเสนอแนะทั้งหมด
      </a>
    </div>
  `;

  return { subject, htmlBody: emailLayout(body) };
}

function mainContentByDecision(data: AuthorResultData): string {
  const { decision } = data;

  if (decision === "accept") {
    return `
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 8px">
        ขอแสดงความยินดี ผลงานของท่านได้รับการตอบรับให้เข้าร่วมนำเสนอในการประชุมวิชาการ <strong>ENVICON 2026</strong>
      </p>
      <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0">
        กรุณาตรวจสอบข้อเสนอแนะจากผู้พิจารณา และดำเนินการตามขั้นตอนที่ระบุไว้ในระบบเพื่อยืนยันการเข้าร่วมนำเสนอผลงาน
      </p>
    `;
  }

  if (decision === "reject") {
    return `
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 8px">
        คณะกรรมการขอขอบคุณสำหรับการส่งผลงานเข้าร่วมการประชุมวิชาการ <strong>ENVICON 2026</strong>
      </p>
      <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0">
        หลังจากการพิจารณาอย่างละเอียดแล้ว คณะกรรมการขอเรียนให้ทราบว่าผลงานของท่าน<strong>ไม่ผ่านการพิจารณา</strong>ในครั้งนี้
        ทั้งนี้ ท่านสามารถศึกษาข้อเสนอแนะจากผู้พิจารณาเพื่อนำไปพัฒนาและปรับปรุงผลงานของท่านต่อไป
      </p>
    `;
  }

  return `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 8px">
      ผลงานของท่านมีศักยภาพที่จะได้รับการตอบรับให้เข้าร่วมนำเสนอในการประชุมวิชาการ <strong>ENVICON 2026</strong>
      อย่างไรก็ตาม คณะกรรมการขอให้ท่าน<strong>ปรับปรุงแก้ไขผลงาน</strong>ตามข้อเสนอแนะจากผู้พิจารณา
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:8px 0 0">
      กรุณาดำเนินการแก้ไขและส่งผลงานที่ปรับปรุงแล้วผ่านระบบภายในระยะเวลาที่กำหนด
      หากมีข้อสงสัยประการใด สามารถติดต่อคณะกรรมการได้ตามข้อมูลด้านล่าง
    </p>
  `;
}
