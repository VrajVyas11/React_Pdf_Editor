import React, { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const PdfMerge = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [count, setCount] = useState(0);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = [...pdfs];

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const pdfData = ev.target.result;
        newPdfs.push(pdfData);
        await extractPages(pdfData, newPdfs.length - 1);
        setCount((prevCount) => prevCount + 1);
      };

      reader.readAsArrayBuffer(file);
    }

    setPdfs(newPdfs);
  };

  const extractPages = async (pdfData, pdfIndex) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const pageCount = pdfDoc.getPageCount();
      const extractedPages = Array.from({ length: pageCount }, (_, index) => ({
        index,
        pdfIndex,
        name: `pdf ${pdfIndex + 1} page ${index + 1}`,
      }));
      setPages((prev) => [...prev, ...extractedPages]);
    } catch (error) {
      console.error("Error extracting pages:", error);
    }
  };

  const mergePdfs = async () => {
    if (pdfs.length === 0 || pages.length === 0) return;

    try {
      const mergedPdf = await PDFDocument.create();

      for (const page of pages) {
        const { pdfIndex, index } = page;
        const pdfDoc = await PDFDocument.load(pdfs[page.pdfIndex]);

        const copiedPages = await mergedPdf.copyPages(pdfDoc, [index]);
        mergedPdf.addPage(copiedPages[0]);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPreviewPdf(URL.createObjectURL(blob));
      setMergedPdfBytes(pdfBytes);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    }
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, targetIndex) => {
    const sourceIndex = event.dataTransfer.getData('text/plain');

    if (sourceIndex === targetIndex.toString() || !pages[sourceIndex] || !pages[targetIndex]) return;

    setPages((prevPages) => {
      const updatedPages = [...prevPages];
      const [movedPage] = updatedPages.splice(sourceIndex, 1);
      updatedPages.splice(targetIndex, 0, movedPage);
      return updatedPages;
    });
    mergePdfs();
  };

  const downloadPdf = () => {
    if (mergedPdfBytes) {
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
    }
  };

  const handleRemovePage = (index) => {
    setPages((prevPages) => prevPages.filter((_, i) => i !== index));
    mergePdfs();
  };



  useEffect(() => {
    mergePdfs();
  }, [count]);

  return (
    <div className="flex p-6 bg-gray-900 min-h-fit">
      <div className="w-1/3 pr-4">
        <div className="bg-gray-800 min-h-[200px] shadow-xl rounded-lg p-4 transition-transform transform hover:scale-105">
        <div
        className={`border-4 border-dashed p-5 rounded-lg w-full max-w-md bg-wheat flex items-center justify-center cursor-pointer transition-colors duration-300 ease-in-out border-gray-300`}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        <p className="text-center text-gray-500"> Click to upload</p>
      </div>
          <h2 className="text-lg font-bold text-gray-200 mb-2 mt-10">Uploaded Pages</h2>
          <div className="grid grid-cols-1 gap-4">
            {pages.map((page, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="bg-gray-700 border  border-gray-600 rounded-md p-3 hover:bg-gray-600 cursor-move flex justify-between items-center shadow transition duration-150 ease-in-out"
              >
                <span className="text-gray-200">{page.name}</span>
                {/* <button onClick={() => handleRemovePage(index)} className="text-red-400 hover:text-red-300 transition">
                  &times;
                </button> */}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-2/3">
        <div className="bg-gray-800 min-h-[200px] shadow-xl rounded-lg p-4 ">
          {pages.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-200 mb-2">PDF Preview</h2>
              <iframe
                src={previewPdf}
                width="100%"
                height="500px"
                title="Preview PDF"
                className="border border-gray-600 rounded mb-4 shadow-lg"
              />
              <button
                onClick={downloadPdf}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-lg"
              >
                Download Merged PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfMerge;
