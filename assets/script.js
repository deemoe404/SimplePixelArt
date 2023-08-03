document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("pixel-canvas");
  const PIXEL_SIZE = 32;
  let isMouseDown = false;
  let isEraserMode = false;
  let isPickColor = false;
  let currentColor = "#000000";
  let colorHistory = ['#000000'];
  let canvasHistory = [];
  let undoHistory = [];
  let pixelsData = [];

  // Create the pixel canvas
  function createCanvas() {
    for (let i = 0; i < PIXEL_SIZE; i++) {
      for (let j = 0; j < PIXEL_SIZE; j++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixel");
        pixel.addEventListener("mouseover", drawPixel);
        pixel.addEventListener("mousedown", handleMouseDown);
        pixel.addEventListener("mouseup", handleMouseUp);
        pixel.addEventListener("click", pickColorFromPixel); // Add color picking functionality

        pixel.addEventListener("touchmove", drawPixelTouch, { passive: true });
        canvas.appendChild(pixel);
      }
    }
  }

  // Draw pixels on the canvas
  function drawPixel(event) {
    if (isMouseDown) {
      const pixel = event.target;
      if (isEraserMode) {
        pixel.style.backgroundColor = "transparent";
        pixel.dataset.color = "transparent";
      } else {
        pixel.style.backgroundColor = currentColor;
        pixel.dataset.color = currentColor; // Update the color attribute of the pixel
      }
    }
  }

  function drawPixelTouch(event) {
    if (isEraserMode) {
      // 获取所有触摸点的信息
      const touches = event.touches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
        if (pixel && pixel.classList.contains("pixel")) {
          pixel.style.backgroundColor = "transparent";
        }
      }
    } else {
      // 获取所有触摸点的信息
      const touches = event.touches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
        if (pixel && pixel.classList.contains("pixel")) {
          pixel.style.backgroundColor = currentColor;
          pixel.dataset.color = currentColor;
        }
      }
    }
  }

  // Handle mouse down event
  function handleMouseDown(event) {
    isMouseDown = true;
    const pixel = event.target;
    if (isEraserMode) {
      pixel.style.backgroundColor = "transparent";
      pixel.dataset.color = "transparent";
    } else {
      pixel.style.backgroundColor = currentColor;
      pixel.dataset.color = currentColor; // Update the color attribute of the pixel
    }
  }

  // Handle mouse up event
  function handleMouseUp() {
    isMouseDown = false;

    const importExportText = document.getElementById("import-export-text");
    canvasHistory.push(importExportText.value);

    exportCanvas();
    undoHistory = [];
  }

  // Clear the pixel canvas
  function clearCanvas() {
    const allPixels = canvas.querySelectorAll(".pixel");
    allPixels.forEach((pixel) => {
      pixel.style.backgroundColor = "transparent";
      pixel.dataset.color = "transparent"; // Reset the color attribute of the pixel
    });
  }

  // Add click event for the clear button
  const clearButton = document.getElementById("clear-button");
  clearButton.addEventListener("click", clearCanvas);

  const colorDisplay = document.getElementById("colorDisplay");
  const setColor = document.getElementById("setColor");
  // Function to set color
  function setUpColor() {
    const newColor = colorDisplay.style.backgroundColor;
    if (newColor !== currentColor) {
      currentColor = newColor;
      updateColorHistory(newColor);
    }
  }
  setColor.addEventListener("click", setUpColor);

  // Update the color history
  function updateColorHistory(color) {
    colorHistory.unshift(color);
    colorHistory = colorHistory.slice(0, 8);
    displayColorHistory();
  }

  // Display the color history
  function displayColorHistory() {
    const colorHistoryDiv = document.getElementById("color-history");
    colorHistoryDiv.innerHTML = "";

    colorHistory.forEach((color) => {
      const colorItem = document.createElement("div");
      colorItem.classList.add("color-history-item");
      colorItem.style.backgroundColor = color;
      colorItem.addEventListener("click", () => {
        currentColor = color;
        colorPicker.value = color;
      });
      colorHistoryDiv.appendChild(colorItem);
    });
  }

  // Export the canvas content as JSON text
  function exportCanvas() {
    const allPixels = canvas.querySelectorAll(".pixel");
    pixelsData = [];

    allPixels.forEach((pixel) => {
      const pixelColor = pixel.dataset.color || "transparent"; // Use the color attribute of the pixel instead of the style
      pixelsData.push(pixelColor);
    });

    const exportText = JSON.stringify(pixelsData);
    const importExportText = document.getElementById("import-export-text");
    importExportText.value = exportText;
  }

  // Import the canvas content
  function importCanvas() {
    const importExportText = document.getElementById("import-export-text");
    const importText = importExportText.value;
    try {
      const importData = JSON.parse(importText);
      if (Array.isArray(importData) && importData.length === PIXEL_SIZE * PIXEL_SIZE) {
        pixelsData = importData;
        updateCanvasFromData();
      } else {
        throw new Error("Invalid import data");
      }
    } catch (error) {
      alert("Import failed: " + error.message);
    }
  }

  // Update the canvas based on the pixel data
  function updateCanvasFromData() {
    const allPixels = canvas.querySelectorAll(".pixel");
    allPixels.forEach((pixel, index) => {
      const pixelColor = pixelsData[index];
      pixel.style.backgroundColor = pixelColor;
      pixel.dataset.color = pixelColor; // Update the color attribute of the pixel
    });
  }

  function undoCanvas() {
    if (canvasHistory.length > 0) {
      const importExportText = document.getElementById("import-export-text");
      undoHistory.push(importExportText.value);
      importExportText.value = canvasHistory.pop();

      importCanvas();
    }
  }

  function redoCanvas() {
    if (undoHistory.length > 0) {
      const importExportText = document.getElementById("import-export-text");
      canvasHistory.push(importExportText.value);
      importExportText.value = undoHistory.pop();

      importCanvas();
    }
  }

  // Add click event for the undo button
  const undoButton = document.getElementById("undo-button");
  undoButton.addEventListener("click", undoCanvas);

  const redoButton = document.getElementById("redo-button");
  redoButton.addEventListener("click", redoCanvas);

  // Add click event for the import button
  const importButton = document.getElementById("import-button");
  importButton.addEventListener("click", importCanvas);

  // Add click event for the eraser button
  const eraserButton = document.getElementById("eraser-button");
  eraserButton.addEventListener("click", toggleEraserMode);

  // Toggle the eraser mode
  function toggleEraserMode() {
    isEraserMode = !isEraserMode;
    eraserButton.textContent = isEraserMode ? "Pen" : "Eraser";
    if (isEraserMode) {
      colorPicker.disabled = true;
    } else {
      colorPicker.disabled = false;
    }
  }

  // Color picking functionality: Click on a pixel on the canvas to get its color
  function getColorFromPixel(pixel) {
    const pixelColor = pixel.dataset.color || "transparent"; // Use the color attribute of the pixel instead of the style
    return pixelColor;
  }

  // When clicking on a pixel on the canvas, get its color and update the color picker value
  function pickColorFromPixel(event) {
    if (isPickColor) {
      const pixel = event.target;
      const pickedColor = getColorFromPixel(pixel);
      if (pickedColor !== "transparent") {
        currentColor = pickedColor;
        colorPicker.value = pickedColor;
      }
    } else {
      const pixel = event.target;
      if (isEraserMode) {
        pixel.style.backgroundColor = "transparent";
        pixel.dataset.color = "transparent";
      } else {
        pixel.style.backgroundColor = currentColor;
        pixel.dataset.color = currentColor; // Update the color attribute of the pixel
      }
    }
  }

  // Add click event for the export PNG button
  const exportPngButton = document.getElementById("export-png-button");
  exportPngButton.addEventListener("click", exportCanvasAsPNG);

  // Export the canvas content as a PNG image
  function exportCanvasAsPNG() {
    const canvasCopy = document.createElement("canvas");
    const ctx = canvasCopy.getContext("2d");

    // Set the new canvas size to 32x32 pixels
    canvasCopy.width = PIXEL_SIZE * 10;
    canvasCopy.height = PIXEL_SIZE * 10;

    // Get the CSS style of the pixel canvas
    const canvasStyle = window.getComputedStyle(canvas);
    ctx.fillStyle = canvasStyle.backgroundColor;
    ctx.fillRect(0, 0, canvasCopy.width, canvasCopy.height);

    // Draw the pixel canvas on the new canvas
    const allPixels = canvas.querySelectorAll(".pixel");
    allPixels.forEach((pixel, index) => {
      const row = Math.floor(index / PIXEL_SIZE);
      const col = index % PIXEL_SIZE;
      const pixelColor = pixel.dataset.color || "transparent"; // Use the color attribute of the pixel instead of the style
      ctx.fillStyle = pixelColor;
      ctx.fillRect(col * 10, row * 10, 10, 10);
    });

    // Create a temporary link and export the new canvas as a PNG image
    const tempLink = document.createElement("a");
    tempLink.href = canvasCopy.toDataURL();
    tempLink.download = "pixel_art.png";
    tempLink.click();
  }

  createCanvas();
  displayColorHistory();
  exportCanvas();
});

