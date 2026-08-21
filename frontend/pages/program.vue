<template>
  <div class="max-w-5xl mx-auto px-4 py-12 sm:py-16">
    <div class="text-center mb-10">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">กำหนดการจัดงานประชุมวิชาการระดับชาติ</h1>
      <p class="text-gray-600 text-lg">สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย (สอสท) ครั้งที่ 5</p>
      <p class="text-gray-600 mt-2">เรื่อง “เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ”</p>
      <p class="text-gray-500 mt-3">วันที่ 12–13 พฤศจิกายน 2569 เวลา 8:30–16:00 น.</p>
      <p class="text-gray-500">ณ อาคาร 99 อุทยานเทคโนโลยี มหาวิทยาลัยพระจอมเกล้าพระนครเหนือ</p>
    </div>

    <div class="space-y-8">
      <UCard v-for="day in schedule" :key="day.date" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <div class="px-5 py-4 bg-primary-50 border-b border-primary-100">
          <h2 class="text-xl font-bold text-primary-800">{{ day.date }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" class="w-44 px-5 py-3 font-semibold whitespace-nowrap">เวลา</th>
                <th scope="col" class="px-5 py-3 font-semibold">รายละเอียด</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in day.items" :key="`${day.date}-${item.time}`" class="align-top">
                <td class="px-5 py-3 text-gray-700 whitespace-nowrap">{{ item.time }} น.</td>
                <td class="px-5 py-3 text-gray-800">{{ item.detail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <p class="mt-6 text-sm text-gray-500"><span class="font-semibold underline">หมายเหตุ</span> กำหนดการอาจเปลี่ยนแปลงได้ตามความเหมาะสม</p>
  </div>
</template>

<script setup lang="ts">
const schedule = [
  {
    date: "วันที่ 12 พฤศจิกายน 2569",
    items: [
      { time: "08:30 – 09:00", detail: "ลงทะเบียนและต้อนรับผู้เข้าร่วมงาน" },
      { time: "09:00 – 09:30", detail: "กล่าวต้อนรับผู้เข้าร่วมงานและมอบของที่ระลึกแก่ผู้สนับสนุนหลัก โดย อธิการบดี มหาวิทยาลัยพระจอมเกล้าพระนครเหนือ/ผู้อำนวยการอุทยานเทคโนโลยี" },
      { time: "09:30 – 10:15", detail: "การบรรยายพิเศษ โดย ดร.พิรุณ สัยยะสิทธิ์พานิช อธิบดีกรมลดโลกร้อน" },
      { time: "10:15 – 10:30", detail: "พักรับประทานอาหารว่าง" },
      { time: "10:30 – 12:00", detail: "การเสวนา “ผลกระทบไมโครพลาสติกต่อสุขภาพ” โดย กรรมการสมาคม ฯ" },
      { time: "12:00 – 13:00", detail: "รับประทานอาหารกลางวัน" },
      { time: "13:00 – 14:15", detail: "การนำเสนอผลงานแบบบรรยาย (ช่วงที่ 1)" },
      { time: "14:15 – 14:30", detail: "พักรับประทานอาหารว่าง" },
      { time: "14:30 – 16:30", detail: "การนำเสนอผลงานแบบบรรยาย (ช่วงที่ 2)" },
      { time: "16:30 – 18:00", detail: "การนำเสนอผลงานแบบโปสเตอร์" },
      { time: "18:00 – 20:00", detail: "รับประทานอาหารเย็นและเข้าร่วมกิจกรรม" },
    ],
  },
  {
    date: "วันที่ 13 พฤศจิกายน 2569",
    items: [
      { time: "08:30 – 09:00", detail: "ลงทะเบียน" },
      { time: "09:00 – 10:15", detail: "การนำเสนอผลงานแบบบรรยาย (ช่วงที่ 3)" },
      { time: "10:15 – 10:30", detail: "พักรับประทานอาหารว่าง" },
      { time: "10:30 – 12:00", detail: "การนำเสนอผลงานแบบบรรยาย (ช่วงที่ 4)" },
      { time: "12:00 – 13:00", detail: "รับประทานอาหารกลางวัน" },
      { time: "13:00 – 15:00", detail: "เยี่ยมชมอุทยานเทคโนโลยี มจพ." },
      { time: "15:00 – 15:15", detail: "พักรับประทานอาหารว่าง" },
      { time: "15:15 – 16:00", detail: "พิธีมอบประกาศนียบัตรและพิธีปิดการ" },
    ],
  },
]
</script>
