const EARLY_BIRD_DEADLINE = new Date('2026-10-14T00:00:00+07:00');

export function useFees() {
  const isEarlyBird = computed(() => new Date() < EARLY_BIRD_DEADLINE);

  const fees = computed(() => ({
    student: isEarlyBird.value ? 500 : 700,
    general: isEarlyBird.value ? 2000 : 2500,
  }));

  const studentLabel = computed(() =>
    `นิสิต/นักศึกษา (${fees.value.student.toLocaleString()} บาท)`,
  );
  const generalLabel = computed(() =>
    `อาจารย์/นักวิจัย/บุคคลทั่วไป (${fees.value.general.toLocaleString()} บาท)`,
  );

  return { isEarlyBird, fees, studentLabel, generalLabel };
}
