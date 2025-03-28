<template>
  <div class="deixa-container">
    <div class="header">
      <div class="logo" @dblclick="toggleImageManager">DEIXA</div>
      <div class="categories">
        <div class="category-button">Futbol</div>
        <div class="category-button">Basquet</div>
        <div class="category-button">Tenis</div>
        <div class="category-button">e-Sports</div>
      </div>
    </div>

    <!-- Simple Image Manager (hidden by default, shown when toggled) -->
    <SimpleImageManager
      v-if="showImageManager"
      @close="showImageManager = false"
      @imagesUpdated="handleImagesUpdated"
    />

    <div class="date-navigation" v-if="!showFullCalendar">
      <button class="nav-button prev-button" @click="navigateToPreviousDay">
        <i class="ti ti-chevron-left"></i>
      </button>

      <div class="date-selector">
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="date-card"
          :class="{ selected: isSelectedDay(day.date) }"
          @click="selectDate(day.date)"
        >
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-number">{{ day.dayNumber }}</div>
          <div class="month">{{ day.month }}</div>
        </div>
        <div class="date-card calendar-toggle" @click="showFullCalendar = true">
          <i class="ti ti-calendar"></i>
          <div class="day-name">Ver</div>
          <div class="day-number">Más</div>
        </div>
      </div>

      <button class="nav-button next-button" @click="navigateToNextDay">
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>

    <div v-else class="full-calendar-container">
      <YearCalendar v-model:selectedDate="selectedDate" />
      <button class="close-calendar" @click="showFullCalendar = false">
        <i class="ti ti-x"></i> Cerrar Calendario
      </button>
    </div>

    <div class="daily-image-container" v-if="selectedDate">
      <div class="daily-image" v-if="hasImageForDate(selectedDate)">
        <img :src="getDailyImageUrl(selectedDate)" alt="Imagen del día" />
      </div>
      <div class="loading-container" v-else>
        <div class="loading-message">Todavia analizando</div>
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-logo">DEIXA</div>
        <div class="footer-links">
          <a href="#" class="footer-link">Términos y Condiciones</a>
          <a href="#" class="footer-link">Política de Privacidad</a>
          <a href="#" class="footer-link">Contacto</a>
        </div>
        <div class="footer-copyright">
          © {{ new Date().getFullYear() }} deixa.bet - Todos los derechos
          reservados
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import YearCalendar from "./YearCalendar.vue";
import SimpleImageManager from "./SimpleImageManager.vue";

// State for image manager
const showImageManager = ref(false);

// State for date selection
const selectedDate = ref(new Date());
const showFullCalendar = ref(false);

// Custom images
const customImages = ref({});

// Generate 5 days for the quick date selector with current day in the middle
const weekDays = computed(() => {
  const days = [];
  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show 2 days before today, today, and 2 days after today
  for (let i = -2; i <= 2; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    days.push({
      date: date,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
    });
  }

  return days;
});

// Check if a day is selected
function isSelectedDay(date) {
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  );
}

// Select a date
function selectDate(date) {
  selectedDate.value = date;
}

// Format date for display
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format date for image lookup (YYYY-MM-DD)
function formatDateForKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Daily images mapping - Add your images here
 *
 * To add a new image for a specific date:
 * 1. Add a new entry with the date in 'YYYY-MM-DD' format as the key
 * 2. Set the value to the path of your image file
 *
 * Example:
 * "2023-12-25": "/images/christmas.jpg",
 * "2024-01-01": "/images/new-year.jpg"
 */
const dailyImages = {
  // Add your images for specific dates here
  // The current day's image has been deleted as requested
  // Examples for other dates (commented out)
  //"2025-03-09": "public/images/bet-image1.png",
  //"2025-03-10": "public/images/bet-image2.png",
  //"2025-03-14": "public/images/bet-image3.png",
  //"2025-03-11": "public/images/bet-image3.png",
  // "2025-03-12": "/images/bet-image4.jpg",
  // "2025-03-13": "/images/bet-image5.jpg",
  "2025-03-25": "/images/bet-image0.png",
  "2025-03-29": "/images/bet-image1.png",

  // Add more dates and image paths as needed
  // Format: "YYYY-MM-DD": "/path/to/your/image.jpg",
};

/**
 * Check if there's an image available for the given date
 */
function hasImageForDate(date) {
  const dateKey = formatDateForKey(date);

  // Check if we have a locally defined image for this date
  if (dailyImages[dateKey]) {
    return true;
  }

  // Check if we have a user-uploaded image from localStorage
  if (customImages.value[dateKey]) {
    return true;
  }

  // No image available for this date
  return false;
}

/**
 * Get the image URL for the selected date
 * This function prioritizes:
 * 1. Images defined in the dailyImages object above
 * 2. Images uploaded through the UI (stored in localStorage)
 * 3. Fallback to a placeholder image
 */
function getDailyImageUrl(date) {
  const dateKey = formatDateForKey(date);

  // Check if we have a locally defined image for this date
  if (dailyImages[dateKey]) {
    return dailyImages[dateKey];
  }

  // Check if we have a user-uploaded image from localStorage
  if (customImages.value[dateKey]) {
    return customImages.value[dateKey].image;
  }

  // Fallback to a placeholder image
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Generate a color based on the day of the year
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
  );
  const hue = dayOfYear % 360;

  return `https://via.placeholder.com/400x200/${hue.toString(16).padStart(2, "0")}8080/FFFFFF?text=Imagen+del+dia+${day}/${month}/${year}`;
}

