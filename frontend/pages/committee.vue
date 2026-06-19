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
