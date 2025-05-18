import React, { useEffect, useRef, useState } from 'react';
import './PDFViewer.css';
import api from '../api/api';
import { endpoints } from '../api/api';

// Import PDF.js
const pdfjsLib = window.pdfjsLib;

const PDFViewer = ({ pdfUrl, documentId }) => {
  const canvasRef = useRef(null);
  const searchInputRef = useRef(null);
  const currentPageRef = useRef(null);
  const pageCountRef = useRef(null);
  const zoomLevelRef = useRef(null);
  const searchInfoRef = useRef(null);
  const [lastSavedPage, setLastSavedPage] = useState(1);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Variables
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.0;
  let rotation = 0;
  let currentSearchTerm = '';
  let searchMatches = [];
  let currentMatchIndex = -1;

  // Save reading progress
  const saveReadingProgress = async () => {
    if (!documentId) return;

    try {
      const progressData = {
        document_id: documentId,
        progress_type: 'PAGE',
        progress_value: pageNum,
        status: 'READING',
        last_position: {
          page: pageNum,
          scale: scale,
          rotation: rotation,
          timestamp: new Date().toISOString()
        },
        device_id: navigator.userAgent,
        conflict_resolution: 'LATEST'
      };

      console.log('Sending progress data:', progressData);
      console.log('Request headers:', api.defaults.headers);
      
      const response = await api.post(endpoints.readingProgress.create, progressData);
      console.log('Response:', response);
      setLastSavedPage(pageNum);
      setSaveStatus('Đã lưu tiến trình!');
      setTimeout(() => setSaveStatus(''), 2000);
      console.log('Reading progress saved:', progressData);
    } catch (error) {
      console.error('Error details:', error.response?.data);
      console.error('Error saving reading progress:', error);
      setSaveStatus('Lỗi khi lưu tiến trình!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Load reading progress
  const loadReadingProgress = async () => {
    if (!documentId) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Token in loadReadingProgress:', token);
      console.log('Headers:', api.defaults.headers);
      console.log('Request config:', {
        url: endpoints.readingProgress.list,
        params: {
          document_id: documentId,
          limit: 1
        },
        headers: api.defaults.headers
      });

      const response = await api.get(endpoints.readingProgress.list, {
        params: {
          document_id: documentId,
          limit: 1
        }
      });

      if (response.data && response.data.length > 0) {
        const lastProgress = response.data[0];
        if (lastProgress.last_position) {
          pageNum = lastProgress.last_position.page || 1;
          scale = lastProgress.last_position.scale || 1.0;
          rotation = lastProgress.last_position.rotation || 0;
          updateZoomDisplay();
          queueRenderPage(pageNum);
        }
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
      console.error('Error response:', error.response);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set worker path to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // Load the PDF
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
          cMapPacked: true,
        });
        pdfDoc = await loadingTask.promise;
        
        pageCountRef.current.textContent = pdfDoc.numPages;
        currentPageRef.current.max = pdfDoc.numPages;
        
        // Load saved reading progress
        await loadReadingProgress();
        
        // Initial render
        renderPage(pageNum);
        
        // Extract text for search
        extractTextFromPDF(pdfDoc);
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF: ' + error.message);
      }
    };

    loadPDF();

    // Add event listeners
    const addEventListeners = () => {
      currentPageRef.current.addEventListener('change', () => {
        const pageNum = parseInt(currentPageRef.current.value);
        if (pageNum >= 1 && pageNum <= pdfDoc.numPages) {
          queueRenderPage(pageNum);
        }
      });

      document.getElementById('prev-page').addEventListener('click', prevPage);
      document.getElementById('next-page').addEventListener('click', nextPage);
      document.getElementById('zoom-in').addEventListener('click', zoomIn);
      document.getElementById('zoom-out').addEventListener('click', zoomOut);
      document.getElementById('rotate-btn').addEventListener('click', rotatePage);
      document.getElementById('search-btn').addEventListener('click', searchInPDF);
      document.getElementById('prev-match').addEventListener('click', prevMatch);
      document.getElementById('next-match').addEventListener('click', nextMatch);
    };

    addEventListeners();

    // Cleanup
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfUrl, documentId]);

  // Render the page
  const renderPage = async (num) => {
    pageRendering = true;
    currentPageRef.current.value = num;
    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: scale, rotation: rotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = { canvasContext: context, viewport: viewport };
      await page.render(renderContext).promise;
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
      if (searchMatches.length > 0) {
        highlightSearchMatches();
      }
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  // Navigation
  const prevPage = () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  };
  const nextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  };

  // Zoom
  const zoomIn = () => {
    scale += 0.25;
    updateZoomDisplay();
    queueRenderPage(pageNum);
  };
  const zoomOut = () => {
    if (scale <= 0.5) return;
    scale -= 0.25;
    updateZoomDisplay();
    queueRenderPage(pageNum);
  };
  const updateZoomDisplay = () => {
    zoomLevelRef.current.textContent = Math.round(scale * 100) + '%';
  };

  // Rotate
  const rotatePage = () => {
    rotation = (rotation + 90) % 360;
    queueRenderPage(pageNum);
  };

  // Search
  const extractTextFromPDF = async (pdf) => {
    const textContainer = document.getElementById('pdf-text');
    textContainer.innerHTML = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageDiv = document.createElement('div');
      pageDiv.setAttribute('data-page', i);
      textContent.items.forEach(item => {
        const textDiv = document.createElement('div');
        textDiv.textContent = item.str;
        textDiv.style.position = 'absolute';
        textDiv.setAttribute('data-x', item.transform[4]);
        textDiv.setAttribute('data-y', item.transform[5]);
        textDiv.setAttribute('data-width', item.width);
        textDiv.setAttribute('data-height', item.height);
        pageDiv.appendChild(textDiv);
      });
      textContainer.appendChild(pageDiv);
    }
  };
  const searchInPDF = () => {
    const searchTerm = searchInputRef.current.value.toLowerCase();
    currentSearchTerm = searchTerm;
    if (!searchTerm) {
      alert('Please enter a search term');
      return;
    }
    searchMatches = [];
    currentMatchIndex = -1;
    const textElements = document.querySelectorAll('#pdf-text div div');
    textElements.forEach(element => {
      const text = element.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        const page = parseInt(element.parentNode.getAttribute('data-page'));
        const x = parseFloat(element.getAttribute('data-x'));
        const y = parseFloat(element.getAttribute('data-y'));
        const width = parseFloat(element.getAttribute('data-width'));
        const height = parseFloat(element.getAttribute('data-height'));
        searchMatches.push({ page, x, y, width, height, text });
      }
    });
    searchInfoRef.current.textContent = 
      searchMatches.length > 0 ? 
      `Found ${searchMatches.length} matches` : 
      'No matches found';
    if (searchMatches.length > 0) {
      currentMatchIndex = 0;
      navigateToMatch(currentMatchIndex);
    }
  };
  const navigateToMatch = (index) => {
    if (index < 0 || index >= searchMatches.length) return;
    const match = searchMatches[index];
    if (pageNum !== match.page) {
      pageNum = match.page;
      queueRenderPage(pageNum);
    } else {
      highlightSearchMatches();
    }
    searchInfoRef.current.textContent = 
      `Match ${index + 1} of ${searchMatches.length}`;
  };
  const highlightSearchMatches = () => {
    if (searchMatches.length === 0) return;
    const currentPageMatches = searchMatches.filter(match => match.page === pageNum);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    currentPageMatches.forEach(match => {
      const viewport = pdfDoc.getPage(pageNum).getViewport({ scale: scale, rotation: rotation });
      const isCurrentMatch = searchMatches.indexOf(match) === currentMatchIndex;
      const transform = viewport.transform;
      const x = transform[0] * match.x + transform[2] * match.y + transform[4];
      const y = transform[1] * match.x + transform[3] * match.y + transform[5];
      context.beginPath();
      context.rect(x, y - match.height, match.width * scale, match.height);
      context.fillStyle = isCurrentMatch ? 'rgba(255, 165, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)';
      context.fill();
    });
  };
  const prevMatch = () => {
    if (currentMatchIndex > 0) {
      currentMatchIndex--;
      navigateToMatch(currentMatchIndex);
    }
  };
  const nextMatch = () => {
    if (currentMatchIndex < searchMatches.length - 1) {
      currentMatchIndex++;
      navigateToMatch(currentMatchIndex);
    }
  };

  return (
    <div className="container">
      {/* Controls: search, navigation, zoom, rotate */}
      <div className="search-container">
        <input ref={searchInputRef} type="text" placeholder="Search in PDF..." />
        <button id="search-btn">Search</button>
        <button id="prev-match">Previous</button>
        <button id="next-match">Next</button>
        <span ref={searchInfoRef} className="search-info"></span>
      </div>
      <div className="toolbar">
        <div className="page-controls">
          <button id="prev-page">Previous</button>
          <span>Page <input ref={currentPageRef} type="number" min="1" defaultValue="1" /> of <span ref={pageCountRef}>0</span></span>
          <button id="next-page">Next</button>
        </div>
        <div className="zoom-controls">
          <button id="zoom-out">-</button>
          <span ref={zoomLevelRef}>100%</span>
          <button id="zoom-in">+</button>
          <button id="rotate-btn">Rotate</button>
          <button 
            id="save-progress" 
            onClick={saveReadingProgress} 
            style={{ 
              marginLeft: '10px', 
              background: '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-save"></i>
            Lưu tiến trình
          </button>
          {saveStatus && (
            <span style={{ 
              marginLeft: '10px', 
              color: saveStatus.includes('Lỗi') ? '#f44336' : '#4CAF50',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {saveStatus}
            </span>
          )}
        </div>
      </div>
      <div className="canvas-container">
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Đang tải vị trí đọc cuối...
          </div>
        )}
        <canvas ref={canvasRef} id="pdf-canvas"></canvas>
      </div>
      <div id="pdf-text" style={{ display: 'none' }}></div>
    </div>
  );
};

export default PDFViewer;