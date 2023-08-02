document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("pixel-canvas");
  const PIXEL_SIZE = 32;
  let isMouseDown = false;
  let isEraserMode = false;
  let currentColor = "#000000";
  let colorHistory = [];
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

  // Handle mouse down event
  function handleMouseDown() {
    isMouseDown = true;
  }

  // Handle mouse up event
  function handleMouseUp() {
    isMouseDown = false;
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

  // Get the value of the color picker and update the current selected pen color and color history
  const colorPicker = document.getElementById("color-picker");
  colorPicker.addEventListener("input", function () {
    const newColor = colorPicker.value;
    if (newColor !== currentColor) {
      currentColor = newColor;
      updateColorHistory(newColor);
    }
  });

  // Update the color history
  function updateColorHistory(color) {
    colorHistory.unshift(color);
    colorHistory = colorHistory.slice(0, 5);
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

  // Add click event for the export button
  const exportButton = document.getElementById("export-button");
  exportButton.addEventListener("click", exportCanvas);

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
    const pixel = event.target;
    const pickedColor = getColorFromPixel(pixel);
    if (pickedColor !== "transparent") {
      currentColor = pickedColor;
      colorPicker.value = pickedColor;
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
