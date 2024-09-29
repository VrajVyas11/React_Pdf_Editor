export default async function uploadPdf(setPdfData,setCurrentPage)  {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const loadExtractedData = async (url) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
  
        if (response.ok) {
          setPdfData(data);
          setCurrentPage(0); // Reset to first page on new upload
        } else {
          console.error('Error loading extracted data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    if (!file) {
      alert('Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        loadExtractedData(result.dataUrl);
      } else {
        console.error('Error uploading PDF:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

 