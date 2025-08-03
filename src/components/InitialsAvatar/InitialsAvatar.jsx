import React from 'react';

export const InitialsAvatar = ({ name, className = '', style = {} }) => {
  const getInitials = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    return words.length === 1
      ? words[0][0].toUpperCase()
      : `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  return (
    <div
      className={`initials-avatar flex items-center justify-center bg-[#ccc] text-[#333] rounded-none w-full h-full font-bold text-[84px] ${className}`}
      style={style}
    >
      {getInitials(name)}
    </div>
  );
};

export default InitialsAvatar;
