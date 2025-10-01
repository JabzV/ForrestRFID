import { nextTick } from "vue";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const smartConvert = (v) => (isNaN(v) ? v : Number(v));
//converts string numbers to integers

// Singapore timezone utilities using dayjs
export const now = () => dayjs().tz('Asia/Singapore').format('YYYY-MM-DDTHH:mm:ss');
export const nowISO = () => dayjs().tz('Asia/Singapore').toISOString();
export const formatSingaporeDate = (date) => dayjs(date).tz('Asia/Singapore').format('YYYY-MM-DD');
export const formatSingaporeTime = (date) => dayjs(date).tz('Asia/Singapore').format('HH:mm');
export const formatSingaporeDateTime = (date) => dayjs(date).tz('Asia/Singapore').format('YYYY-MM-DDTHH:mm:ss');


//format date to "YYYY-MM-DD"
export function formatDate(dateString) {
  if (!dateString) return "";
  return dayjs(dateString).tz('Asia/Singapore').format('YYYY-MM-DD');
}

export function formatDateToTime(dateString) {
  if (!dateString) return "";
  return dayjs(dateString).tz('Asia/Singapore').format('HH:mm');
}

export function formatDuration(duration) {
  if (!duration) return "";
  let durationList = duration.toString().split(".");
  if (durationList[0].length === 1) {
    durationList[0] = `0${durationList[0]}`;
  }
  let durationMinutes = Number(`.${durationList[1] || 0}`) * 60;
  durationMinutes = Math.round(durationMinutes).toString();
  if (durationMinutes.length === 1) {
    durationMinutes = `0${durationMinutes}`;
  }
  return `${durationList[0]}hr ${durationMinutes}m`;
}

export function sentenceCase(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatToMMDDYY(dateString) {
  if (!dateString) return "";
  return dayjs(dateString).tz('Asia/Singapore').format('MM/DD/YY');
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
  
  