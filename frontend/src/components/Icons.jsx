const common = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconCart = (props) => (
  <svg {...common} {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
  </svg>
);

export const IconAdmin = (props) => (
  <svg {...common} {...props}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" />
    <path d="m9.5 12 1.8 1.8L15 10" />
  </svg>
);

export const IconLogout = (props) => (
  <svg {...common} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconPackage = (props) => (
  <svg {...common} {...props}>
    <path d="m21 8-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconReceipt = (props) => (
  <svg {...common} {...props}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconWallet = (props) => (
  <svg {...common} {...props}>
    <path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
    <path d="M16 5H6a2 2 0 0 0-2 2v1h16" />
    <circle cx="17" cy="14" r="1.4" />
  </svg>
);

export const IconAlert = (props) => (
  <svg {...common} {...props}>
    <path d="M10.3 3.6 1.9 18a1.6 1.6 0 0 0 1.4 2.4h17.4a1.6 1.6 0 0 0 1.4-2.4L13.7 3.6a1.6 1.6 0 0 0-2.8 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconEdit = (props) => (
  <svg {...common} {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconTrash = (props) => (
  <svg {...common} {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconPlus = (props) => (
  <svg {...common} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = (props) => (
  <svg {...common} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconClock = (props) => (
  <svg {...common} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
