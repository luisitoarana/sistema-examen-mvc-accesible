import React from 'react';

export function StatusTile({ icon, title, text }) {
  return (
    <article className="status-tile">
      <span aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </article>
  );
}
