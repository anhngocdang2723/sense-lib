import React, { useState, useEffect } from 'react';
import api, { endpoints } from '../../api/api';
import placeholderImage from '../../assets/img/card/1.png';
import { motion } from 'framer-motion';
import { FaSearch, FaFolderOpen, FaBookOpen, FaUser, FaBuilding } from 'react-icons/fa'; // Removed pagination icons for now
import './DocumentList.css'; // Import CSS

// Helper to get full image URL (can be reused from Home.jsx or create common util)
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return placeholderImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  // Assuming VITE_API_URL is correctly configured
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return `${baseUrl}${cleanUrl}`;
};

const DocumentList = () => {
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' or category slug/id
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  // State for related documents (will be implemented later)
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null); // To trigger related docs fetch

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await api.get(endpoints.categories.list, { params: { include_inactive: false } });
        setCategories([{ id: 'all', name: 'Tất cả' }, ...categoriesResponse.data]); // Add 'All' option

        // Fetch books (limit 30 initially)
        // TODO: Implement proper backend pagination if needed for large lists
        const booksResponse = await api.get(endpoints.documents.list, { params: { skip: 0, limit: 30 } });
        setAllBooks(booksResponse.data.documents || []);
        setFilteredBooks(booksResponse.data.documents || []); // Initially show all fetched books

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch data only on component mount

  // Effect to filter books whenever selectedCategory, searchTerm, or allBooks changes
  useEffect(() => {
    let booksToFilter = allBooks;

    // Filter by category
    if (selectedCategory !== 'all') {
      booksToFilter = booksToFilter.filter(book => book.category_id === selectedCategory);
    }

    // Filter by search term (basic title/author search)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      booksToFilter = booksToFilter.filter(book =>
        book.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        book.authors?.some(author => author.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredBooks(booksToFilter);
    setCurrentPage(1); // Reset to first page after filtering
    setSelectedDocumentId(null); // Reset selected document on filter/search change
  }, [selectedCategory, searchTerm, allBooks]);

  // Effect to fetch related documents when a document is selected
  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      if (!selectedDocumentId) {
        setRelatedDocuments([]);
        return;
      }
      try {
        // TODO: Replace with actual API endpoint for related documents
        // Assuming endpoint is /api/documents/{id}/related
        const response = await api.get(`${endpoints.documents.detail}/${selectedDocumentId}/related`);
        setRelatedDocuments(response.data.documents || []);
      } catch (err) {
        console.error('Error fetching related documents:', err);
        setRelatedDocuments([]); // Clear related docs on error
      }
    };
    fetchRelatedDocuments();
  }, [selectedDocumentId]); // Fetch related docs when selectedDocumentId changes

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBookItemClick = (bookId) => {
    setSelectedDocumentId(bookId);
    // Optional: Scroll to related documents section
    // const relatedSection = document.getElementById('related-documents');
    // if (relatedSection) {
    //   relatedSection.scrollIntoView({ behavior: 'smooth' });
    // }
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="document-list-page">
      <motion.div 
        className="documentlist-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Danh sách tài liệu</h1>
        <p className="documentlist-intro">Khám phá kho tài liệu phong phú của chúng tôi</p>
      </motion.div>

      <motion.div 
        className="content-area"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <motion.div 
          className="search-bar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FaSearch className="search-icon" />
        </motion.div>

        <div className="main-content-flex">
          <motion.div 
            className="category-filter"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h2><FaFolderOpen /> Danh mục</h2>
            <ul>
              {categories.map((category, index) => (
                <motion.li
                  key={category.id}
                  className={selectedCategory === category.id ? 'active' : ''}
                  onClick={() => handleCategoryClick(category.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, backgroundColor: '#edf2f7' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.name}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="book-list-area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {filteredBooks.length === 0 ? (
              <p>Không tìm thấy tài liệu phù hợp.</p>
            ) : (
              <ul className="book-list">
                {currentBooks.map((book, index) => (
                  <motion.li 
                    key={book.id} 
                    className="book-item"
                    onClick={() => handleBookItemClick(book.id)} // Add click handler
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.08, duration: 0.5 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 6px 10px rgba(0,0,0,0.08)' }}
                  >
                    <img src={getFullImageUrl(book.image_url)} alt={book.title} className="book-cover" />
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p><strong><FaUser /> Tác giả:</strong> {book.authors?.map(a => a.name).join(', ') || 'N/A'}</p>
                      <p><strong><FaBuilding /> Nhà xuất bản:</strong> {book.publisher?.name || 'N/A'}</p>
                      <p><strong><FaBookOpen /> Mô tả:</strong> {book.description || 'N/A'}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <motion.div 
                className="pagination"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {pageNumbers.map(number => (
                  <motion.button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={currentPage === number ? 'active' : ''}
                    disabled={filteredBooks.length <= booksPerPage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {number}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Related Documents Section */}
            {selectedDocumentId && relatedDocuments.length > 0 && (
              <motion.div 
                id="related-documents"
                className="related-documents-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h2>Tài liệu liên quan</h2>
                <ul className="related-documents-list book-list"> {/* Reuse book-list styling */}
                  {relatedDocuments.map(relatedBook => (
                     <motion.li 
                        key={relatedBook.id} 
                        className="book-item related-book-item"
                        // No click handler here, maybe link to the book page?
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ scale: 1.01, boxShadow: '0 6px 10px rgba(0,0,0,0.08)' }}
                      >
                        {/* Reuse book item structure */}
                        <img src={getFullImageUrl(relatedBook.image_url)} alt={relatedBook.title} className="book-cover" />
                        <div className="book-details">
                          <h3>{relatedBook.title}</h3>
                          <p><strong><FaUser /> Tác giả:</strong> {relatedBook.authors?.map(a => a.name).join(', ') || 'N/A'}</p>
                          <p><strong><FaBuilding /> Nhà xuất bản:</strong> {relatedBook.publisher?.name || 'N/A'}</p>
                          <p><strong><FaBookOpen /> Mô tả:</strong> {relatedBook.description || 'N/A'}</p>
                        </div>
                      </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentList; 