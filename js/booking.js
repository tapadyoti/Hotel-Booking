/* ============================================================
   — booking.js
   Form validation, price calc, Google Sheets submission
   ============================================================ */

/* ── Room Prices ──────────────────────────────────────────── */
const ROOM_PRICES = {
  'Double Room': 2000,
  'Deluxe Room': 3500,
  
};

const TAXES_RATE = 0; // 0% tax



// GOOGLE APPS SCRIPT DEPLOYMENT URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0u5P2K9s6XZgj7Y4M6HAQYMnzECpxButYa_B5-MYMIKW3NFLJRfTsclqzm_9Ws9pVkA/exec';

/* ── Form Fields ──────────────────────────────────────────── */
const fields = {
  name: { el: null, rules: ['required', 'minLength:3'] },
  mobile: { el: null, rules: ['required', 'phone'] },
  email: { el: null, rules: ['required', 'email'] },
  address: { el: null, rules: ['required'] },
  checkin: { el: null, rules: ['required', 'futureDate'] },
  checkout: { el: null, rules: ['required', 'afterCheckin'] },
  guests: { el: null, rules: ['required', 'min:1'] },
  roomType: { el: null, rules: ['required'] },
  bedType: { el: null, rules: ['required'] },
  payment: { el: null, rules: ['required'] },
};

/* ── Validation Rules ─────────────────────────────────────── */
const validators = {
  required: (val) => val.trim() !== '' || 'This field is required',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email address',
  phone: (val) => /^[\+]?[\d\s\-\(\)]{8,15}$/.test(val.trim()) || 'Enter a valid phone number',
  minLength: (val, len) => val.trim().length >= parseInt(len) || `Minimum ${len} characters required`,
  min: (val, min) => parseInt(val) >= parseInt(min) || `Minimum value is ${min}`,
  futureDate: (val) => {
    const d = new Date(val);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d >= today || 'Check-in date must be today or future';
  },
  afterCheckin: (val) => {
    const cin = document.getElementById('checkin')?.value;
    if (!cin) return true;
    return new Date(val) > new Date(cin) || 'Check-out must be after check-in';
  },
};

function validate(fieldId, value) {
  const config = fields[fieldId];
  if (!config) return true;
  for (const rule of config.rules) {
    const [name, param] = rule.split(':');
    const result = validators[name]?.(value, param);
    if (result !== true) return result;
  }
  return true;
}

function showError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (field) field.classList.add('error');
  if (error) { error.textContent = msg; error.classList.add('show'); }
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (field) field.classList.remove('error');
  if (error) error.classList.remove('show');
}

/* ── Price Calculator ─────────────────────────────────────── */
function calcPrice() {
  const roomType = document.getElementById('roomType')?.value;
  const checkin = document.getElementById('checkin')?.value;
  const checkout = document.getElementById('checkout')?.value;

  const pricePerNight = ROOM_PRICES[roomType] || 0;
  let nights = 0;

  if (checkin && checkout) {
    const diff = new Date(checkout) - new Date(checkin);
    nights = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  const subtotal = pricePerNight * nights;
  const taxes = subtotal * TAXES_RATE;
  const total = subtotal + taxes;

  // Update summary UI
  updateSummary({ roomType, pricePerNight, nights, subtotal, taxes, total, checkin, checkout });

  return { pricePerNight, nights, subtotal, taxes, total };
}

function updateSummary({ roomType, pricePerNight, nights, subtotal, taxes, total, checkin, checkout }) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('sum-room', roomType || '—');
  set('sum-checkin', checkin || '—');
  set('sum-checkout', checkout || '—');
  set('sum-nights', nights || '0');
  set('sum-rate', pricePerNight ? `₹${pricePerNight}` : '—');
  set('sum-subtotal', subtotal ? `₹${subtotal.toFixed(2)}` : '₹0.00');
  set('sum-tax', taxes ? `₹${taxes.toFixed(2)}` : '₹0.00');
  set('sum-total', total ? `₹${total.toFixed(2)}` : '₹0.00');
  set('sum-guests', document.getElementById('guests')?.value || '—');
}

/* ── Set Date Limits ──────────────────────────────────────── */
function setDateLimits() {
  const today = new Date().toISOString().split('T')[0];
  const checkinEl = document.getElementById('checkin');
  const checkoutEl = document.getElementById('checkout');

  if (checkinEl) {
    checkinEl.min = today;
    checkinEl.addEventListener('change', () => {
      if (checkoutEl) {
        checkoutEl.min = checkinEl.value;
        if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
          const next = new Date(checkinEl.value);
          next.setDate(next.getDate() + 1);
          checkoutEl.value = next.toISOString().split('T')[0];
        }
      }
      clearError('checkin');
      calcPrice();
    });
  }

  if (checkoutEl) {
    checkoutEl.addEventListener('change', () => { clearError('checkout'); calcPrice(); });
  }
}

