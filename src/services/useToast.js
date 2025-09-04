import { createApp, h } from "vue";

export function useToast() {
  const showToast = (message, type = "success", duration = 3500) => {
    // Create container if it doesn't exist
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = `fixed top-4 right-4 z-100 flex flex-col space-y-4 w-100`;
      document.body.appendChild(container);
    }

    // Create mount point for this toast
    const mountPoint = document.createElement("div");
    container.appendChild(mountPoint);

    // Create Vue app
    const toastApp = createApp({
      data: () => ({ visible: true, closing: false }),
      methods: {
        close() {
          this.closing = true;
          setTimeout(() => {
            this.visible = false;
            setTimeout(() => {
              toastApp.unmount(); // ✅ unmount the app instance, not the component
              mountPoint.remove();
            }, 50); // small delay after animation
          }, 300); // allow fade-out animation time
        },
      },
      render() {
        if (!this.visible) return null;

        return h(
          "div",
          {
            class: `
              ${type === "success" ? "bg-success-lightest border-s-4 border-success" : "bg-danger-light border-s-4 border-danger"}
              rounded-lg p-4 shadow-lg flex items-start justify-between
              ${this.closing ? "animate-toast-out" : "animate-toast-in"}
            `,
          },
          [
            h("div", { class: "flex" }, [
              h("div", { class: "shrink-0" }, [
                h("span", {
                  class: `inline-flex justify-center items-center size-8 rounded-full border-4 ${
                    type === "success"
                      ? "border-success-light bg-success-light text-success-dark"
                      : "border-red-100 bg-red-200 text-red-800"
                  }`,
                  innerHTML:
                    type === "success"
                      ? `<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>`
                      : `<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>`,
                }),
              ]),
              h("div", { class: "ms-3" }, [
                h("h3", { class: "text-lg text-gray-800 font-semibold" }, type === "success" ? "Success" : "Error"),
                h("p", { class: "text-md text-gray-700" }, message),
              ]),
            ]),
            h(
              "button",
              {
                class: "ms-4 text-black hover:text-gray-600",
                onClick: this.close,
              },
              "✕"
            ),
          ]
        );
      },
      mounted() {
        setTimeout(this.close, duration); // auto close
      },
    });

    toastApp.mount(mountPoint);
  };

  return { toast: showToast };
}