// Toggle image manager
function toggleImageManager() {
  showImageManager.value = !showImageManager.value;
}

// Handle images updated
function handleImagesUpdated(images) {
  customImages.value = images;
}

// Navigate to previous day
function navigateToPreviousDay() {
  const prevDate = new Date(selectedDate.value);
  prevDate.setDate(prevDate.getDate() - 1);
  selectDate(prevDate);
}

// Navigate to next day
function navigateToNextDay() {
  const nextDate = new Date(selectedDate.value);
  nextDate.setDate(nextDate.getDate() + 1);
  selectDate(nextDate);
}

// Initialize
onMounted(() => {
  // Set today's date
  selectedDate.value = new Date();

  // Ensure today is selected in the date selector
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectDate(today);

  // Load custom images from localStorage
  const savedImagesData = localStorage.getItem("deixa_daily_images");
  if (savedImagesData) {
    try {
      customImages.value = JSON.parse(savedImagesData);

      // Delete current day's image as requested
      const todayKey = formatDateForKey(today);
      if (customImages.value[todayKey]) {
        delete customImages.value[todayKey];
        // Update localStorage without the current day's image
        localStorage.setItem(
          "deixa_daily_images",
          JSON.stringify(customImages.value),
        );
        console.log("Current day image has been deleted");
      }
    } catch (e) {
      console.error("Error loading saved images:", e);
    }
  }
});
</script>

<style scoped>
.deixa-container {
  background-color: #f0f2f0;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
}

.logo {
  color: #a5b5a6;
  font-family: "Inter", sans-serif;
  font-size: 48px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.categories {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-button {
  background-color: #a5b5a6;
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-button:hover {
  background-color: #94a395;
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
}

.nav-button {
  background-color: #a5b5a6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #94a395;
}

.date-selector {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.date-card {
  background-color: #ffffff;
  padding: 15px;
  text-align: center;
  width: 100px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.date-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #a5b5a6;
}

.date-card.selected {
  background-color: #a5b5a6;
  border-color: #94a395;
  box-shadow: 0 4px 8px rgba(165, 181, 166, 0.3);
}

.date-card.selected .day-name,
.date-card.selected .month {
  color: white;
}

.date-card.selected .day-number {
  color: white;
}

.calendar-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.calendar-toggle i {
  font-size: 24px;
  color: #a5b5a6;
  margin-bottom: 5px;
}

.day-name {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  margin-bottom: 5px;
  font-weight: 500;
  color: #1f2937;
}

.day-number {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #a5b5a6;
}

.month {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.full-calendar-container {
  margin-bottom: 40px;
}

.close-calendar {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #a5b5a6;
  color: white;
  border: none;
  border-radius: 20px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  cursor: pointer;
}

.daily-image-container {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  text-align: center; /* Centers the content inside the container */
}

.daily-image {
  width: auto;
  height: auto;
  display: inline-block; /* Ensures it's inline to center it */
}

.daily-image img {
  width: 80%; /* Adjust to make the image smaller */
  height: auto; /* Maintain aspect ratio */
  margin: 0 auto; /* Center the image */
  display: block; /* Ensure the image is block level for centering */
}


.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #f8f8f8;
  min-height: 300px;
}

.loading-message {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 20px;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  background-color: #a5b5a6;
  border-radius: 50%;
  display: inline-block;
  animation: dotPulse 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.site-footer {
  margin-top: auto;
  background-color: #1f2937;
  color: white;
  padding: 30px 20px;
  border-radius: 12px;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.footer-logo {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: white;
  text-decoration: none;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #a5b5a6;
}

.footer-copyright {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: #a0aec0;
  text-align: center;
}

/* Responsive styles */

@media (max-width: 768px) {
  .deixa-container {
    padding: 15px;
  }

  .logo {
    font-size: 36px;
  }

  .domain-text {
    font-size: 14px;
  }

  .category-button {
    padding: 6px 16px;
    font-size: 12px;
  }

  .date-card {
    width: 80px;
    padding: 10px;
  }

  .day-number {
    font-size: 20px;
  }

  .daily-image-header h3 {
    font-size: 16px;
  }

  .footer-links {
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .deixa-container {
    padding: 10px;
  }

  .header {
    margin-bottom: 20px;
    gap: 15px;
  }

  .logo {
    font-size: 32px;
  }

  .categories {
    gap: 10px;
  }

  .category-button {
    padding: 5px 12px;
    font-size: 11px;
  }

  .date-selector {
    gap: 10px;
    margin-bottom: 20px;
  }

  .date-card {
    width: 70px;
    padding: 8px;
  }

  .day-name {
    font-size: 12px;
  }

  .day-number {
    font-size: 18px;
  }

  .month {
    font-size: 10px;
  }

  .daily-image-container {
    margin-bottom: 20px;
  }

  .daily-image-header {
    padding: 10px;
  }

  .daily-image-header h3 {
    font-size: 14px;
  }

  .card-header,
  .card-content,
  .card-footer {
    padding: 10px;
  }

  .bet-selection {
    font-size: 14px;
  }

  .bet-type,
  .bet-match,
  .bet-time {
    font-size: 11px;
  }

  .action-button {
    font-size: 11px;
    padding: 6px;
  }

  .footer-logo {
    font-size: 20px;
  }

  .footer-link {
    font-size: 12px;
  }

  .footer-copyright {
    font-size: 10px;
  }
}
</style>
