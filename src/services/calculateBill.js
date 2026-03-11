import { ipcHandle } from "../../ipc/ipcHandler.js";

async function getPromos() {
  const data = await ipcHandle("getPromos");
  return data;
};

async function getSessionConfig() {
  const data = await ipcHandle("getSessionConfig");
  return data;
};

const RATE_UNIT_SECONDS = {
  hr: 3600,
  day: 86400,
  week: 7 * 86400,
  month: 30 * 86400
};

function getRateUnitSeconds(rateUnit) {
  return RATE_UNIT_SECONDS[rateUnit] || 0;
}

function calculateBaseAmount(billableSeconds, rateAmount, rateUnit, rateValue) {
  const amount = Number(rateAmount) || 0;
  if (amount <= 0) {
    return 0;
  }

  const unitSeconds = getRateUnitSeconds(rateUnit);
  const value = Math.max(1, Number(rateValue) || 1);
  if (unitSeconds <= 0) {
    return 0;
  }

  if (rateUnit === 'hr' && value === 1) {
    return (billableSeconds / 3600) * amount;
  }

  return Math.ceil(billableSeconds / (unitSeconds * value)) * amount;
}

function calculateSurcharge(billableSeconds, session) {
  const surchargeAmount = Number(session.surcharge_amount) || 0;
  const surchargeMinutes = Number(session.surcharge_minutes) || 0;

  if (surchargeAmount <= 0 || surchargeMinutes <= 0) {
    return 0;
  }

  const unitSeconds = getRateUnitSeconds(session.rate_unit);
  const value = Math.max(1, Number(session.rate_value) || 1);
  if (unitSeconds <= 0) {
    return 0;
  }

  const baseUnitSeconds = unitSeconds * value;
  if (billableSeconds <= baseUnitSeconds) {
    return 0;
  }

  const extraSeconds = billableSeconds - baseUnitSeconds;
  const intervalSeconds = surchargeMinutes * 60;
  const surchargeCount = Math.ceil(extraSeconds / intervalSeconds);
  return surchargeCount * surchargeAmount;
}

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
  const chargeImmediately = Number(session.charge_immediately) === 1;

  if (time_rounding > 0) {
    const billableSessionMinutes = Math.ceil((billableSession / 60) / time_rounding) * time_rounding;
    billableSession = billableSessionMinutes * 60;
  }
  
  if (!chargeImmediately && billableSession < (minimum_billable_session * 60)) {
    return 0;
  }
  
  //Calculation (keep numeric until final rounding)
  let currentBill = 0;
  if (chargeImmediately) {
    currentBill = Number(session.rate_amount) || 0;
  } else {
    currentBill = calculateBaseAmount(
      billableSession,
      session.rate_amount,
      session.rate_unit,
      session.rate_value
    );
    currentBill += calculateSurcharge(billableSession, session);
  }

  //Apply Discount
  let totalDiscountPercentage = 0;
  let fixedDiscountAmount = 0;
  if (session.benefits_type === 'percentage') {
    totalDiscountPercentage = Number(session.value) || 0;
  } else if (session.benefits_type === 'fixed') {
    fixedDiscountAmount = Number(session.value) || 0;
  }

  //Apply Promos (add discount to calc total discount)
  if (enable_promos) {
    const promos = await getPromos();
    const applicable_promos = filterApplicablePromos(session.time_in, promos);
    if (applicable_promos.length > 0) {
      totalDiscountPercentage = applicable_promos.reduce((acc, promo) => acc + (Number(promo.value) || 0), totalDiscountPercentage);
    }
  }

  // Clamp after fixed discount and cap total percent at 100
  const amountAfterFixed = Math.max(0, currentBill - fixedDiscountAmount);
  const cappedPercent = Math.min(100, Math.max(0, totalDiscountPercentage));
  const amountAfterPercent = amountAfterFixed * (1 - (cappedPercent / 100));

  const finalAmount = Number(amountAfterPercent.toFixed(2));
  return finalAmount;
};

