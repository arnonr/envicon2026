<script setup lang="ts">
const tracks = [
  {
    id: 1,
    th: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
    en: "Environmental Science and Pollution Control",
    desc: "ครอบคลุมงานวิจัยด้านคุณภาพน้ำ อากาศ ดิน การจัดการของเสีย และเทคโนโลยีบำบัดมลพิษ",
    icon: "i-heroicons-beaker",
  },
  {
    id: 2,
    th: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ",
    en: "Ecosystem and Natural Resource Management",
    desc: "การอนุรักษ์ความหลากหลายทางชีวภาพ การจัดการป่าไม้ ทรัพยากรทางทะเล และพื้นที่ชุ่มน้ำ",
    icon: "i-heroicons-globe-alt",
  },
  {
    id: 3,
    th: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า",
    en: "Circular Economy and Resource Efficiency",
    desc: "แนวคิดเศรษฐกิจหมุนเวียน การลดของเสีย การรีไซเคิล และการออกแบบผลิตภัณฑ์ที่ยั่งยืน",
    icon: "i-heroicons-arrow-path",
  },
  {
    id: 4,
    th: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ",
    en: "Climate Change and Low-Carbon Technology",
    desc: "การปรับตัวและลดผลกระทบจากการเปลี่ยนแปลงสภาพภูมิอากาศ พลังงานสะอาด และเทคโนโลยีคาร์บอนต่ำ",
    icon: "i-heroicons-sun",
  },
  {
    id: 5,
    th: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
    en: "Digital Technology and Intelligent Systems for Environmental Monitoring",
    desc: "IoT, AI, Remote Sensing, GIS และระบบสารสนเทศเพื่อการติดตามและจัดการสิ่งแวดล้อม",
    icon: "i-heroicons-cpu-chip",
  },
  {
    id: 6,
    th: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
    en: "Sustainable Cities, Green Industry, and Environmental Management",
    desc: "การวางผังเมือง การจัดการสิ่งแวดล้อมในภาคอุตสาหกรรม และการพัฒนาเมืองที่ยั่งยืน",
    icon: "i-heroicons-building-office-2",
  },
  {
    id: 7,
    th: "สิ่งแวดล้อมและสุขภาพ",
    en: "Environment and Health",
    desc: "ผลกระทบของสิ่งแวดล้อมต่อสุขภาพ พิษวิทยาสิ่งแวดล้อม และอาชีวอนามัย",
    icon: "i-heroicons-heart",
  },
];
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <section class="max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">เกี่ยวกับการประชุม</h1>

      <div class="prose prose-lg max-w-none">
        <p>
          <strong>การประชุมวิชาการระดับชาติ ครั้งที่ 5 สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย (ENVICON 2026)</strong>
          จัดขึ้นภายใต้หัวข้อ
        </p>

        <blockquote class="border-l-4 border-primary-600 pl-4 italic text-primary-700">
          "Innovative Environmental Technologies for a Sustainable and Low-Carbon Future"
          <br />
          เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ
        </blockquote>

        <p>
          การประชุมครั้งนี้มีวัตถุประสงค์เพื่อเป็นเวทีแลกเปลี่ยนความรู้ ผลงานวิจัย
          และนวัตกรรมด้านสิ่งแวดล้อมระหว่างนักวิจัย อาจารย์ นิสิตนักศึกษา
          และผู้เชี่ยวชาญจากสถาบันอุดมศึกษาทั่วประเทศ
        </p>

        <h2 class="text-xl font-bold mt-8 mb-4">สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย</h2>
        <p>
          Association of Thai Higher Education Environmental Institutions
          เป็นเครือข่ายความร่วมมือระหว่างสถาบันอุดมศึกษาที่มีการเรียนการสอนและวิจัยด้านสิ่งแวดล้อม
          มุ่งเน้นการพัฒนาองค์ความรู้และสร้างบุคลากรด้านสิ่งแวดล้อมเพื่อการพัฒนาที่ยั่งยืน
        </p>

        <h2 class="text-xl font-bold mt-8 mb-4">วัตถุประสงค์</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>เผยแพร่ผลงานวิจัยและนวัตกรรมด้านสิ่งแวดล้อม</li>
          <li>แลกเปลี่ยนความรู้และประสบการณ์ระหว่างนักวิจัยและผู้เชี่ยวชาญ</li>
          <li>สร้างเครือข่ายความร่วมมือด้านวิจัยสิ่งแวดล้อมระหว่างสถาบัน</li>
          <li>ส่งเสริมการพัฒนาเทคโนโลยีสิ่งแวดล้อมเพื่อสังคมคาร์บอนต่ำ</li>
        </ul>
      </div>
    </section>

    <section class="mt-16 border-t border-gray-200 pt-12">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">หัวข้อการนำเสนอผลงาน</h2>
        <p class="text-gray-500">Presentation Tracks</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard v-for="track in tracks" :key="track.id">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <UIcon :name="track.icon" class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div class="text-xs font-bold text-primary-600 mb-1">Track {{ track.id }}</div>
              <h3 class="font-semibold text-gray-900 mb-1">{{ track.th }}</h3>
              <p class="text-sm text-accent-600 mb-2">{{ track.en }}</p>
              <p class="text-sm text-gray-500">{{ track.desc }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>
