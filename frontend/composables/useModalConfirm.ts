import { createApp, defineComponent, h, ref } from "vue";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

export function useModalConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const isOpen = ref(true);
    const {
      title,
      message,
      confirmText = "ยืนยัน",
      cancelText = "ยกเลิก",
      type = "warning",
    } = options;

    const colorMap: Record<string, string> = {
      warning: "amber",
      danger: "red",
      info: "blue",
    };
    const color = colorMap[type] ?? "amber";

    const iconMap: Record<string, string> = {
      warning: "i-heroicons-exclamation-triangle",
      danger: "i-heroicons-x-circle",
      info: "i-heroicons-information-circle",
    };
    const icon = iconMap[type] ?? iconMap.warning;

    const cleanup = () => {
      isOpen.value = false;
      app.unmount();
      document.body.removeChild(el);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const ConfirmDialog = defineComponent({
      setup() {
        return () =>
          h(
            "div",
            {
              class: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50",
              onClick: (e: Event) => {
                if (e.target === e.currentTarget) onCancel();
              },
            },
            [
              h(
                "div",
                {
                  class:
                    "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6",
                },
                [
                  h("div", { class: "flex items-start gap-4" }, [
                    h("div", {
                      class: `i-${icon.split("i-")[1]} w-6 h-6 text-${color}-500 shrink-0 mt-0.5`,
                    }),
                    h("div", { class: "flex-1" }, [
                      h(
                        "h3",
                        { class: "text-lg font-semibold text-gray-900" },
                        title,
                      ),
                      h(
                        "p",
                        { class: "mt-2 text-sm text-gray-600" },
                        message,
                      ),
                    ]),
                  ]),
                  h(
                    "div",
                    {
                      class: "mt-6 flex justify-end gap-3",
                    },
                    [
                      h(
                        "button",
                        {
                          class:
                            "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition",
                          onClick: onCancel,
                        },
                        cancelText,
                      ),
                      h(
                        "button",
                        {
                          class: `px-4 py-2 text-sm font-medium text-white bg-${color}-500 rounded-md hover:bg-${color}-600 transition`,
                          onClick: onConfirm,
                        },
                        confirmText,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          );
      },
    });

    const el = document.createElement("div");
    document.body.appendChild(el);
    const app = createApp(ConfirmDialog);
    app.mount(el);
  });
}
