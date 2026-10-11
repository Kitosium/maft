type P = { className?: string; style?: React.CSSProperties };

type SP = P & { d: React.ReactNode; fill?: string };

const S = ({ d, className, fill, style }: SP): React.ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill={fill ?? "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "w-5 h-5"}
    style={style}
    aria-hidden="true"
  >
    {d}
  </svg>
);

export const IcSearch = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.6-3.6" />
      </>
    }
  />
);

export const IcSun = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        <path d="M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4" />
        <path d="M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </>
    }
  />
);

export const IcMoon = (p: P): React.ReactElement => (
  <S
    {...p}
    d={<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />}
  />
);

export const IcGrid = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    }
  />
);

export const IcList = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
      </>
    }
  />
);

export const IcCopy = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    }
  />
);

const STAR =
  "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z";

export const IcStar = ({
  filled,
  ...p
}: P & { filled?: boolean }): React.ReactElement => (
  <S {...p} fill={filled ? "currentColor" : "none"} d={<path d={STAR} />} />
);

export const IcEdit = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    }
  />
);

export const IcTrash = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </>
    }
  />
);

export const IcPlus = (p: P): React.ReactElement => (
  <S {...p} d={<path d="M12 5v14M5 12h14" />} />
);

export const IcHome = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>
    }
  />
);

const HEART =
  "M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z";

export const IcHeart = ({
  filled,
  ...p
}: P & { filled?: boolean }): React.ReactElement => (
  <S {...p} fill={filled ? "currentColor" : "none"} d={<path d={HEART} />} />
);

export const IcClock = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    }
  />
);

export const IcChevron = (p: P): React.ReactElement => (
  <S {...p} d={<path d="M9 6l6 6-6 6" />} />
);

export const IcArrow = (p: P): React.ReactElement => (
  <S {...p} d={<path d="M4 12h15M13 6l6 6-6 6" />} />
);

export const IcMenu = (p: P): React.ReactElement => (
  <S {...p} d={<path d="M4 7h16M4 12h16M4 17h16" />} />
);

export const IcX = (p: P): React.ReactElement => (
  <S {...p} d={<path d="M6 6l12 12M18 6L6 18" />} />
);

export const IcBulb = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <path d="M9 18h6M10 21h4" />
        <path
          d={
            "M12 3a6 6 0 0 0-3.5 10.8c.6.5.9 1.2.9 1.9v.3h5.2v-.3c0-.7 " +
              ".3-1.4.9-1.9A6 6 0 0 0 12 3z"
          }
        />
      </>
    }
  />
);

export const IcCalendar = (p: P): React.ReactElement => (
  <S
    {...p}
    d={
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    }
  />
);
