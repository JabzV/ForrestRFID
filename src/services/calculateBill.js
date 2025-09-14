import { ipcHandle } from "../../ipc/ipcHandler.js";

async function getPromos() {
  const data = await ipcHandle("getPromos");
  return data;
};

async function getSessionConfig() {
  const data = await ipcHandle("getSessionConfig");
  return data;
};

function filterApplicablePromos(time_in_date, promos) {
    const time_in = new Date(time_in_date);
    return promos.filter(promo => {
        const promo_date_from = new Date(promo.date_from);
        const promo_date_to = new Date(promo.date_to);
        return time_in >= promo_date_from && time_in <= promo_date_to;
    });
}

export const calculateDuration = (time_in) => {
    const now = new Date();
    const timeIn = new Date(time_in);
    const elapsed = Math.round((now - timeIn) / 1000);
  
    return elapsed;
  };

export const calculateBill = async (session) => {
  const sessionConfig = await getSessionConfig();

  const grace_period = sessionConfig[0].grace_period;
  const minimum_billable_session = sessionConfig[0].minimum_billable_session;
  const time_rounding = sessionConfig[0].time_rounding;
  const enable_promos = sessionConfig[0].enable_promos;

  let billableSession = Math.max(session.elapsed - grace_period * 60, 0);

  if (billableSession < (minimum_billable_session * 60)) {
    return 0;
  }

  if (time_rounding > 0) {
    const billableSessionMinutes = Math.round((billableSession / 60) / time_rounding) * time_rounding;
    billableSession = billableSessionMinutes * 60;
  }
  
  //Calculation
  let currentBill = 0;
  if (session.rate_unit === 'hr') {
    currentBill = ((billableSession / 3600) * session.rate_amount).toFixed(2);
  } else if (session.rate_unit === 'day') {
    currentBill = (Math.ceil(billableSession / 86400) * session.rate_amount).toFixed(2);
  }

  //Apply Discount
  let discount = 0;
  if (session.benefits_type === 'percentage') {
    discount = session.value;
  } else if (session.benefits_type === 'fixed') {
    currentBill = currentBill - session.value;
  }

  //Apply Promos (add discount to calc total discount)
  if (enable_promos) {
    const promos = await getPromos();
    const applicable_promos = filterApplicablePromos(session.time_in, promos);
    if (applicable_promos.length > 0) {
      discount = applicable_promos.reduce((acc, promo) => acc + promo.value, discount);
    }
  }

  if (discount > 0) {
    currentBill = (currentBill * (discount / 100)).toFixed(2);
  }

  console.log(currentBill);

  return currentBill;
};
