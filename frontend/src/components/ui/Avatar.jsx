import React from 'react';

const Avatar = ({ src, username, size = 32, hasStory = false, storyViewed = false, onClick, className = '' }) => {
  const initials = username ? username.charAt(0).toUpperCase() : '?';

  const img = (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
      >
        {src ? (
          <img
            src={src}
            alt={username}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span
            className="text-gray-500 font-semibold select-none"
            style={{ fontSize: size * 0.4 }}
          >
            {initials}
          </span>
        )}
      </div>
    </div>
  );

  if (hasStory) {
    return (
      <div
        onClick={onClick}
        className={`flex-shrink-0 rounded-full p-0.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{
          background: storyViewed
            ? '#c7c7c7'
            : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          width: size + 4,
          height: size + 4,
        }}
      >
        <div className="bg-white rounded-full p-0.5 w-full h-full">
          <div
            className="rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center w-full h-full"
          >
            {src ? (
              <img src={src} alt={username} className="w-full h-full object-cover" />
            ) : (
              <span
                className="text-gray-500 font-semibold select-none"
                style={{ fontSize: (size - 4) * 0.4 }}
              >
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return img;
};

export default Avatar;
