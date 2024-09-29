const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf2json = require('pdf2json');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

// Paths for uploads and static files
const uploadsDir = path.join(__dirname, 'client');  // Use separate uploads folder
const publicDir = path.join(__dirname, 'public');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve the public directory as static
// app.use(express.static(publicDir));

// Serve the uploads directory for static access to JSON (if needed)
app.use('/uploads', express.static(uploadsDir));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);  // Saving PDF to uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);  // Use original filename
  }
});

const upload = multer({ storage: storage });

// Root route for serving frontend (if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));  // Serve the index.html from public directory
});

// Upload and process PDF for extraction
app.post('/upload', upload.single('pdf'), (req, res) => {
  const filePath = path.join(uploadsDir, req.file.filename);  // Path to uploaded PDF

  console.log("Received PDF file:", req.file.filename);

  try {
    const pdfParser = new pdf2json();

    // PDF data extraction event
    pdfParser.on('pdfParser_dataReady', pdfData => {
      const extractedDataPath = path.join(uploadsDir, '/extractedData.json');  // Save extracted data
      fs.writeFileSync(extractedDataPath, JSON.stringify(pdfData));

      // Optionally delete PDF after processing
      fs.unlinkSync(filePath);

      // Return the JSON data file location
      res.json({ message: 'PDF extracted successfully', dataUrl: '/extractedData.json' });
    });

    // PDF parsing error event
    pdfParser.on('pdfParser_dataError', err => {
      console.error('Error during PDF parsing:', err.parserError);
      res.status(500).json({ error: 'Error occurred during PDF parsing' });
    });

    // Start the PDF parsing process
    pdfParser.loadPDF(filePath);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error occurred while processing the PDF' });
  }
});

// Example of another route to maintain your existing functionality
app.get('/other-functionality', (req, res) => {
  res.json({ message: 'This is a placeholder for other functionality' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
