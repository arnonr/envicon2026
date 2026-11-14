export const AWARD_RESULTS_PDF_PATH = "/downloads/TSHE-CON-2026-Award-Results.pdf";

export type AwardCategoryKey = "oral_undergrad" | "oral_grad" | "poster";
export type AwardTier = "first" | "second" | "third" | "honorable";

export interface AwardItem {
  code: string;
  rankLabel: string;
  tier: AwardTier;
  title: string;
  authors: string;
  affiliation: string;
  categoryKey: AwardCategoryKey;
  categoryTitle: string;
}

export interface AwardCategoryGroup {
  key: AwardCategoryKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  badgeClass: string;
  headerClass: string;
  awards: AwardItem[];
}

export const awardCategories: AwardCategoryGroup[] = [
  {
    key: "oral_undergrad",
    title: "ประเภท Oral Presentation ระดับปริญญาตรี",
    shortTitle: "Oral ปริญญาตรี",
    subtitle: "Undergraduate Oral Presentation Awards (5 รางวัล)",
    badgeClass: "bg-meadow-100 text-meadow-900 border-meadow-300",
    headerClass: "from-meadow-800 via-meadow-700 to-teal-800",
    awards: [
      {
        code: "NAT-O-01",
        rankLabel: "รางวัลชนะเลิศ",
        tier: "first",
        title: "แนวทางการจัดการสวนป่าไม้พะยูงโดยการคัดเลือกต้นไม้เป้าหมายและการตัดขยายระยะ",
        authors: "ยุทธจักร จิบกระโทก และ มิชาเอล เยงเค็อะ",
        affiliation: "คณะวนศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ บางเขน",
        categoryKey: "oral_undergrad",
        categoryTitle: "ประเภท Oral Presentation ระดับปริญญาตรี",
      },
      {
        code: "CLIM-O-08",
        rankLabel: "รางวัลรองชนะเลิศอันดับ 1",
        tier: "second",
        title:
          "การจัดทำบัญชีการปล่อยมลพิษทางอากาศและก๊าซเรือนกระจกจากภาคคมนาคมทางถนนและการประเมินฉากทัศน์มาตรการลดการปล่อยในเขตกรุงเทพมหานครและปริมณฑล",
        authors: "ชนะชัย พูลวงษ์, สาธิดา ศรีสังข์งาม, ชมน์ณานันท์ แจ่มเที่ยงตรง และ ธนพัฒน์ จันทร์สระคู",
        affiliation: "คณะสิ่งแวดล้อม มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน",
        categoryKey: "oral_undergrad",
        categoryTitle: "ประเภท Oral Presentation ระดับปริญญาตรี",
      },
      {
        code: "CIRC-O-04",
        rankLabel: "รางวัลชมเชย",
        tier: "honorable",
        title:
          "การพัฒนาวัสดุเชื่อมประสานปอซโซลานเชิงวิศวกรรมบูรณาการจากขยะเปลือกเพรียงทะเล : การควบคุมระบบเผาแคลไซน์อัตโนมัติและพลศาสตร์การบดละเอียด",
        authors:
          "พงศ์ศรัณย์ อมรสิงห์, เก็จฐาพล ศรีจันทร์สุข, ธัญเทพ อัจฉริยวงศ์, พัฒนวัฒน์ อินทร์ประเสริฐ, สถาพร อยู่สมบูรณ์, จิตสุภา ดีโพธิ์, อัยยะ จันทรศิริ, นภดล วิวัชรโกเศศ และ ทรงศักดิ์ พลานนท์",
        affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ วิทยาเขตระยอง",
        categoryKey: "oral_undergrad",
        categoryTitle: "ประเภท Oral Presentation ระดับปริญญาตรี",
      },
      {
        code: "CIRC-O-10",
        rankLabel: "รางวัลชมเชย",
        tier: "honorable",
        title: "ทางเลือกเศรษฐกิจหมุนเวียนปี 2569 สำหรับฟางข้าว เศษข้าวโพด และใบอ้อยในประเทศไทยเพื่อลด PM2.5",
        authors: "กัญญาณัฐ สุไกรธิ, รัชดาภรณ์ เคนคำพัน, ณัฐชา บูรณปรีชา, ณพเมธ พันทวีศักดิ์",
        affiliation: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยบูรพา",
        categoryKey: "oral_undergrad",
        categoryTitle: "ประเภท Oral Presentation ระดับปริญญาตรี",
      },
      {
        code: "EH-O-08",
        rankLabel: "รางวัลชมเชย",
        tier: "honorable",
        title:
          "การปนเปื้อนและการประเมินดัชนีความเสี่ยงเชิงนิเวศของโลหะหนักในดินบริเวณพื้นที่กำจัดขยะมูลฝอยแบบเทกองที่อยู่ใกล้พื้นที่เพาะปลูกข้าว",
        authors: "อนุชา กุลบุตร, พรรณวีร์ เมฆวิชัย และ วัชรพล วงศ์เลิศอารักษ์",
        affiliation: "คณะวิทยาศาสตร์ มหาวิทยาลัยอุบลราชธานี",
        categoryKey: "oral_undergrad",
        categoryTitle: "ประเภท Oral Presentation ระดับปริญญาตรี",
      },
    ],
  },
  {
    key: "oral_grad",
    title: "ประเภท Oral Presentation ระดับบัณฑิตศึกษา",
    shortTitle: "Oral บัณฑิตศึกษา",
    subtitle: "Graduate Oral Presentation Awards (2 รางวัล)",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-300",
    headerClass: "from-sky-800 via-sky-700 to-cyan-800",
    awards: [
      {
        code: "CLIM-O-13",
        rankLabel: "รางวัลชนะเลิศ",
        tier: "first",
        title:
          "การตอบสนองทางสรีรวิทยาของถั่วเหลือง 19 สายพันธุ์ภายใต้สภาวะแห้งแล้งจากการเปลี่ยนแปลงสภาพภูมิอากาศเพื่อคัดเลือกสายพันธุ์ทนแล้งสำหรับระบบการผลิตคาร์บอนต่ำ",
        authors: "รัตดาวัล มอญทิพย์, ชัยณรงค์ สกุลแถว, ปิยะพร พันธุ์ศักดิ์ และ ชนัตถ์ โชคเจริญรัตน์",
        affiliation: "คณะสาธารณสุขศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ สกลนคร",
        categoryKey: "oral_grad",
        categoryTitle: "ประเภท Oral Presentation ระดับบัณฑิตศึกษา",
      },
      {
        code: "ENV-O-04",
        rankLabel: "รางวัลรองชนะเลิศอันดับ 1",
        tier: "second",
        title:
          "การกำจัดไนเตรตและกรดเพอร์ฟลูออโรออกทาโนอิกด้วยกระบวนการดีไนตริฟิเคชันแบบออโตโทรฟิกร่วมกับการฉายรังสีอัลตราไวโอเลต",
        authors: "ธิติวุฒิ มลิวัลย์ และ เจนยุกต์ โล่ห์วัชรินทร์",
        affiliation: "คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
        categoryKey: "oral_grad",
        categoryTitle: "ประเภท Oral Presentation ระดับบัณฑิตศึกษา",
      },
    ],
  },
  {
    key: "poster",
    title: "ประเภท Poster Presentation",
    shortTitle: "Poster Presentation",
    subtitle: "Poster Presentation Awards (3 รางวัล)",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    headerClass: "from-purple-900 via-purple-800 to-indigo-900",
    awards: [
      {
        code: "EH-P-04",
        rankLabel: "รางวัลชนะเลิศ",
        tier: "first",
        title:
          "การย่อยสลายฟีนอลทางชีวภาพโดย Bacillus stratosphericus และ Bacillus velezensis ที่แยกได้จากพื้นที่ปนเปื้อนฟีนอล",
        authors: "ณัฐณิชา ลุ่มลึก, นารีลักษณ์ นาแก้ว และ ศิริวรรณ วิชัย",
        affiliation: "คณะวิทยาศาสตร์การแพทย์ มหาวิทยาลัยนเรศวร",
        categoryKey: "poster",
        categoryTitle: "ประเภท Poster Presentation",
      },
      {
        code: "ENV-P-05",
        rankLabel: "รางวัลรองชนะเลิศอันดับ 1",
        tier: "second",
        title:
          "การบำบัดน้ำเสียจากการย้อมไหมโดยการรวมตะกอนร่วมกับกระบวนการโอโซเนชันที่ใช้ถ่านชีวภาพแม่เหล็กเป็นตัวเร่งปฏิกิริยา",
        authors: "ชลอ จารุสุทธิรักษ์, กัญญชญาวีร์ เอียบสกุล, สรสิช แย้มอาษา และ สายธารทิพย์ สวนขวัญ",
        affiliation: "คณะสิ่งแวดล้อม มหาวิทยาลัยเกษตรศาสตร์ บางเขน",
        categoryKey: "poster",
        categoryTitle: "ประเภท Poster Presentation",
      },
      {
        code: "NAT-P-03",
        rankLabel: "รางวัลรองชนะเลิศอันดับ 2",
        tier: "third",
        title:
          "ถิ่นที่อยู่ที่เหมาะสมและการทับซ้อนระหว่างเสือโคร่ง (Panthera tigris) และ หมาใน (Cuon alpinus) ในเขตรักษาพันธุ์สัตว์ป่าสลักพระ จังหวัดกาญจนบุรี",
        authors: "จตุรวิทย์ ยิ่งไพบูลย์, รัตนวัฒน์ ไชยรัตน์, กันต์ ปานประยูร และ พิสุทธิ นาคหมื่นไวย",
        affiliation: "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล",
        categoryKey: "poster",
        categoryTitle: "ประเภท Poster Presentation",
      },
    ],
  },
];

export const allAwards: AwardItem[] = awardCategories.flatMap((category) => category.awards);
