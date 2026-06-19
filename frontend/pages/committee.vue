<script setup lang="ts">
interface Member {
  prefix: string;
  firstName: string;
  lastName: string;
  affiliation: string;
}

interface CommitteeGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  members: Member[];
}

const committees: CommitteeGroup[] = [
  {
    id: "advisory",
    title: "คณะกรรมการอำนวยการ",
    titleEn: "Advisory Committee",
    icon: "i-heroicons-user-group",
    members: [
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "รัฐชา", lastName: "ชัยชนะ", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ศาสตราจารย์ ดร.", firstName: "วรณพ", lastName: "วิยกาญจน์", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พีรพงษ์", lastName: "พรวงศ์ทอง", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
    ],
  },
  {
    id: "academic",
    title: "คณะกรรมการฝ่ายวิชาการ",
    titleEn: "Academic Committee",
    icon: "i-heroicons-academic-cap",
    members: [
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "อุมา", lastName: "ลางคุลเสน", affiliation: "มหาวิทยาลัยธรรมศาสตร์" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "สุเมธ", lastName: "วงศ์เขียว", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "ชุลีมาศ", lastName: "บุญไทย อิวาย", affiliation: "มหาวิทยาลัยขอนแก่น" },
      { prefix: "รองศาสตราจารย์ พ.อ.ดร.", firstName: "กิตติภพ", lastName: "พรหมดี", affiliation: "โรงเรียนนายร้อยพระจุลจอมเกล้า" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พรรณวดี", lastName: "สุวัฒิกะ", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "อรประภา", lastName: "ภุมมะกาญจนะ โรแบร์", affiliation: "มหาวิทยาลัยศิลปากร" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "สตรีไทย", lastName: "พุ่มไม้", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "รัชวุฒิ", lastName: "โคตรลาคำ", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "มนพร", lastName: "วงศ์สุนทรชัย", affiliation: "มหาวิทยาลัยธรรมศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ปฏิพัทธ์", lastName: "วงค์เรือง", affiliation: "มหาวิทยาลัยพะเยา" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ปิยะวดี", lastName: "ศรีวิชัย", affiliation: "มหาวิทยาลัยพะเยา" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "บงกช", lastName: "วิชาชูเชิด", affiliation: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน" },
      { prefix: "ดร.", firstName: "นฤพร", lastName: "เพ็ชร์กลาง", affiliation: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน" },
      { prefix: "ดร.", firstName: "พรเทพ", lastName: "พรรณรักษ์", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ดร.", firstName: "ยศวดี", lastName: "ฮะวังจู", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ดร.", firstName: "ชิษณุพงษ์", lastName: "ชาติอาษา", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
    ],
  },
  {
    id: "registration",
    title: "ฝ่ายลงทะเบียน",
    titleEn: "Registration Committee",
    icon: "i-heroicons-clipboard-document-list",
    members: [
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "สตรีไทย", lastName: "พุ่มไม้", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "นางสาว", firstName: "ปุณยานุช", lastName: "แดงจะนะ", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "นางสาว", firstName: "ณัฐนริน", lastName: "ทองดี", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "นางสาว", firstName: "อมรรัตน์", lastName: "รักงาม", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
    ],
  },
  {
    id: "venue",
    title: "ฝ่ายสถานที่ พิธีการ และการศึกษาดูงาน",
    titleEn: "Venue, Ceremony & Study Visit Committee",
    icon: "i-heroicons-map-pin",
    members: [
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พีรพงษ์", lastName: "พรวงศ์ทอง", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พรรณวดี", lastName: "สุวัฒิกะ", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "สุเมธ", lastName: "วงศ์เขียว", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "อรประภา", lastName: "ภุมมะกาญจนะ โรแบร์", affiliation: "มหาวิทยาลัยศิลปากร" },
    ],
  },
  {
    id: "sponsorship",
    title: "ฝ่ายระดมทุนและสปอนเซอร์",
    titleEn: "Fundraising & Sponsorship Committee",
    icon: "i-heroicons-currency-dollar",
    members: [
      { prefix: "รองศาสตราจารย์ พ.อ.ดร.", firstName: "กิตติภพ", lastName: "พรหมดี", affiliation: "โรงเรียนนายร้อยพระจุลจอมเกล้า" },
    ],
  },
];

function getInitials(m: Member): string {
  const first = m.firstName?.charAt(0) ?? "";
  const last = m.lastName?.charAt(0) ?? "";
  return (first + last).toUpperCase();
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <!-- Page header -->
    <header class="text-center mb-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">คณะกรรมการ</h1>
      <p class="text-gray-500 text-lg">Organizing Committee</p>
      <div class="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
    </header>

    <!-- Sections -->
    <section
      v-for="(group, gi) in committees"
      :key="group.id"
      :class="gi > 0 ? 'mt-16' : ''"
    >
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <UIcon :name="group.icon" class="w-6 h-6 text-primary-600" aria-hidden="true" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ group.title }}</h2>
          <p class="text-sm text-gray-500">{{ group.titleEn }}</p>
        </div>
      </div>
      <div class="h-px bg-gray-200 mb-8"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="(m, mi) in group.members"
          :key="group.id + '-' + mi"
          class="p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg flex-shrink-0"
              aria-hidden="true"
            >
              {{ getInitials(m) }}
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-gray-900 leading-snug">
                {{ m.prefix }} {{ m.firstName }} {{ m.lastName }}
              </h3>
              <p class="text-sm text-gray-500 mt-0.5 truncate">{{ m.affiliation }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>
