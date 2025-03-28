
<template>
  <div class="year-calendar">
    <div class="calendar-header">
      <button class="nav-button" @click="prevMonth">
        <i class="ti ti-chevron-left"></i>
      </button>
      <div class="month-year">{{ currentMonthName }} {{ currentYear }}</div>
      <button class="nav-button" @click="nextMonth">
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>

    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <div class="days-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date"
        class="day-cell"
        :class="{
          empty: !day.inMonth,
          today: day.isToday,
          selected: isSelected(day.date),
        }"
        @click="day.inMonth && selectDay(day.date)"
      >
        <div v-if="day.inMonth" class="day-number">{{ day.dayOfMonth }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits(["update:selectedDate"]);

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const today = ref(new Date());

// Format today to remove time component
today.value.setHours(0, 0, 0, 0);

const weekdays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

const currentMonthName = computed(() => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[currentMonth.value];
});

const calendarDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Add days from previous month to fill the first row
  const prevMonthLastDay = new Date(
    currentYear.value,
    currentMonth.value,
    0,
  ).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = new Date(
      currentYear.value,
      currentMonth.value - 1,
      prevMonthLastDay - i,
    );
    days.push({
      date: date,
      dayOfMonth: prevMonthLastDay - i,
      inMonth: false,
      isToday: isSameDay(date, today.value),
    });
  }

  // Add days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date: date,
      dayOfMonth: i,
      inMonth: true,
      isToday: isSameDay(date, today.value),
    });
  }

  // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date: date,
      dayOfMonth: i,
      inMonth: false,
      isToday: isSameDay(date, today.value),
    });
  }

  return days;
});

function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isSelected(date) {
  if (!props.selectedDate) return false;
  return isSameDay(date, props.selectedDate);
}

function selectDay(date) {
  emit("update:selectedDate", date);
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

// Initialize to the month of the selected date
onMounted(() => {
  if (props.selectedDate) {
    currentMonth.value = props.selectedDate.getMonth();
    currentYear.value = props.selectedDate.getFullYear();
  }
});
</script>

<style scoped>
.year-calendar {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #a5b5a6;
  padding: 15px;
  font-family: "Inter", sans-serif;
  max-width: 400px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.month-year {
  font-weight: 600;
  font-size: 18px;
  color: #1f2937;
}

.nav-button {
  background-color: #f0f2f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #a5b5a6;
}

.nav-button:hover {
  background-color: #e0e0e0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  color: #666;
  padding: 5px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}

.day-cell:not(.empty):hover {
  background-color: #f0f2f0;
}

.day-number {
  font-size: 14px;
  color: #181818;
}

.empty {
  color: #ccc;
  cursor: default;
}

.today {
  background-color: #f0f2f0;
  font-weight: 600;
}

.selected {
  background-color: #a5b5a6;
  color: white;
}

.selected .day-number {
  font-weight: 600;
}

@media (max-width: 640px) {
  .year-calendar {
    max-width: 100%;
  }

  .day-cell {
    font-size: 12px;
  }
}
</style>