document.getElementById("uploadInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.src = reader.result;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Resize the image to 32x32
      const targetWidth = 32;
      const targetHeight = 32;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);

      // Get the image data in 32x32 size
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

      // Convert image data to array of hex colors with transparency
      const hexColorsWithAlpha = [];
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3] / 255; // Normalize alpha value to 0-1 range
        const hexColor = "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
        hexColorsWithAlpha.push(hexColor + Math.round(a * 255).toString(16).padStart(2, "0"));
      }

      // Display the JSON array in the text area
      const jsonOutput = document.getElementById("import-export-text");
      jsonOutput.value = JSON.stringify(hexColorsWithAlpha);
    };
  };
  reader.readAsDataURL(file);
});

const colorDisplay = document.getElementById("colorDisplay");
const redRange = document.getElementById("redRange");
const greenRange = document.getElementById("greenRange");
const blueRange = document.getElementById("blueRange");
const hueRange = document.getElementById("hueRange");
const saturationRange = document.getElementById("saturationRange");
const valueRange = document.getElementById("valueRange");
const hexInput = document.getElementById("hexInput");
const darkenBtn = document.getElementById("darkenBtn");
const lightenBtn = document.getElementById("lightenBtn");

let updatingColor = false; // Flag to prevent infinite loop during color updates

