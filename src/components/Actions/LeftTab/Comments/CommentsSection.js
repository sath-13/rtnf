import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { message } from "antd";
import { fetchComments, createComment, deleteComment } from "../../../../../src/api/commentapi";
import { getUsersInWorkspace } from "../../../../api/usersapi";
import "./CommentsSection.css";
import { CommentMessages } from "../../../../constants/constants";
import { MdOutlineDelete, MdOutlineDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { toastError, toastSuccess } from "../../../../Utility/toast";


{/* <ToastContainer /> */ }

const formatDate = (timestamp) => {
  const dateObj = new Date(timestamp);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(2);
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const CommentsSection = ({
  onCommentChange,
  actionId,
  workspaceName,
  loggedInUser,
  loggedInUserName,
  disabled,
  userRole,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});
  const [mentionUsers, setMentionUsers] = useState([]);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [activeMentionIndex, setActiveMentionIndex] = useState(-1);
  const [mentionBoxStyle, setMentionBoxStyle] = useState({});
  const [mentionContext, setMentionContext] = useState({ type: null, commentId: null });
  const commentEndRef = useRef(null);

  const scrollToBottom = () => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCommentInputChange = (e) => {
    const value = e.target.value;
    setNewComment(value);
    setMentionContext({ type: "comment", commentId: null });
    handleMentionSuggestions(value);
  };

  const handleReplyInputChange = (commentId, e) => {
    const value = e.target.value;
    setReplyText({ ...replyText, [commentId]: value });
    setMentionContext({ type: "reply", commentId });
    handleMentionSuggestions(value);
  };

  const handleMentionSuggestions = (inputText) => {
    const mentionTrigger = inputText.lastIndexOf("@");
    if (mentionTrigger !== -1) {
      const query = inputText.slice(mentionTrigger + 1);
      if (query.length > 0) {
        const suggestions = mentionUsers.filter((user) =>
          user.display.toLowerCase().includes(query.toLowerCase())
        );
        setMentionSuggestions(suggestions);
        setActiveMentionIndex(0);
      } else {
        setMentionSuggestions([]);
      }
    } else {
      setMentionSuggestions([]);
    }
  };


  const handleMentionSelection = (user, type, commentId = null) => {
    const mentionTrigger = type === "comment" ? newComment.lastIndexOf("@") : replyText[commentId].lastIndexOf("@");
    const newText = type === "comment"
      ? newComment.slice(0, mentionTrigger) + "@" + user.display + " "
      : replyText[commentId].slice(0, mentionTrigger) + "@" + user.display + " ";

    if (type === "comment") {
      setNewComment(newText);
    } else {
      setReplyText({ ...replyText, [commentId]: newText });
    }
    setMentionSuggestions([]);
  };

  useEffect(() => {
    if (workspaceName) {
      getUsersInWorkspace(workspaceName)
        .then((data) => {
          const formattedUsers = data.map((user) => ({
            id: user._id,
            display: user.fname ? `${user.fname} ${user.lname}` : user.name,
          }));
          setMentionUsers(formattedUsers);
        })
        .catch((err) => console.error(CommentMessages.USER_MENTION_ERR, err));
    }
  }, [workspaceName]);

  useEffect(() => {
    if (actionId) {
      fetchComments(actionId)
        .then((data) => {
          setComments(data);
          scrollToBottom();
        })
        .catch((err) => {
          console.error(CommentMessages.COMMENT_FETCH_ERR, err);
          // message.error(CommentMessages.COMMENT_LOAD_ERR);
          toastError({ title: "Error", description: CommentMessages.COMMENT_LOAD_ERR });
        });
    }
  }, [actionId]);

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const commentData = {
        actionId,
        workspaceName,
        description: newComment,
        createdBy: loggedInUser,
        createdByName: loggedInUserName,
        role: userRole,
        parentComment: null,
      };
      const savedComment = await createComment(commentData);
      setComments([
        ...comments,
        { ...savedComment, createdByName: loggedInUserName, replies: [] },
      ]);
      setNewComment("");
      onCommentChange?.("");
      // message.success(CommentMessages.COMMENT_ADD_SUCC);
      toastSuccess({ title: CommentMessages.COMMENT_ADD_SUCC });
      scrollToBottom();
    } catch (error) {
      console.error("Error in adding comments:", error);
      // message.error(CommentMessages.COMMENT_ADD_ERR);
      toastError({ title: CommentMessages.COMMENT_ADD_ERR });
    }
  };

  const handleAddReply = async (commentId) => {
    const reply = replyText[commentId];
    if (!reply || reply.trim() === "") return;
    try {
      const replyData = {
        actionId,
        workspaceName,
        description: reply,
        createdBy: loggedInUser,
        createdByName: loggedInUserName,
        role: userRole,
        parentComment: commentId,
      };
      const savedReply = await createComment(replyData);
      const updatedComments = comments.map((comment) =>
        comment._id === commentId
          ? {
            ...comment,
            replies: [...(comment.replies || []), { ...savedReply, createdByName: loggedInUserName }],
          }
          : comment
      );
      setComments(updatedComments);
      setReplyText({ ...replyText, [commentId]: "" });
      setShowReply({ ...showReply, [commentId]: false });
      // message.success(CommentMessages.REPLY_ADD_SUCC);
      toastSuccess({ title: CommentMessages.REPLY_ADD_SUCC });
    } catch (error) {
      console.error("Error in adding replies:", error);
      // message.error(CommentMessages.REPLY_ADD_ERR);
      toastError({ title: CommentMessages.REPLY_ADD_ERR });
    }
  };


  const handleDeleteComment = (commentId) => {
    toast.info(({ closeToast }) => (
      <div>
        <p><strong>Are you sure you want to delete this comment?</strong></p>
        <div className="flex justify-end gap-[10px] mt-[10px]">
          <button
            onClick={() => {
              confirmDeleteComment(commentId);
              closeToast();
            }}
            className="bg-red-500 text-white border-0 px-[10px] py-[5px] rounded cursor-pointer"
          >
            Yes
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-500 text-white border-0 px-[10px] py-[5px] rounded cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    ), {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false
    });
  };




  const confirmDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      const updatedComments = comments.filter(comment => comment._id !== commentId);
      setComments(updatedComments);
      // toast.success("Comment deleted successfully.");
      toastSuccess({ title: "Success", description: "Comment deleted successfully." });
    } catch (error) {
      // toast.error("Failed to delete comment. Please try again.");
      toastError({ title: "Error", description: "Failed to delete comment. Please try again." });
      console.error("Delete comment error:", error);
    }
  };




  return (
    <div className="comments-section-container">
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-header">
              <p className="comment-text">
                <strong>{comment.createdByName}:</strong> <br />
                {comment.description}
              </p>

              {/* Time + Delete aligned bottom right */}
              <div className="comment-footer flex justify-between items-center mt-[5px]">
                <span className="comment-time">{formatDate(comment.createdAt)}</span>
                <button
                  className="delete-button ml-auto"
                  onClick={() => handleDeleteComment(comment._id)}
                  disabled={disabled}
                >
                  <MdOutlineDelete />
                </button>
              </div>
            </div>

            <div className="replies-list">
              {comment.replies?.map((reply) => (
                <div key={reply._id} className="reply-item">
                  <div className="comment-header">
                    <p className="reply-text">
                      <b>{reply.createdByName}:</b><br />
                      {reply.description}
                    </p>
                    <div className="comment-footer flex justify-between items-center mt-2">
                      <span className="comment-time">{formatDate(reply.createdAt)}</span>
                      <button
                        className="delete-button ml-auto"
                        onClick={() => handleDeleteComment(reply._id)}
                        disabled={disabled}
                      >
                        <MdOutlineDelete />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reply-section">
              {showReply[comment._id] ? (
                <div className="reply-input-container">
                  <textarea
                    value={replyText[comment._id] || ""}
                    onChange={(e) => handleReplyInputChange(comment._id, e)}
                    placeholder="Write a reply..."
                    disabled={disabled}
                    className="reply-mentions"
                  />
                  <button
                    onClick={() => handleAddReply(comment._id)}
                    className="send-button"
                  >
                    <AiOutlineSend size={18} />
                  </button>
                </div>
              ) : (
                <span
                  className="reply-link"
                  onClick={() => setShowReply({ ...showReply, [comment._id]: true })}
                >
                  Reply
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={commentEndRef} />
      </div>

      <div className="main-comment-input">
        <textarea
          value={newComment}
          onChange={handleCommentInputChange}
          placeholder="Add a comment..."
          disabled={disabled}
          className="mentions"
        />
        <button
          disabled={disabled || !actionId}
          onClick={handleAddComment}
          className="send-button main-send"
        >
          <AiOutlineSend size={18} />
        </button>
      </div>
      {mentionSuggestions.length > 0 && (
        <div className="mention-suggestions">
          {mentionSuggestions.map((user, index) => (
            <div
              key={user.id}
              className={`mention-suggestion ${index === activeMentionIndex ? "active" : ""}`}
              onClick={() =>
                handleMentionSelection(user, mentionContext.type, mentionContext.commentId)
              }
            >
              {user.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
