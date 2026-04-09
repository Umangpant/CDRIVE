import React from "react";

const AdminLayout = ({ left, right, isPanelOpen }) => {
  return (
    <div className="admin-dashboard">
      <section className="admin-left">{left}</section>
      <aside className={`admin-right ${isPanelOpen ? "open" : ""}`}>
        {right}
      </aside>
    </div>
  );
};

export default AdminLayout;