// Function to update color display
function updateColorDisplay() {
  const red = redRange.value;
  const green = greenRange.value;
  const blue = blueRange.value;
  const hue = hueRange.value;
  const saturation = saturationRange.value;
  const value = valueRange.value;
  const hex = rgbToHex(red, green, blue);

  colorDisplay.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
  hexInput.value = hex.toString(16);
}

function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// Function to update RGB sliders and color display based on HEX input
function updateColorFromHex() {
  const hex = hexInput.value;
  const rgb = hexToRgb(hex);

  if (rgb) {
    redRange.value = rgb.r;
    greenRange.value = rgb.g;
    blueRange.value = rgb.b;
    updateColorDisplay();
  }
}

// Function to convert HEX to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

// Function to update color display based on HSV sliders
function updateColorFromHsv() {
  if (!updatingColor) {
    updatingColor = true;
    const hue = hueRange.value;
    const saturation = saturationRange.value / 100;
    const value = valueRange.value / 100;
    const rgb = hsvToRgb(hue, saturation, value);
    redRange.value = rgb.r;
    greenRange.value = rgb.g;
    blueRange.value = rgb.b;
    updateColorDisplay();
    updatingColor = false;
  }
}

// Function to update color display based on RGB sliders
function updateColorFromRgb() {
  if (!updatingColor) {
    updatingColor = true;
    const red = redRange.value;
    const green = greenRange.value;
    const blue = blueRange.value;
    const hsv = rgbToHsv(red, green, blue);
    hueRange.value = hsv.h;
    saturationRange.value = hsv.s * 100;
    valueRange.value = hsv.v * 100;
    updateColorDisplay();
    updatingColor = false;
  }
}

// Function to convert HSV to RGB
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r, g, b;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Function to convert RGB to HSV
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h, s, v;

  if (d === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / d) % 6;
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }

  s = max === 0 ? 0 : d / max;
  v = max;

  return { h, s, v };
}

// Event listeners for RGB sliders and HEX input
redRange.addEventListener("input", updateColorFromRgb);
greenRange.addEventListener("input", updateColorFromRgb);
blueRange.addEventListener("input", updateColorFromRgb);

// Function to handle HEX input change
function handleHexInputChange(event) {
  if (event.key === "Enter") {
    const hex = hexInput.value;
    const rgb = hexToRgb(hex);

    if (rgb) {
      redRange.value = rgb.r;
      greenRange.value = rgb.g;
      blueRange.value = rgb.b;
      updateColorDisplay();
    }
  }
}

// Event listener for HEX input change
hexInput.addEventListener("keydown", handleHexInputChange);


// Event listeners for HSV sliders
hueRange.addEventListener("input", updateColorFromHsv);
saturationRange.addEventListener("input", updateColorFromHsv);
valueRange.addEventListener("input", updateColorFromHsv);

// Function to darken color
function darkenColor() {
  const currentValue = parseInt(valueRange.value);
  if (currentValue > 0) {
    valueRange.value = currentValue - 5;
    updateColorFromHsv(); // Update color based on HSV sliders after adjusting value
  }
}

// Function to lighten color
function lightenColor() {
  const currentValue = parseInt(valueRange.value);
  if (currentValue < 100) {
    valueRange.value = currentValue + 5;
    updateColorFromHsv(); // Update color based on HSV sliders after adjusting value
  }
}

// Event listeners for darken and lighten buttons
darkenBtn.addEventListener("click", darkenColor);
lightenBtn.addEventListener("click", lightenColor);

// Function to handle preset color button click
function handlePresetColorButtonClick(event) {
  const color = event.target.getAttribute("data-color");
  const rgb = hexToRgb(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  redRange.value = rgb.r;
  greenRange.value = rgb.g;
  blueRange.value = rgb.b;
  hueRange.value = hsv.h;
  saturationRange.value = hsv.s * 100;
  valueRange.value = hsv.v * 100;

  updateColorDisplay();
}

// Event listeners for preset color buttons
const presetColorButtons = document.querySelectorAll(".presetColor");
presetColorButtons.forEach((button) => {
  button.addEventListener("click", handlePresetColorButtonClick);
});

// Initialize color display
updateColorDisplay();
