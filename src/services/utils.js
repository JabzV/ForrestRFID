import { nextTick } from "vue";


export const smartConvert = (v) => (isNaN(v) ? v : Number(v));
//converts string numbers to integers


//format date to "YYYY-MM-DD"
export function formatDate(dateString) {
  if (!dateString) return "";
  // Handles both "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS"
  return dateString.split(" ")[0];
}

export function formatDateToTime(dateString) {
  if (!dateString) return "";
  return dateString.split("T")[1].split(":").slice(0, 2).join(":"); // removes everything but time
}

export function formatDuration(duration) {
  if (!duration) return "";
  let durationList = duration.toString().split(".");
  if (durationList[0].length === 1) {
    durationList[0] = `0${durationList[0]}`;
  }
  return `${durationList[0]}hr ${durationList[1]}m`;
}

export function sentenceCase(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatToMMDDYY(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  // take last 2 digits of year
  const shortYear = year.slice(-2);

  return `${month}/${day}/${shortYear}`;
}



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
  
  