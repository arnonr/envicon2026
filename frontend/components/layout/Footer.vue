<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">ENVICON 2026</h3>
          <p class="text-sm leading-relaxed">
            การประชุมวิชาการระดับชาติ ครั้งที่ 5<br />
            สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย
          </p>
          <p class="text-sm mt-2">12-13 พฤศจิกายน 2569</p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">ลิงก์ด่วน</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/about" class="hover:text-primary-400 transition-colors">เกี่ยวกับการประชุม</NuxtLink></li>
            <li><NuxtLink to="/tracks" class="hover:text-primary-400 transition-colors">หัวข้อการนำเสนอ</NuxtLink></li>
            <li><NuxtLink to="/guidelines" class="hover:text-primary-400 transition-colors">แนวทางการเขียนบทความ</NuxtLink></li>
            <li><NuxtLink to="/registration" class="hover:text-primary-400 transition-colors">ลงทะเบียน</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">ติดต่อเรา</h3>
          <ul class="space-y-2 text-sm">
            <li>📧 fiit@technopark.kmutnb.ac.th</li>
            <li>📍 อาคาร 99 อุทยานเทคโนโลยี มจพ.</li>
            <li>🌐 technopark.kmutnb.ac.th/envicon2026</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
        <p>© 2569 ENVICON 2026 — สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย</p>
      </div>
    </div>
  </footer>
</template>
