import React, { useEffect, useState, useRef } from "react";
import "./NotificationModal.css";

const NotificationModal = ({ token, show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef();

  useEffect(() => {
    if (show) {
      setLoading(true);
      setError(null);
      fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Error fetching: ${res.status}`);
          return res.json();
        })
        .then(data => setNotifications(data.notifications))
        .catch(e => {
          setNotifications([]);
          setError(e.message);
        })
        .finally(() => setLoading(false));
    }
  }, [show, token]);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/mark-all-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      console.error("Failed to mark all as read");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="notif-modal-overlay">
      <div className="notif-modal" ref={modalRef}>
        <div className="notif-header">
          <h3>Notification Alerts</h3>
          <button className="mark-read-btn" onClick={markAllAsRead}>Mark all as read</button>
          <button className="notif-close-btn" onClick={onClose}>✕</button>
        </div>
        {loading && <div className="notif-loading">Loading notifications...</div>}
        {error && <div className="notif-error">{error}</div>}
        {!loading && notifications.length === 0 && <p className="notif-empty">No notifications</p>}
        <div className="notif-list">
          {notifications.map(n => (
            <div key={n._id} className={`notif-card${!n.read ? " unread" : ""}`}>
              <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
              <div>{n.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;





// import React, { useEffect, useState, useRef } from "react";

// const NotificationModal = ({ token, show, onClose }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const modalRef = useRef();

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/notifications", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setNotifications(data.notifications);
//     } catch (error) {
//       setNotifications([]);
//       console.error("Failed to fetch notifications", error);
//     }
//     setLoading(false);
//   };

//   // Mark notification as read
//   const markAsRead = async (notifId) => {
//     try {
//       await fetch(`/api/notifications/${notifId}/read`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotifications((prev) =>
//         prev.map((n) =>
//           n._id === notifId
//             ? {
//                 ...n,
//                 read: true,
//               }
//             : n
//         )
//       );
//     } catch (error) {
//       console.error("Failed to mark notification as read", error);
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       await Promise.all(
//         notifications.filter((n) => !n.read).map((n) =>
//           fetch(`/api/notifications/${n._id}/read`, {
//             method: "POST",
//             headers: { Authorization: `Bearer ${token}` },
//           })
//         )
//       );
//       setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     } catch (error) {
//       console.error("Failed to mark all as read", error);
//     }
//   };

//   useEffect(() => {
//     if (show) {
//       fetchNotifications();
//     }
//   }, [show]);

//   useEffect(() => {
//     // Close modal when clicking outside
//     function handleClickOutside(event) {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     }
//     if (show) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [show, onClose]);

//   if (!show) return null;

//   return (
//     <div className="notif-modal-overlay">
//       <div className="notif-modal" ref={modalRef}>
//         <div className="notif-header">
//           <h3>Notification Alerts</h3>
//           <button className="mark-read-btn" onClick={markAllAsRead}>
//             Mark all as read
//           </button>
//         </div>

//         {loading ? (
//           <div className="notif-loading">Loading...</div>
//         ) : notifications.length === 0 ? (
//           <p className="notif-empty">No notifications</p>
//         ) : (
//           <div className="notif-list">
//             {notifications.map((n) => (
//               <div
//                 key={n._id}
//                 className={`notif-card ${n.read ? "" : "unread"}`}
//                 onClick={() => markAsRead(n._id)}
//               >
//                 <div className="notif-time">
//                   {Math.floor((Date.now() - new Date(n.created_at)) / 1000)}{" "}
//                   second(s) ago ({new Date(n.created_at).toLocaleString()})
//                 </div>
//                 <p>{n.message}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationModal;
