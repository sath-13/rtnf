// import React from 'react';
// import { FaStar } from 'react-icons/fa';
// import './reviewcard.scss'; // Import the CSS file

// function getInitials(name) {
//   if (!name) return '??';
//   return name
//     .split(' ')
//     .map(word => word[0])
//     .join('')
//     .toUpperCase();
// }

// export function ReviewCard({
//   header,
//   comment,
//   rating,
//   clientName = '',
//   projectName
// }) {
//   const initials = getInitials(clientName);
//   const [isHovered, setIsHovered] = React.useState(false);

//   return (
//     <div
//       className={`review-card ${isHovered ? 'hover' : ''}`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="review-content">
//         <div className="review-header">
//           <div className="star-rating">
//             {[...Array(5)].map((_, i) => (
//               <FaStar
//                 key={i}
//                 className={i < rating ? 'star-filled' : 'star-empty'}
//               />
//             ))}
//           </div>
//                </div>

//         <h3 className="review-title">{header}</h3>
//         {projectName && (
//           <span className="project-name" title={projectName}>
//             {projectName}
//           </span>
//         )}
//         <p className="review-text">{comment}</p>

//         <div className="review-footer">
//           <div className="reviewer-info">
//             {
//               <div className="reviewer-initials" title={clientName}>
//                 {initials}
//               </div>
//             }
//             <span className="reviewer-name">{clientName || 'Anonymous'}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function ReviewsGrid({ reviews }) {
//   return (
//     <div className="reviews-grid">
//       {reviews.map((review, index) => (
//         <ReviewCard key={index} {...review} />
//       ))}
//     </div>
//   );
// }
