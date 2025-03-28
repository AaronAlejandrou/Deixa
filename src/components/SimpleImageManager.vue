<template>
  <div class="simple-image-manager">
    <div class="manager-header">
      <h3>Imágenes Diarias</h3>
      <button class="close-button" @click="$emit('close')">
        <i class="ti ti-x"></i>
      </button>
    </div>

    <div class="date-selector">
      <input
        type="date"
        v-model="selectedDateString"
        :min="minDate"
        :max="maxDate"
      />
    </div>

    <div class="image-upload">
      <div class="upload-preview" v-if="imagePreview">
        <img :src="imagePreview" alt="Vista previa" />
        <button class="remove-image" @click="removeImage">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="upload-placeholder" v-else>
        <div class="upload-instructions">
          <i class="ti ti-upload"></i>
          <span>Arrastra y suelta una imagen aquí o</span>
          <button class="browse-button" @click="triggerFileInput">
            Seleccionar desde tu dispositivo
          </button>
          <span class="file-types">Formatos: JPG, PNG, GIF</span>
        </div>
      </div>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept="image/*"
        style="display: none"
      />
    </div>

    <div class="action-buttons">
      <button class="save-button" @click="saveImage" :disabled="!imagePreview">
        Guardar
      </button>
    </div>

    <div class="saved-images" v-if="hasSavedImages">
      <h4>Imágenes guardadas</h4>
      <div class="image-list">
        <div
          v-for="(image, date) in savedImages"
          :key="date"
          class="saved-image-item"
        >
          <div class="saved-image-date">{{ formatDisplayDate(date) }}</div>
          <div class="saved-image-actions">
            <button class="edit-button" @click="editImage(date)">
              <i class="ti ti-edit"></i>
            </button>
            <button class="delete-button" @click="deleteImage(date)">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const emit = defineEmits(["close", "imagesUpdated"]);

// Date handling
const today = new Date();
const minDate = ref(formatDateForInput(new Date(today.getFullYear(), 0, 1))); // Jan 1 of current year
const maxDate = ref(
  formatDateForInput(new Date(today.getFullYear() + 1, 11, 31)),
); // Dec 31 of next year

const selectedDateString = ref(formatDateForInput(today));
const selectedDate = computed(() => {
  return selectedDateString.value ? new Date(selectedDateString.value) : null;
});

// Image handling
const fileInput = ref(null);
const imagePreview = ref(null);
const savedImages = ref({});
const isEditing = ref(false);
const editingDate = ref(null);

