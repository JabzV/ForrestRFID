import { nextTick } from "vue";


export const smartConvert = (v) => (isNaN(v) ? v : Number(v));
//converts string numbers to integers


export async function rfidScanner(inputId, charLength = 10) {
    await nextTick();
  
    return new Promise((resolve, reject) => {
      const rfidInput = document.getElementById(inputId);
      if (!rfidInput) {
        reject("Input ID not found");
        return;
      }
  
      rfidInput.focus();
      let timer = null;
  
      const onInput = (e) => {
        const value = e.target.value;
  
        // 🚨 If last typed character is not a digit → reject immediately
        if (!/^\d*$/.test(value)) {
          cleanup();
          reject("Avoid typing during scan. Please scan again.");
          return;
        }
  
        // Clear previous timer and start a new one
        if (timer) clearTimeout(timer);
  
        timer = setTimeout(() => {
          if (value.length === charLength) {
            cleanup();
            resolve(value);
          } else {
            cleanup();
            
            reject("Avoid typing during scan. Please scan again.");
          }
        }, 300); // shorter 2s wait, you can adjust
      };
  
      const cleanup = () => {
        console.log("Cleaning up RFID scanner");
        document.getElementById(inputId).blur();
        if (timer) clearTimeout(timer);
        rfidInput.removeEventListener("input", onInput);
        console.log("Cleaned up RFID scanner");
      };
  
      rfidInput.addEventListener("input", onInput);
    });
  }
  
  