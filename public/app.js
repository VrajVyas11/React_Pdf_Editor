let pdfDoc = null;
let currentPage = 1;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const pdfContainer = document.getElementById('pdf-container');
const resultDiv = document.getElementById('result');

fileInput.addEventListener('change', handleFileUpload);

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    displayPdfContent(data.content);
  }
}

function displayPdfContent(content) {
  // Example content display (You will need to parse and render text and images here)
  console.log(content);
}

function addText() {
  // Example text addition functionality
  ctx.font = '30px Arial';
  ctx.fillText('Editable Text', 50, 50);
}

function addImage() {
  // Example image addition functionality
  const img = new Image();
  img.src = 'https://example.com/sample-image.png'; // Replace with a real image URL
  img.onload = () => {
    ctx.drawImage(img, 100, 100, 200, 200);
  };
}

async function saveChanges() {
  // Send canvas image data to the backend
  const dataUrl = canvas.toDataURL();
  const response = await fetch('/edit', {
    method: 'POST',
    body: JSON.stringify({ pdfData: dataUrl }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  resultDiv.innerHTML = `<a href="${result.url}" target="_blank">Download Edited PDF</a>`;
}
