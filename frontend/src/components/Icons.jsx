// Small hand-picked line-icon set, drawn to fit the spring/garden theme.
// Kept as simple inline SVGs so the app has zero icon-library dependency.

export const IconSplitPay = (props) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="20" cy="20" r="20" fill="#EFF3E4" />
    <path d="M20 30V19" stroke="#397A4A" strokeWidth="2.2" strokeLinecap="round" />
    <path
      d="M20 19c0-5 -4-8-9-8 0 5 4 9 9 9"
      fill="#8FCB9B"
      stroke="#397A4A"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M20 21c0-6 4.5-9.5 10-9.5 0 5.6-4.5 10-10 9.5"
      fill="#4F9E63"
      stroke="#397A4A"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <ellipse cx="20" cy="31.5" rx="6.5" ry="1.7" fill="#E7DAB6" />
  </svg>
)

export const IconDashboard = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3.5" y="3.5" width="7.5" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13" y="3.5" width="7.5" height="5.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13" y="11.5" width="7.5" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3.5" y="14.5" width="7.5" height="6" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

export const IconPlusCircle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8.5v7M8.5 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const IconScale = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 3v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M5 8h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2.5 8L5 14.5c1.7 1.6 4 1.6 5.5 0L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 8l2.5 6.5c1.7 1.6 4 1.6 5.5 0L21.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8.5 20.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const IconHistory = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3.2 3.5v4.3h4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconHandshake = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M2.5 11.5l3.8-3.4a2 2 0 0 1 2.6-.05L11 9.7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.5 11.5l-3.8-3.4a2 2 0 0 0-2.6-.05L13 9.7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.3 12.2l3.3 3.1a1.8 1.8 0 0 0 2.5 0l0.4-.4a1.6 1.6 0 0 0 0-2.3l-2.7-2.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.7 12.2l-3.3 3.1a1.8 1.8 0 0 1-2.5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2.5 11.5l2 5.2 2-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 11.5l-2 5.2-2-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconWallet = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="3" y="8" width="18" height="11.5" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16" cy="13.7" r="1.4" fill="currentColor" />
  </svg>
)

export const IconArrowRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 12h15.5M14 5.5L20.5 12L14 18.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconLeafBadge = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M4 20c8-1 13-6.5 14-15.5C9 5.5 4.5 10 4 20Z"
      fill="#DCEEDC"
      stroke="#397A4A"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M6.5 17.5C9 13.8 12 11 16.5 8.7" stroke="#397A4A" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

export const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.5 12.3l2.3 2.3 4.7-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconMenu = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export const IconClose = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const IconReceipt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M6 3.5h12v17l-2.2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 20.5v-17Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export const IconEmptyPot = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M30 45h40l-4 30a6 6 0 0 1-6 5H40a6 6 0 0 1-6-5l-4-30Z" fill="#F3B585" stroke="#B5622A" strokeWidth="1.6" />
    <rect x="26" y="38" width="48" height="9" rx="4" fill="#F6D668" stroke="#B5622A" strokeWidth="1.4" />
    <path d="M50 38c-4-8-2-15 4-19-1 7 1 13 6 17" stroke="#397A4A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M50 38c2-7 8-11 15-11-2 6-6 10-11 12" fill="#8FCB9B" stroke="#397A4A" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)
