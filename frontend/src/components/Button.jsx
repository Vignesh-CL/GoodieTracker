function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
