import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css'
export const DeleteModal = ({ isOpen, onClose, onDelete, teamName }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <h2>Are you sure you want to delete the team "{teamName}"?</h2>
        <p>This action cannot be undone. This will permanently delete the team and all associated data.</p>
        <div className="delete-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onDelete} className="danger">Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
};