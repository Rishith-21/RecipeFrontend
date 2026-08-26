import React, { useState, useEffect, useRef } from "react";
import "./Community.css";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const DEFAULT_AVATAR = "https://i.imgur.com/6VBx3io.png";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const getVideoUrl = (media) => (media && (media.endsWith(".mp4") || media.endsWith(".webm")));

function Community() {
  const [posts, setPosts] = useState([]);
  const [expandedIds, setExpandedIds] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const API_BASE_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const inputFileRef = useRef();

  useEffect(() => {
    setUserId(localStorage.getItem("userId") || "");
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/community/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Posts data:", data.posts); // Debug log
          setPosts(data.posts || []);
        }
      })
      .catch(err => console.error("Fetch posts error:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const addPost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    setLoading(true);
    
    try {
      let requestOptions = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      };

      if (mediaFile) {
        // Use FormData for posts with images
        const formData = new FormData();
        formData.append('title', newPostTitle.trim());
        formData.append('body', newPostBody.trim());
        formData.append('image', mediaFile);
        requestOptions.body = formData;
        // Don't set Content-Type, let browser set it with boundary
      } else {
        // Use JSON for text-only posts
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify({
          title: newPostTitle.trim(),
          body: newPostBody.trim()
        });
      }

      const endpoint = mediaFile ? 
        `${API_BASE_URL}/community/posts/upload` : 
        `${API_BASE_URL}/community/posts`;
      const response = await fetch(endpoint, requestOptions);
      
      const data = await response.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewPostTitle(""); 
        setNewPostBody(""); 
        setMediaFile(null); 
        setMediaPreview(null); 
        setShowModal(false);
      }
    } catch (err) { 
      console.error("Add post error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleExpand = (postId) => {
    setExpandedIds(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addComment = (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    fetch(`${API_BASE_URL}/community/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosts(posts.map(post => (post.id === postId ? data.post : post)));
          setCommentTexts({ ...commentTexts, [postId]: "" });
        }
      })
      .catch((err) => console.error("Add comment error:", err));
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditBody("");
  };

  const saveEdit = async (postId) => {
    if (!editTitle.trim() || !editBody.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => post.id === postId ? data.post : post));
        cancelEdit();
      }
    } catch (err) {
      console.error("Edit post error:", err);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  const toggleLike = (postId) => {
    fetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosts(posts.map(post => post.id === postId ? { ...post, like_count: data.like_count } : post));
        }
      })
      .catch((err) => console.error("Toggle like error:", err));
  };

  const isAuthor = (post) => post.author === userId;

  const hasLiked = (post) => post.likes && userId && post.likes.includes(userId);

  return (
    <div className="community-container">
      <h2 className="community-header">Community Posts</h2>
      {posts.length === 0 && <p>No posts available. Be the first to post!</p>}
      {posts.map((post) => (
        <div key={post.id} className="yt-post-card">
          <div className="yt-post-header">
            <img
              src={post.author_avatar || DEFAULT_AVATAR}
              alt="avatar"
              className="yt-avatar"
            />
            <div className="yt-user-meta">
              <span className="yt-username">{post.author_name}</span>
              <span className="yt-time">
                {formatDate(post.created_at)}
                {isAuthor(post) && post.created_at !== post.updated_at && (
                  <span className="yt-edited">(edited)</span>
                )}
              </span>
            </div>
            {isAuthor(post) && (
              <div className="yt-post-options">
                <button 
                  className="yt-edit-btn" 
                  title="Edit post"
                  onClick={() => startEdit(post)}
                >
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button 
                  className="yt-delete-btn" 
                  title="Delete post"
                  onClick={() => deletePost(post.id)}
                >
                  <span role="img" aria-label="delete">🗑️</span>
                </button>
              </div>
            )}
          </div>
          <div className="yt-post-content">
            {editingPostId === post.id ? (
              <div className="yt-edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="yt-edit-title"
                  placeholder="Post title..."
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="yt-edit-body"
                  placeholder="Post content..."
                  rows={4}
                />
                <div className="yt-edit-actions">
                  <button 
                    onClick={() => saveEdit(post.id)}
                    className="yt-save-btn"
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="yt-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="yt-post-title">{post.title}</h3>
                <div className="yt-post-author">
                  Posted By {post.author_name || post.author || "Unknown User"}
                  {console.log("Post data:", post)} {/* Debug log */}
                </div>
                <div className="yt-post-text">{post.body}</div>
                {post.image && (
                  <img src={post.image} alt="Post content" className="yt-post-media" />
                )}
              </>
            )}
          </div>
          <div className="yt-post-actions">
            <button className="yt-action-btn" onClick={() => toggleLike(post.id)} title={hasLiked(post) ? "Unlike" : "Like"}>
              {hasLiked(post) ? <AiFillHeart color="red" size={20} /> : <AiOutlineHeart size={20} />}
              <span>{post.like_count || 0}</span>
            </button>
            <button className="yt-action-btn" onClick={() => toggleExpand(post.id)} title="Comments">
              💬 <span>{post.comments?.length || 0}</span>
            </button>
          </div>
          {expandedIds[post.id] && (
            <div className="yt-comments-section">
              {post.comments?.length ? (
                post.comments.map(comm => (
                  <div key={comm.id || comm.created_at} className="yt-comment-row">
                    <img
                      src={comm.author_avatar || DEFAULT_AVATAR}
                      className="yt-comment-avatar"
                      alt="avatar"
                    />
                    <div>
                      <span className="yt-comment-username">{comm.author_name}</span>
                      <span className="yt-comment-text">{comm.text}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="yt-comment yt-no-comments">No comments yet. Be the first!</div>
              )}
              <div className="yt-comment-row yt-comment-self">
                <img src={post.author_avatar || DEFAULT_AVATAR} alt="avatar" className="yt-avatar" />
                <input
                  type="text"
                  className="yt-comment-input"
                  placeholder="Add comment..."
                  value={commentTexts[post.id] || ""}
                  onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="yt-comment-btn"
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button className="fab" title="Add Post" onClick={() => setShowModal(true)}>+</button>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="new-post-card">
          <div className="modal-header">
            <h3>Create New Post</h3>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <input
              type="text"
              className="new-post-input"
              placeholder="What's your post about?"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              disabled={loading}
            />
            
            <textarea
              placeholder="Share your culinary story..."
              className="new-post-textarea"
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              rows={4}
              disabled={loading}
            />
            
            <div className="file-upload-section">
              <label htmlFor="file-upload" className="file-upload-label">
                📷 Add Photo
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                ref={inputFileRef}
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </div>
            
            {mediaPreview && (
              <div className="preview-container">
                <img src={mediaPreview} alt="preview" className="preview-image" />
                <button 
                  className="remove-preview" 
                  onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                >
                  ×
                </button>
              </div>
            )}
            
            <button
              className="new-post-btn"
              onClick={addPost}
              disabled={loading || (!newPostTitle.trim() && !newPostBody.trim())}
            >
              {loading ? "Posting..." : "Share Post"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Community;
