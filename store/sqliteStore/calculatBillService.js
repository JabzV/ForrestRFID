import db from '../../database.js';

function getPromos() {
  try {
    const data = db.prepare('SELECT * FROM promos').all();
    return data;
  } catch (error) {
    console.error('Error fetching promos:', error);
    return [];
  }
}

function getSessionConfig() {
  try {
    const data = db.prepare('SELECT * FROM session_config LIMIT 1').all();
    return data;
  } catch (error) {
    console.error('Error fetching session config:', error);
    return [{
      grace_period: 0,
      minimum_billable_session: 0,
      time_rounding: 0,
      enable_promos: false
    }];
  }
}

function filterApplicablePromos(time_in_date, promos) {
    const time_in = new Date(time_in_date);
    return promos.filter(promo => {
        const promo_date_from = new Date(promo.date_from);
        const promo_date_to = new Date(promo.date_to);
        return time_in >= promo_date_from && time_in <= promo_date_to;
    });
}

export const calculateBillSync = (session) => {
  const sessionConfig = getSessionConfig();

  const grace_period = sessionConfig[0].grace_period;
  const minimum_billable_session = sessionConfig[0].minimum_billable_session;
  const time_rounding = sessionConfig[0].time_rounding;
  const enable_promos = sessionConfig[0].enable_promos;

  let billableSession = Math.max(session.elapsed - (grace_period * 60), 0);

  if (billableSession < (minimum_billable_session * 60)) {
    return [{currentBill: 0, billableSession: 0}];
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
    const promos = getPromos();
    const applicable_promos = filterApplicablePromos(session.time_in, promos);
    if (applicable_promos.length > 0) {
      discount = applicable_promos.reduce((acc, promo) => acc + promo.value, discount);
    }
  }

  if (discount > 0) {
    currentBill = currentBill - (currentBill * (discount / 100)).toFixed(2);
  }

  return [{currentBill: currentBill, billableSession: (billableSession/3600).toFixed(2)}];
};