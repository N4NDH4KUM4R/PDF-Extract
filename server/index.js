const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const path = require("path");
const cors = require("cors");
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3001",
};

app.use(cors(corsOptions));

app.post("/upload", upload.single("file"), (req, res) => {
  // Move the file to a permanent location
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "./uploads/", req.file.originalname);

  fs.rename(tempPath, targetPath, (err) => {
    if (err) return res.status(500).send(err);

    res.status(200).contentType("text/plain").end("File uploaded!");
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "./uploads/", filename);

  res.download(filePath);
});

app.post("/extract", express.json(), async (req, res) => {
  const { filename, pages } = req.body;
  const filePath = path.join(__dirname, "./uploads/", filename);

  const fileBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();

  for (const pageIndex of pages) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex - 1]);
    newPdf.addPage(copiedPage);
  }

  const pdfBytes = await newPdf.save();

  // Save the new PDF to a file
  const newFilename = `extracted_${filename}`;
  const newFilePath = path.join(__dirname, "./uploads/", newFilename);

  fs.writeFileSync(newFilePath, pdfBytes);

  res.json({ filename: newFilename });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
