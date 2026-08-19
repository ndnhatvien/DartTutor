export function DartIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.7 15.4 2.6 5.9 10 2l4.3 2.1h5.1c.7 0 1.2.5 1.2 1.2 0 2.2-.7 6.3-1.4 8.8-.4 1.4-1.1 2.3-2.6 2.3-1.6.1-4.6-.5-5.3-.9l-3.1 3.1c-.3.3-.8.3-1.1 0-.2-.2-.3-.6-.3-.9v-2.7l-2.1-1.6z"
        fill="#0175C2"
      />
      <path
        d="M2.6 5.9c.1-.3.4-.6.7-.7l4.4-2.1 2.1 2.7 1.2 5.3-3.1 3.1c-1.5-.4-3.9-3-5.3-8.3z"
        fill="#00D2B8"
      />
    </svg>
  );
}

export function FlutterIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.3 2 4.2 12l3.9 3.9L18.2 2h-3.9zM4.2 12l6 6 1.6 1.6L14.3 22H18.2L9.7 13.5 4.2 12z"
        fill="#02569B"
      />
      <path d="M4.2 12l6 6 1.6 1.6 2.5 2.4H18.2L9.7 13.5 4.2 12z" fill="#45D1FD" opacity="0.6" />
    </svg>
  );
}
