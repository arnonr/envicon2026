export const useComingSoon = () => {
  const show = async () => {
    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      title: "Coming Soon",
      text: "ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้",
      icon: "info",
      confirmButtonText: "รับทราบ",
      confirmButtonColor: "#059669",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  return { show };
};
