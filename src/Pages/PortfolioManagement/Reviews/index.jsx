import React, { useState, useEffect } from 'react';
import { SearchBar } from '../../../components/Reviews/SearchBar';
import { ReviewsGrid } from '../../../components/Reviews/ReviewCarosoul';
import { getAllReviews, fetchProjectById } from '../../../api/projectApi';
import './ReviewsPage.scss';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchReviewData() {
      try {
        const allReviews = await getAllReviews();


        const enrichedReviews = await Promise.all(
          allReviews.map(async (review) => {
            try {
              const project = await fetchProjectById(review.project_id);
              const clientInfo = project.client_id;
              return {
                ...review,
                project_name: project.name,
                client_name: clientInfo.name,
              };
            } catch (err) {
              console.error('Error enriching review:', err);
              return review;
            }
          })
        );

        setReviews(enrichedReviews);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewData();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      review.client_name?.toLowerCase().includes(searchLower) ||
      review.header?.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower) ||
      review.project_name?.toLowerCase().includes(searchLower)
    );
  });

  // if (loading) return <div className="reviews-loading">Loading...</div>;
  if (error) return <div className="reviews-error">{error}</div>;

  return (
    <div className="reviews-container">

      <div className="reviews-content">
        <h1 className="title text-center text-white">
          REVIEWS
        </h1>
        <p className="subtitle text-center text-white">
          Find out how our clients are spreading the word.
        </p>
        <SearchBar onSearch={setSearchTerm} />
        <ReviewsGrid reviews={filteredReviews} />
      </div>
    </div>
  );
}
