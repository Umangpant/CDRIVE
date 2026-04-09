import React from "react";

const AdminLoader = ({ label }) => {
  return (
    <div className="admin-state">
      <div className="admin-spinner" />
      <span>{label || "Loading..."}</span>
    </div>
  );
};

export default AdminLoader;
