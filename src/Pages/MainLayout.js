import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import NotificationModal from "./NotificationModal";

function MainLayout({ userPhoto, unreadCount, setShowNotificationModal, onLogout, navigate }) {
  return (
    <>
      <Header
        userPhoto={userPhoto}
        unreadCount={unreadCount}
        setShowNotificationModal={setShowNotificationModal}
        onLogout={onLogout}
        navigate={navigate}
      />
      <main>
        <Outlet />
      </main>
      <NotificationModal
        token={token}
        show={setShowNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
}

export default MainLayout;
