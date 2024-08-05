import React from 'react';
import './style.scss';

type HighlightedTextProps = {
  name: string;
  search: string;
};

const HighlightedText: React.FC<HighlightedTextProps> = ({ name, search }) => {
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = name ? name.split(regex) : [];
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={index} className={'highlighted-text'}>
        {part}
      </span>
    ) : (
      part
    ),
  );
};

export default HighlightedText;
