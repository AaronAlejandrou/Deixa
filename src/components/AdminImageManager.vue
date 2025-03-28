<template>
  <div class="admin-image-manager">
    <div class="admin-header">
      <h3>Administrador de Imágenes Diarias</h3>
      <button class="logout-button" @click="logout">
        <i class="ti ti-logout"></i> Cerrar Sesión
      </button>
    </div>

    <div class="date-selector">
      <div class="form-group">
        <label for="imageDate">Seleccionar Fecha</label>
        <input
          type="date"
          id="imageDate"
          v-model="selectedDateString"
          :min="minDate"
          :max="maxDate"
        />
      </div>
    </div>

    <div class="image-upload">
      <div class="upload-preview" v-if="imagePreview">
        <img :src="imagePreview" alt="Vista previa" />
        <button class="remove-image" @click="removeImage">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="upload-placeholder" v-else @click="triggerFileInput">
        <i class="ti ti-upload"></i>
        <span>Haga clic para subir una imagen</span>
      </div>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept="image/*"
        style="display: none"
      />
    </div>

    <div class="image-info" v-if="imagePreview">
      <div class="form-group">
        <label for="imageTitle">Título de la Imagen</label>
        <input
          type="text"
          id="imageTitle"
          v-model="imageTitle"
          placeholder="Ingrese un título para la imagen"
        />
      </div>
    </div>

    <div class="action-buttons">
      <button class="save-button" @click="saveImage" :disabled="!imagePreview">
        Guardar Imagen
      </button>
    </div>

    <div class="saved-images">
      <h4>Imágenes Guardadas</h4>
      <div class="image-list">
        <div
          v-for="(image, date) in savedImages"
          :key="date"
          class="saved-image-item"
        >
          <div class="saved-image-date">{{ formatDisplayDate(date) }}</div>
          <div class="saved-image-title">{{ image.title }}</div>
          <div class="saved-image-actions">
            <button class="edit-button" @click="editImage(date)">
              <i class="ti ti-edit"></i>
            </button>
            <button class="delete-button" @click="deleteImage(date)">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>
        <div v-if="Object.keys(savedImages).length === 0" class="no-images">
          No hay imágenes guardadas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const emit = defineEmits(["logout", "imagesUpdated"]);

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
const imageTitle = ref("");
const savedImages = ref({});
const isEditing = ref(false);
const editingDate = ref(null);

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
  imageTitle.value = "";
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
    title: imageTitle.value || `Imagen del día ${formatDisplayDate(dateKey)}`,
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
    imageTitle.value = savedImages.value[dateKey].title;
    isEditing.value = true;
    editingDate.value = dateKey;
  }
}

// Delete image
function deleteImage(dateKey) {
  if (confirm("¿Está seguro que desea eliminar esta imagen?")) {
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

// Logout
function logout() {
  emit("logout");
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
    imageTitle.value = savedImages.value[newDate].title;
    isEditing.value = true;
    editingDate.value = newDate;
  } else if (!savedImages.value[newDate] && !isEditing.value) {
    removeImage();
  }
});
</script>

<style scoped>
.admin-image-manager {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #a5b5a6;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto 40px;
  font-family: "Inter", sans-serif;
}

.admin-header {
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

.logout-button {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: #f0f2f0;
  color: #1f2937;
}

.date-selector {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

label {
  font-size: 14px;
  color: #666;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #a5b5a6;
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
  gap: 10px;
  cursor: pointer;
  color: #666;
  transition: background-color 0.2s;
}

.upload-placeholder:hover {
  background-color: #f0f2f0;
}

.upload-placeholder i {
  font-size: 32px;
  color: #a5b5a6;
}

.upload-preview {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
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
  margin-top: 20px;
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
}

.saved-image-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.saved-image-item:last-child {
  border-bottom: none;
}

.saved-image-date {
  flex: 0 0 100px;
  font-weight: 500;
}

.saved-image-title {
  flex: 1;
  color: #666;
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

.no-images {
  padding: 20px;
  text-align: center;
  color: #666;
}

@media (max-width: 640px) {
  .admin-image-manager {
    margin: 0 10px 40px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .logout-button {
    align-self: flex-end;
  }

  .saved-image-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .saved-image-date {
    flex: none;
  }

  .saved-image-actions {
    align-self: flex-end;
  }
}
</style>