// Check if there are saved images
const hasSavedImages = computed(() => {
  return Object.keys(savedImages.value).length > 0;
});

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date for display (DD/MM/YYYY)
function formatDisplayDate(dateString) {
  const parts = dateString.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Trigger file input click
function triggerFileInput() {
  fileInput.value.click();
}

// Handle file selection
function handleFileChange(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Remove selected image
function removeImage() {
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

// Save image
function saveImage() {
  if (!selectedDate.value || !imagePreview.value) return;

  const dateKey = selectedDateString.value;

  savedImages.value[dateKey] = {
    image: imagePreview.value,
    title: `Imagen del día ${formatDisplayDate(dateKey)}`,
  };

  // Save to localStorage
  localStorage.setItem("deixa_daily_images", JSON.stringify(savedImages.value));

  // Reset form if not editing
  if (!isEditing.value) {
    removeImage();
  } else {
    isEditing.value = false;
    editingDate.value = null;
  }

  // Notify parent component
  emit("imagesUpdated", savedImages.value);
}

// Edit existing image
function editImage(dateKey) {
  if (savedImages.value[dateKey]) {
    selectedDateString.value = dateKey;
    imagePreview.value = savedImages.value[dateKey].image;
    isEditing.value = true;
    editingDate.value = dateKey;
  }
}

// Delete image
function deleteImage(dateKey) {
  if (confirm("¿Eliminar esta imagen?")) {
    if (savedImages.value[dateKey]) {
      delete savedImages.value[dateKey];

      // Update localStorage
      localStorage.setItem(
        "deixa_daily_images",
        JSON.stringify(savedImages.value),
      );

      // Notify parent component
      emit("imagesUpdated", savedImages.value);

      // Reset form if editing the deleted image
      if (isEditing.value && editingDate.value === dateKey) {
        removeImage();
        isEditing.value = false;
        editingDate.value = null;
      }
    }
  }
}

// Load saved images from localStorage
onMounted(() => {
  const savedImagesData = localStorage.getItem("deixa_daily_images");
  if (savedImagesData) {
    try {
      savedImages.value = JSON.parse(savedImagesData);
      emit("imagesUpdated", savedImages.value);
    } catch (e) {
      console.error("Error loading saved images:", e);
    }
  }
});

// Watch for date changes to load existing image
watch(selectedDateString, (newDate) => {
  if (newDate && savedImages.value[newDate] && !isEditing.value) {
    imagePreview.value = savedImages.value[newDate].image;
    isEditing.value = true;
    editingDate.value = newDate;
  } else if (!savedImages.value[newDate] && !isEditing.value) {
    removeImage();
  }
});
</script>

<style scoped>
.simple-image-manager {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #a5b5a6;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  margin: 0 auto 40px;
  font-family: "Inter", sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h3 {
  color: #1f2937;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

h4 {
  color: #1f2937;
  margin: 20px 0 10px;
  font-size: 16px;
  font-weight: 500;
}

.close-button {
  background-color: transparent;
  color: #666;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f0f2f0;
  color: #1f2937;
}

.date-selector {
  margin-bottom: 20px;
}

input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  -webkit-appearance: none;
  appearance: none;
}

input[type="date"]:focus {
  outline: none;
  border-color: #a5b5a6;
  box-shadow: 0 0 0 2px rgba(165, 181, 166, 0.2);
}

.image-upload {
  margin-bottom: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.upload-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: background-color 0.2s;
  border: 2px dashed #a5b5a6;
  background-color: rgba(165, 181, 166, 0.05);
}

.upload-placeholder:hover {
  background-color: rgba(165, 181, 166, 0.1);
}

.upload-instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 20px;
}

.upload-placeholder i {
  font-size: 40px;
  color: #a5b5a6;
}

.browse-button {
  background-color: #a5b5a6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.browse-button:hover {
  background-color: #94a395;
}

.file-types {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.upload-preview {
  position: relative;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-preview img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.remove-image:hover {
  background-color: white;
  color: #e53e3e;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.save-button {
  background-color: #a5b5a6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #94a395;
}

.save-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.saved-images {
  margin-top: 30px;
}

.image-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.saved-image-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
}

.saved-image-item:last-child {
  border-bottom: none;
}

.saved-image-date {
  font-weight: 500;
}

.saved-image-actions {
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  background-color: transparent;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button {
  color: #4a5568;
}

.delete-button {
  color: #e53e3e;
}

.edit-button:hover {
  background-color: #f0f2f0;
}

.delete-button:hover {
  background-color: #fed7d7;
}

/* Responsive styles */
@media (max-width: 768px) {
  .simple-image-manager {
    padding: 15px;
    max-width: 100%;
  }

  h3 {
    font-size: 16px;
  }

  h4 {
    font-size: 14px;
  }

  input[type="date"] {
    padding: 8px;
    font-size: 13px;
  }

  .upload-placeholder {
    height: 120px;
  }

  .upload-placeholder i {
    font-size: 28px;
  }

  .upload-preview {
    height: 120px;
  }

  .save-button {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .simple-image-manager {
    padding: 12px;
    margin-bottom: 20px;
  }

  .manager-header {
    margin-bottom: 15px;
  }

  h3 {
    font-size: 15px;
  }

  h4 {
    font-size: 13px;
    margin: 15px 0 8px;
  }

  .close-button {
    width: 25px;
    height: 25px;
  }

  .date-selector {
    margin-bottom: 15px;
  }

  input[type="date"] {
    padding: 7px;
    font-size: 12px;
  }

  .upload-placeholder {
    height: 100px;
  }

  .upload-placeholder i {
    font-size: 24px;
  }

  .upload-placeholder span {
    font-size: 12px;
  }

  .upload-preview {
    height: 100px;
  }

  .remove-image {
    width: 25px;
    height: 25px;
    top: 5px;
    right: 5px;
  }

  .save-button {
    padding: 7px 14px;
    font-size: 12px;
  }

  .saved-image-item {
    padding: 8px 12px;
  }

  .saved-image-date {
    font-size: 12px;
  }

  .edit-button,
  .delete-button {
    width: 25px;
    height: 25px;
  }
}
</style>
