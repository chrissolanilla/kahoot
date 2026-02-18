import React from "react";

export default function Banner({ banner, onClose }) {
  if (!banner?.text) return null;

  return (
    <div className="banner" data-type={banner.type}>
      <span>{banner.text}</span>
      <button type="button" className="banner__close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

