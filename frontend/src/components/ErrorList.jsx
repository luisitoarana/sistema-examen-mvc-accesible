import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ErrorList({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="alert alert-error" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div>
        <strong>Revisa estos datos</strong>
        <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </div>
    </div>
  );
}
