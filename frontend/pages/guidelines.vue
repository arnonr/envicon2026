<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">แนวทางการเขียนบทความ</h1>
      <p class="text-gray-500 text-lg">Paper Submission Guidelines</p>
    </div>

    <!-- Abstract Guidelines -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold text-lg">การเตรียมบทคัดย่อ (Abstract)</h2>
      </template>
      <ul class="space-y-2 text-sm text-gray-600">
        <li>- ความยาวไม่เกิน 300 คำ</li>
        <li>- ระบุหัวข้อ (Track) ที่ต้องการนำเสนอ</li>
        <li>- ระบุคำสำคัญ (Keywords) 3-5 คำ</li>
        <li>- เขียนเป็นภาษาไทยหรือภาษาอังกฤษ</li>
        <li>- ไฟล์ PDF ขนาดไม่เกิน 5 MB</li>
      </ul>
    </UCard>

    <!-- Full Paper Guidelines -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold text-lg">การเตรียมบทความฉบับสมบูรณ์ (Full Paper)</h2>
      </template>
      <ul class="space-y-2 text-sm text-gray-600">
        <li>- ความยาว 6-10 หน้า (รวมรายการอ้างอิง)</li>
        <li>- ขนาดกระดาษ A4</li>
        <li>- Font: TH Sarabun New ขนาด 14 pt</li>
        <li>- ระยะขอบ: บน 2.54 cm, ล่าง 2.54 cm, ซ้าย 3.17 cm, ขวา 2.54 cm</li>
        <li>- รูปแบบการอ้างอิง: APA 7th Edition</li>
        <li>- ไฟล์ PDF ขนาดไม่เกิน 20 MB</li>
      </ul>
    </UCard>

    <!-- Paper Structure -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold text-lg">โครงสร้างบทความ</h2>
      </template>
      <ol class="space-y-2 text-sm text-gray-600 list-decimal pl-5">
        <li>ชื่อเรื่อง (Title) — ภาษาไทยและภาษาอังกฤษ</li>
        <li>ชื่อผู้เขียน (Authors) และสังกัด</li>
        <li>บทคัดย่อ (Abstract) — ภาษาไทยและภาษาอังกฤษ</li>
        <li>บทนำ (Introduction)</li>
        <li>วิธีการวิจัย (Methodology)</li>
        <li>ผลการวิจัยและอภิปราย (Results and Discussion)</li>
        <li>สรุปผลการวิจัย (Conclusion)</li>
        <li>กิตติกรรมประกาศ (Acknowledgments) — ถ้ามี</li>
        <li>เอกสารอ้างอิง (References)</li>
      </ol>
    </UCard>

    <!-- Download Template -->
    <div class="text-center">
      <p class="text-gray-500 mb-4">ดาวน์โหลด Template บทความ</p>
      <UButton color="primary" size="lg" icon="i-heroicons-arrow-down-tray" disabled>
        ดาวน์โหลด Template (เร็วๆ นี้)
      </UButton>
    </div>
  </div>
</template>
