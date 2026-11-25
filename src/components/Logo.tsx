/** Selo oval da Brasa — o mesmo formato "pílula assada" da referência. */
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`logo${className ? ` ${className}` : ""}`} aria-label="Brasa Burger">
      <span className="logo__word">Brasa</span>
      <span className="logo__sub">burger co.</span>
    </span>
  );
}
