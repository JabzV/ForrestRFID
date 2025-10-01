<template>
  <CustomDialog title="Session Receipt" :closable="true" ref="sessionDialog">
    <div class="p-4 w-8/12 mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading session details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="text-lg text-red-600 mb-2">Error Loading Session</div>
          <div class="text-sm text-gray-500">{{ error }}</div>
        </div>
      </div>

      <!-- Session Receipt -->
      <div
        v-else-if="sessionDetails"
        id="receipt-content"
        class="space-y-4 bg-white"
      >
        <!-- Receipt Header -->
        <div class="text-center border-b-2 border-dashed border-gray-300 pb-4">
          <h2 class="text-lg font-bold text-gray-800">
            {{ sessionDetails.full_name }}
          </h2>
          <p class="text-sm text-gray-600">RFID: {{ sessionDetails.rfid }}</p>
          <p class="text-sm text-gray-600">
            {{ formatSessionDate(sessionDetails.created_at) }}
          </p>
          <div class="mt-2">
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatusBadgeClass(sessionDetails.status)"
            >
              {{ sessionDetails.status?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Session Info -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Session Profile:</span>
            <span class="font-medium">{{
              sessionDetails.session_profile_name || "N/A"
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Member Role:</span>
            <span class="font-medium">{{
              sessionDetails.role_name || "Non-Member"
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Rate:</span>
            <span class="font-medium">{{
              billingBreakdown.rateInfo.formatted
            }}</span>
          </div>
        </div>

        <!-- Time Details -->
        <div class="border-t border-gray-200 pt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Time In:</span>
            <span class="font-medium">{{
              formatTime(sessionDetails.time_in)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Time Out:</span>
            <span class="font-medium">{{ getTimeOutDisplay() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Elapsed Time:</span>
            <span class="font-medium">{{
              billingBreakdown.elapsedTime.formatted
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Grace Period:</span>
            <span class="font-medium"
              >{{ billingBreakdown.gracePeriod.minutes }} min</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Min. Billable:</span>
            <span class="font-medium"
              >{{ billingBreakdown.minimumSession.minutes }} min</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Billable Time:</span>
            <span class="font-medium">{{ getBillableTimeDisplay() }}</span>
          </div>
        </div>

        <!-- Billing Calculation -->
        <div class="border-t border-gray-200 pt-3 space-y-2 text-sm">
          <!-- Base Amount - Always show for consistency -->
          <div class="flex justify-between">
            <span class="text-gray-600">Base Amount:</span>
            <span class="font-medium"
              >₱{{ billingBreakdown.baseAmount.toFixed(2) }}</span
            >
          </div>

          <!-- Member Discount - Always show section for consistency -->
          <div
            v-if="billingBreakdown.memberDiscount.amount > 0"
            class="flex justify-between text-green-600"
          >
            <span>Member Discount ({{ getMemberDiscountText() }}):</span>
            <span
              >-₱{{ billingBreakdown.memberDiscount.amount.toFixed(2) }}</span
            >
          </div>

          <!-- Promo Discounts -->
          <div
            v-for="promo in billingBreakdown.promoDiscounts"
            :key="promo.name"
            class="flex justify-between text-green-600"
          >
            <span>{{ promo.name }} ({{ promo.value }}%):</span>
            <span>-₱{{ promo.amount.toFixed(2) }}</span>
          </div>

          <!-- Total Savings - Always show section for consistency -->
          <div
            v-if="billingBreakdown.totalDiscount > 0"
            class="flex justify-between text-green-600 font-medium"
          >
            <span>Total Discount:</span>
            <span>₱{{ billingBreakdown.totalDiscount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Final Amount - Always consistent spacing -->
        <div class="border-t-2 border-dashed border-gray-300 pt-3 mt-3">
          <div class="flex justify-between items-center text-lg font-bold">
            <span class="text-gray-800">{{ getFinalAmountLabel() }}:</span>
            <span class="text-primary1"
              >₱{{ billingBreakdown.finalAmount.toFixed(2) }}</span
            >
          </div>
        </div>

        <!-- Status Message - Always consistent spacing -->
        <div class="text-center text-sm text-gray-500 italic mt-4">
          <div v-if="getStatusMessage()">
            {{ getStatusMessage() }}
          </div>
          <div v-else-if="isBelowMinimum()">
            Session duration is below the minimum billable time of
            {{ billingBreakdown.minimumSession.minutes }} minutes. No charges
            applied.
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          class="px-4 py-2 bg-primary1/95 text-white rounded-xl hover:opacity-85 transition-all duration-200 flex items-center gap-2"
          @click="saveAsImage"
          :disabled="isSaving"
        >
          <i class="pi pi-download text-sm"></i>
          {{ isSaving ? "Saving..." : "Save Receipt" }}
        </button>
        <button
          type="button"
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </CustomDialog>
</template>

<script setup>
import { ref, computed } from "vue";
import CustomDialog from "./CustomDialog.vue";
import HeaderAndSubtext from "../../shared/DisplayText/HeaderAndSubtext.vue";
import { getSessionDetails } from "../../../../store/vueStore/History/sessionDetailsService.js";
import {
  formatDateToTime,
  formatToMMDDYY,
  formatDate,
  sentenceCase,
} from "../../../services/utils.js";

const sessionDialog = ref(null);
const isLoading = ref(false);
const error = ref(null);
const sessionDetails = ref(null);
const billingBreakdown = ref(null);
const isSaving = ref(false);

const hasDiscounts = computed(() => {
  return (
    billingBreakdown.value &&
    (billingBreakdown.value.memberDiscount.amount > 0 ||
      billingBreakdown.value.promoDiscounts.length > 0)
  );
});

const openModal = async (sessionId) => {
  if (!sessionDialog.value) return;

  isLoading.value = true;
  error.value = null;
  sessionDetails.value = null;
  billingBreakdown.value = null;

  try {
    sessionDialog.value.openModal();
    const details = await getSessionDetails(sessionId);
    sessionDetails.value = details;
    billingBreakdown.value = details.billingBreakdown;
  } catch (err) {
    error.value = err.message || "Failed to load session details";
    console.error("Error loading session details:", err);
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  if (sessionDialog.value) {
    sessionDialog.value.closeModal();
  }
};

const formatSessionDate = (dateString) => {
  return formatToMMDDYY(formatDate(dateString));
};

const formatTime = (timeString) => {
  return formatDateToTime(timeString);
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: "bg-warning-light text-warning",
    completed: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger",
  };
  return classes[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
};

const getTimeOutDisplay = () => {
  if (!sessionDetails.value) return "-";

  const status = sessionDetails.value.status?.toLowerCase();
  if (status === "cancelled") {
    return "CANCELLED";
  } else if (status === "pending") {
    return "PENDING";
  } else if (sessionDetails.value.time_out) {
    return formatTime(sessionDetails.value.time_out);
  }
  return "Not ended";
};

const getBillableTimeDisplay = () => {
  if (!billingBreakdown.value) return "-";

  const status = sessionDetails.value?.status?.toLowerCase();
  if (status === "cancelled") {
    return "0m";
  }
  return billingBreakdown.value.billableTime.formatted;
};

const getMemberDiscountText = () => {
  if (!billingBreakdown.value?.memberDiscount) return "";

  const discount = billingBreakdown.value.memberDiscount;
  if (discount.type === "percentage") {
    return `${discount.value}%`;
  } else if (discount.type === "fixed") {
    return `₱${discount.value}`;
  }
  return "";
};

const getFinalAmountLabel = () => {
  const status = sessionDetails.value?.status?.toLowerCase();
  if (status === "cancelled") {
    return "Amount (Cancelled)";
  } else if (status === "pending") {
    return "Current Bill";
  }
  return "Final Amount";
};

const getStatusMessage = () => {
  const status = sessionDetails.value?.status?.toLowerCase();
  if (status === "cancelled") {
    return "This session was cancelled. No charges applied.";
  } else if (status === "pending") {
    return "Session is still active. Amount may change.";
  }
  return null;
};

const isBelowMinimum = () => {
  return billingBreakdown.value?.minimumSession?.belowMinimum || false;
};

const saveAsImage = async () => {
  if (isSaving.value) return;

  isSaving.value = true;

  // Create a temporary style element to override oklch colors globally
  const tempStyle = document.createElement("style");
  tempStyle.id = "temp-html2canvas-fix";
  tempStyle.textContent = `
    /* AGGRESSIVE oklch color override - catch everything */
    #receipt-content,
    #receipt-content *,
    #receipt-content *::before,
    #receipt-content *::after {
      color: inherit !important;
      background-color: inherit !important;
      border-color: inherit !important;
    }
    
    /* Receipt container styles */
    #receipt-content {
      width: 400px !important;
      max-width: none !important;
      overflow: visible !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      background-color: #ffffff !important;
      color: #111827 !important;
      padding: 0 20px !important; /* Add left and right padding for clarity */
      box-sizing: border-box !important;
    }
    
    /* Specific color overrides with higher specificity */
    #receipt-content .text-primary1,
    #receipt-content [class*="text-primary1"] {
      color: #3b82f6 !important;
    }
    #receipt-content .bg-primary1\\/10,
    #receipt-content [class*="bg-primary1/10"] {
      background-color: rgba(59, 130, 246, 0.1) !important;
    }
    #receipt-content .border-primary1\\/20,
    #receipt-content [class*="border-primary1/20"] {
      border-color: rgba(59, 130, 246, 0.2) !important;
    }
    #receipt-content .text-success,
    #receipt-content [class*="text-success"] {
      color: #10b981 !important;
    }
    #receipt-content .text-warning,
    #receipt-content [class*="text-warning"] {
      color: #f59e0b !important;
    }
    #receipt-content .text-danger,
    #receipt-content [class*="text-danger"] {
      color: #ef4444 !important;
    }
    #receipt-content .bg-success-light,
    #receipt-content [class*="bg-success-light"] {
      background-color: rgba(16, 185, 129, 0.1) !important;
    }
    #receipt-content .bg-warning-light,
    #receipt-content [class*="bg-warning-light"] {
      background-color: rgba(245, 158, 11, 0.1) !important;
    }
    #receipt-content .bg-danger-light,
    #receipt-content [class*="bg-danger-light"] {
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
    
    /* Text colors with high specificity */
    #receipt-content .text-gray-900 { color: #111827 !important; }
    #receipt-content .text-gray-800 { color: #1f2937 !important; }
    #receipt-content .text-gray-700 { color: #374151 !important; }
    #receipt-content .text-gray-600 { color: #4b5563 !important; }
    #receipt-content .text-gray-500 { color: #6b7280 !important; }
    #receipt-content .text-gray-400 { color: #9ca3af !important; }
    
    /* Background colors */
    #receipt-content .bg-white { background-color: #ffffff !important; }
    #receipt-content .bg-gray-50 { background-color: #f9fafb !important; }
    #receipt-content .bg-gray-100 { background-color: #f3f4f6 !important; }
    
    /* Border colors */
    #receipt-content .border-gray-200 { border-color: #e5e7eb !important; }
    #receipt-content .border-gray-300 { border-color: #d1d5db !important; }
    
    /* Status text styling - no background, just colored text */
    #receipt-content .text-success {
      color: #059669 !important;
      background-color: transparent !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
    }
    #receipt-content .text-warning {
      color: #d97706 !important;
      background-color: transparent !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
    }
    #receipt-content .text-danger {
      color: #dc2626 !important;
      background-color: transparent !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
    }
    
    /* Layout and spacing - consistent for all receipt types */
    #receipt-content .space-y-4 > * + * {
      margin-top: 1rem !important;
    }
    #receipt-content .space-y-2 > * + * {
      margin-top: 0.5rem !important;
    }
    
    /* Consistent spacing for billing sections */
    #receipt-content .border-t {
      margin-top: 1rem !important;
      padding-top: 0.75rem !important;
    }
    #receipt-content .border-t-2 {
      margin-top: 1rem !important;
      padding-top: 0.75rem !important;
    }
    
    /* Status message consistent spacing */
    #receipt-content .mt-4 {
      margin-top: 1rem !important;
    }
    #receipt-content .border-dashed {
      border-style: dashed !important;
    }
    #receipt-content .italic {
      font-style: italic !important;
    }
    #receipt-content .text-center {
      text-align: center !important;
    }
    #receipt-content .flex {
      display: flex !important;
    }
    #receipt-content .justify-between {
      justify-content: space-between !important;
    }
    #receipt-content .font-bold {
      font-weight: 700 !important;
    }
    #receipt-content .font-medium {
      font-weight: 500 !important;
    }
    #receipt-content .text-sm {
      font-size: 0.875rem !important;
    }
    #receipt-content .text-lg {
      font-size: 1.125rem !important;
    }
    
    /* Override any remaining oklch with fallbacks */
    #receipt-content * {
      color: #374151 !important;
      background-color: transparent !important;
      border-color: #e5e7eb !important;
    }
    
    /* Re-apply specific colors after the global override */
    #receipt-content h1, #receipt-content h2, #receipt-content h3 {
      color: #111827 !important;
    }
    /* Status colors are already defined above with more specific styling */
    #receipt-content .text-primary1 { color: #3b82f6 !important; }
    
  `;

  try {
    // Add the temporary style to the document head
    document.head.appendChild(tempStyle);

    // Wait longer for styles to apply and content to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Import html2canvas dynamically
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("receipt-content");
    if (!element) {
      throw new Error("Receipt content not found");
    }

    // Store original styles to restore later
    const originalStyles = {
      width: element.style.width,
      height: element.style.height,
      maxWidth: element.style.maxWidth,
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow,
      position: element.style.position,
      minHeight: element.style.minHeight,
    };

    // Temporarily modify the element for better capture
    element.style.width = "400px"; // Fixed width for consistent receipt format
    element.style.height = "auto";
    element.style.maxWidth = "none";
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
    element.style.position = "relative";
    element.style.minHeight = "auto";

    // Force multiple reflows to ensure accurate measurements
    element.offsetHeight;
    element.scrollHeight;

    // Wait a moment for layout to stabilize
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Additional step: manually replace any remaining oklch colors in computed styles
    const allElements = [element, ...element.querySelectorAll("*")];
    allElements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);

      // Check and replace color
      if (computedStyle.color && computedStyle.color.includes("oklch")) {
        el.style.color = "#374151"; // Default gray
      }

      // Check and replace background-color
      if (
        computedStyle.backgroundColor &&
        computedStyle.backgroundColor.includes("oklch")
      ) {
        el.style.backgroundColor = "transparent";
      }

      // Check and replace border-color
      if (
        computedStyle.borderColor &&
        computedStyle.borderColor.includes("oklch")
      ) {
        el.style.borderColor = "#e5e7eb"; // Default border gray
      }
    });

    // Get the actual dimensions after all modifications
    const actualHeight = Math.max(
      element.scrollHeight,
      element.offsetHeight,
      element.clientHeight
    );

    // Configure html2canvas options for better quality and full capture
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      width: 400, // Fixed width
      height: actualHeight + 50, // Add padding to ensure nothing is cut off
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable console logs
      removeContainer: true,
    });

    // Restore original styles
    Object.keys(originalStyles).forEach((key) => {
      element.style[key] = originalStyles[key];
    });

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error("Failed to generate image");
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        // Generate filename with customer name and date
        const customerName =
          sessionDetails.value?.full_name?.replace(/[^a-zA-Z0-9]/g, "_") ||
          "Receipt";
        const date = new Date().toISOString().split("T")[0];
        const filename = `${customerName}_Receipt_${date}.jpg`;

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);

        console.log(`Receipt saved as ${filename}`);
      },
      "image/jpeg",
      0.95
    ); // High quality JPEG
  } catch (error) {
    console.error("Error saving receipt:", error);
    // You could add a toast notification here if you have one available
  } finally {
    // Always remove the temporary style element
    const tempStyleElement = document.getElementById("temp-html2canvas-fix");
    if (tempStyleElement) {
      document.head.removeChild(tempStyleElement);
    }

    // Restore original styles in case of error
    const element = document.getElementById("receipt-content");
    if (element) {
      element.style.width = "";
      element.style.height = "";
      element.style.maxWidth = "";
      element.style.maxHeight = "";
      element.style.overflow = "";
      element.style.position = "";
      element.style.minHeight = "";
    }

    isSaving.value = false;
  }
};

// Expose the openModal method
defineExpose({
  openModal,
  closeModal,
});
</script>
