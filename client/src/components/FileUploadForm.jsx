import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import "./FileUploadForm.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [numPages, setNumPages] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setSelectedPages([]);

      // Upload the file to the server
      const formData = new FormData();
      formData.append("file", file);

      try {
        await axios.post("http://localhost:3000/upload", formData);
      } catch (error) {
        console.error("Error uploading PDF:", error);
      }
    } else {
      alert("Please select a PDF file.");
    }
  };

  const handlePageSelection = (page) => {
    setSelectedPages((prevSelectedPages) =>
      prevSelectedPages.includes(page)
        ? prevSelectedPages.filter((p) => p !== page)
        : [...prevSelectedPages, page]
    );
  };

  const handleCreatePdf = async () => {
    if (selectedPages.length === 0) {
      alert("Please select at least one page to extract.");
      return;
    }

    try {
      // Request the server to create a new PDF
      const response = await axios.post("http://localhost:3000/extract", {
        filename: selectedFile.name,
        pages: selectedPages,
      });

      // Download the new PDF
      window.location.href = `http://localhost:3000/download/${response.data.filename}`;
    } catch (error) {
      console.error("Error creating new PDF:", error);
    }
  };

  return (
    <div className="file-upload-container">
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {selectedFile && (
        <>
          <Document
            file={selectedFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`}>
                <input
                  type="checkbox"
                  checked={selectedPages.includes(index + 1)}
                  onChange={() => handlePageSelection(index + 1)}
                />
                <Page
                  pageNumber={index + 1}
                  className={
                    selectedPages.includes(index + 1) ? "selected" : ""
                  }
                />
              </div>
            ))}
          </Document>
          <button onClick={handleCreatePdf}>Create PDF</button>
        </>
      )}
    </div>
  );
};

export default FileUploadForm;
