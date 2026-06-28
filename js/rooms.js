/* ============================================================
    rooms.js
   Rooms page: data, filtering, room cards
   ============================================================ */

const roomsData = [
  // {
  //   id: 1,
  //   type: 'single',
  //   name: 'Classic Single',
  //   category: 'Single Room',
  //   price: 150,
  //   oldPrice: 200,
  //   rating: 4.5,
  //   reviews: 128,
  //   availability: 'available',
  //   size: '28 m²',
  //   maxGuests: 1,
  //   bedType: 'Single Bed',
  //   description: 'A refined retreat for solo travellers. Thoughtfully appointed with premium linens, a writing desk, and a marble en-suite bathroom.',
  //   images: [
  //     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  //     'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
  //     'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  //   ],
  //   amenities: ['WiFi','Balcony', 'Self Cooking'],
  // },
  {
    id: 2,
    type: 'double',
    name: 'Superior Double',
    category: 'Double Room',
    price: 2000,
    oldPrice: 2500,
    rating: 4.7,
    reviews: 60,
    availability: 'available',
    view: 'Scenic View',
    maxGuests: 4,
    bedType: 'King Bed',
    description: 'A comfortable and well-appointed room, perfect for couples or two guests seeking a relaxing stay.',
    images: [
      './images/Double.jpeg',
     './images/img1.jpeg',
     './images/img3.jpeg'
    ],
    amenities: ['WiFi','Balcony', 'Self Cooking'],
  },
  {
    id: 3,
    type: 'deluxe',
    name: 'Grand Deluxe',
    category: 'Deluxe Room',
    price: 3500,
    oldPrice: 4000,
    rating: 4.9,
    reviews: 16,
    availability: 'limited',
    view: 'Scenic View',
    maxGuests: 6,
    bedType: 'King Bed',
    description: 'A spacious room featuring enhanced comfort and modern amenities for a more enjoyable stay.',
    images: [
      './images/Deluxe.jpg',
     './images/hall.jpg',
     './images/img6.jpeg'
    ],
    amenities: ['WiFi', 'Balcony', 'Self Cooking'],
  },
  // {
  //   id: 4,
  //   type: 'family',
  //   name: 'Family Suite',
  //   category: 'Family Room',
  //   price: 380,
  //   oldPrice: 480,
  //   rating: 4.8,
  //   reviews: 175,
  //   availability: 'available',
  //   size: '72 m²',
  //   maxGuests: 5,
  //   bedType: 'King + Twin Beds',
  //   description: 'Designed for families who demand the best. Featuring two bedrooms, a children\'s play corner, a spacious lounge, and a private terrace.',
  //   images: [
  //     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
  //     'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?w=800&q=80',
  //     'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  //   ],
  //   amenities: ['WiFi', 'AC', 'Smart TV', 'Kitchenette', 'Play Area', '2 Bathrooms', 'Dining Table', 'Terrace'],
  // },
];

/* ── Render Stars ─────────────────────────────────────────── */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '★';
  if (half) html += '½';
  return `<span class="stars" aria-label="${rating} stars">${html}</span>`;
}

/* ── Availability Badge ───────────────────────────────────── */
function getAvailBadge(avail) {
  const map = {
    available: ['badge-available', 'Available'],
    limited: ['badge-limited', 'Limited'],
    booked: ['badge-booked', 'Fully Booked'],
  };
  const [cls, label] = map[avail] || map.available;
  return `<span class="room-badge ${cls}">${label}</span>`;
}

/* ── Amenity Icons ────────────────────────────────────────── */
const amenityIcons = {
  'WiFi': '📶',  'Smart TV': '📺', 
  'Safe': '🔒', 'Balcony': '🌅', 
  'Living Area': '🛋️', 'Self Cooking': '🍳',
   '2 Bathrooms': '🚿',
  'Terrace': '🌿',
};

/* ── Render Room Card ─────────────────────────────────────── */
function renderRoomCard(room) {
  const amenitiesHtml = room.amenities.slice(0, 6).map(a =>
    `<span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" 
      style="background:rgba(201,169,110,0.1);color:var(--gold);border:1px solid rgba(201,169,110,0.2)">
      ${amenityIcons[a] || '✓'} ${a}
    </span>`
  ).join('');

  const discount = Math.round((1 - room.price / room.oldPrice) * 100);

  return `
  <article class="room-card reveal" data-type="${room.type}">
    <!-- Image Slider -->
    <div class="slider-container" style="height:260px">
      <div class="slider-track">
        ${room.images.map(src => `
          <div class="slide">
            <img src="${src}" alt="${room.name}" loading="lazy">
          </div>`).join('')}
      </div>
      ${getAvailBadge(room.availability)}
      <span class="room-badge" style="left:auto;right:1rem;background:rgba(0,0,0,0.6);color:var(--gold);font-size:0.6rem">
        -${discount}% OFF
      </span>
      <button class="slider-btn slider-prev" aria-label="Previous">‹</button>
      <button class="slider-btn slider-next" aria-label="Next">›</button>
      <div class="slider-dots"></div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <div class="flex justify-between items-start mb-2">
        <div>
          <p class="text-xs tracking-widest uppercase mb-1" style="color:var(--gold)">${room.category}</p>
          <h3 class="text-xl font-display" style="font-family:var(--font-display);color:var(--text-primary)">${room.name}</h3>
        </div>
        <div class="text-right">
          <div class="room-price"><sup>₹</sup>${room.price}<span>/night</span></div>
          <div class="text-xs line-through mt-0.5" style="color:var(--text-secondary)">₹${room.oldPrice}</div>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-3">
        ${renderStars(room.rating)}
        <span class="text-xs" style="color:var(--text-secondary)">${room.rating} (${room.reviews} reviews)</span>
      </div>

      <p class="text-sm mb-4" style="color:var(--text-secondary);line-height:1.7">${room.description}</p>

      <div class="flex gap-3 text-xs mb-4" style="color:var(--text-secondary)">
        <span>🌿 ${room.view}</span>
        <span>👥 Max ${room.maxGuests}</span>
        <span>🛏 ${room.bedType}</span>
      </div>

      <div class="flex flex-wrap gap-2 mb-5">${amenitiesHtml}</div>

      <a href="booking.html?room=${encodeURIComponent(room.category)}&price=${room.price}" 
        class="btn-gold w-full text-center block"><span>Book This Room</span></a>
    </div>
  </article>`;
}

/* ── Filter Logic ─────────────────────────────────────────── */
function initRoomsPage() {
  const grid = document.getElementById('rooms-grid');
  if (!grid) return;

  function renderRooms(filter = 'all') {
    const filtered = filter === 'all' ? roomsData : roomsData.filter(r => r.type === filter);
    grid.innerHTML = filtered.map(renderRoomCard).join('');
    // Re-init sliders and scroll reveal for new cards
    if (typeof Slider !== 'undefined') Slider.init('.room-card .slider-container');
    if (typeof ScrollReveal !== 'undefined') ScrollReveal.init();
  }

  renderRooms();

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(10px)';
      setTimeout(() => {
        renderRooms(tab.dataset.filter);
        grid.style.transition = 'opacity 0.4s, transform 0.4s';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 200);
    });
  });

  // Pre-select from URL param
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');
  if (typeParam) {
    const tab = document.querySelector(`.filter-tab[data-filter="${typeParam}"]`);
    if (tab) tab.click();
  }
}

document.addEventListener('DOMContentLoaded', initRoomsPage);