/* ── Pre-fill from URL Params ─────────────────────────────── */
function prefillFromURL() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  const price = params.get('price');

  if (room) {
    const roomEl = document.getElementById('roomType');
    if (roomEl) {
      roomEl.value = room;
      calcPrice();
    }
  }
}

/* ── Submit to Google Sheets ──────────────────────────────── */
async function submitToSheets(data) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch (error) {
    console.error('Sheets submission error:', error);
    return { success: false, error: error.message };
  }
}

/* ── Success Modal ────────────────────────────────────────── */
function showSuccessModal(data) {
  const modal = document.getElementById('success-modal');
  if (!modal) return;

  document.getElementById('modal-name').textContent = data.name;
  document.getElementById('modal-room').textContent = data.roomType;
  document.getElementById('modal-total').textContent = `$${data.totalPrice}`;
  document.getElementById('modal-checkin').textContent = data.checkin;
  document.getElementById('modal-checkout').textContent = data.checkout;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Form Submission ──────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('booking-form');
  let isValid = true;

  // Validate all fields
  const formData = {};
  for (const [id, config] of Object.entries(fields)) {
    const el = document.getElementById(id);
    const value = el?.value || '';
    formData[id] = value;
    const result = validate(id, value);
    if (result !== true) {
      showError(id, result);
      isValid = false;
    } else {
      clearError(id);
    }
  }

  // Check T&C
  const tnc = document.getElementById('terms');
  if (!tnc?.checked) {
    showError('terms', 'You must accept the terms and conditions');
    isValid = false;
  } else {
    clearError('terms');
  }

  if (!isValid) {
    // Scroll to first error
    const firstError = form.querySelector('.form-input.error, .form-select.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Calculate final price
  const { total } = calcPrice();

  // Prepare data
  const bookingData = {
    bookingDate: new Date().toLocaleDateString('en-IN'),
    name: formData.name,
    mobile: formData.mobile,
    email: formData.email,
    address: formData.address,
    checkin: formData.checkin,
    checkout: formData.checkout,
    roomType: formData.roomType,
    bedType: formData.bedType,
    guests: formData.guests,
    totalPrice: total.toFixed(2),
    payment: formData.payment,
    specialRequest: document.getElementById('special')?.value || '',
  };

  // Show loading state
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Processing...</span>';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  // Submit to Google Sheets
  await submitToSheets(bookingData);

  // Show success regardless (no-cors mode doesn't return body)
  submitBtn.innerHTML = originalText;
  submitBtn.disabled = false;
  submitBtn.style.opacity = '1';

  showSuccessModal(bookingData);
  form.reset();
  calcPrice();
}

/* ── Real-time validation ─────────────────────────────────── */
function initRealtimeValidation() {
  for (const id of Object.keys(fields)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('input', () => {
      const result = validate(id, el.value);
      if (result !== true) showError(id, result);
      else clearError(id);
      if (id === 'roomType') calcPrice();
    });
    el.addEventListener('change', () => {
      const result = validate(id, el.value);
      if (result !== true) showError(id, result);
      else clearError(id);
      if (id === 'roomType' || id === 'checkin' || id === 'checkout') calcPrice();
    });
  }
}

/* ── Step Progress Indicator ──────────────────────────────── */
function updateStepIndicator() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  
  const sections = form.querySelectorAll('[data-step]');
  const steps = document.querySelectorAll('.step');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepNum = parseInt(entry.target.dataset.step);
        steps.forEach((step, i) => {
          step.classList.remove('active', 'done');
          if (i + 1 === stepNum) step.classList.add('active');
          else if (i + 1 < stepNum) step.classList.add('done');
        });
      }
    });
  }, { threshold: 0.5 });
  
  sections.forEach(s => observer.observe(s));
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setDateLimits();
  prefillFromURL();
  initRealtimeValidation();
  updateStepIndicator();
  calcPrice();

  // Close modal handlers
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('success-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Form submit
  document.getElementById('booking-form')?.addEventListener('submit', handleSubmit);

  // Guests change → update summary
  document.getElementById('guests')?.addEventListener('change', calcPrice);
});