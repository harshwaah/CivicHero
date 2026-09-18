import { ImageResponse } from 'next/og';

export const size = {
  width: 48,
  height: 48,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          border: '2px solid #334155',
          position: 'relative',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Internal Civic Arch */}
          <path
            d="M13 32V21C13 15.4772 17.4772 11 23 11H25C30.5228 11 35 15.4772 35 21V32"
            stroke="#64748b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Keystone beacon */}
          <path
            d="M24 10L29 18H19L24 10Z"
            fill="#34d399"
          />
          {/* Central Emerald Pillar */}
          <path
            d="M24 18V36"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Verification Crossbar */}
          <path
            d="M16 26H32"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Apex beacon dot */}
          <circle cx="24" cy="7" r="2" fill="#38bdf8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
