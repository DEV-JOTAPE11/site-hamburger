const WORDS = ["Smash", "Bacon", "Cheddar inglês", "Brioche", "Onion rings", "Shakes", "Chapa quente"];

/** Faixa corrida entre as seções — a mesma do vídeo de referência. */
export default function Ticker() {
  const row = (
    <div className="ticker__row">
      {WORDS.map((w) => (
        <span key={w} className="ticker__item">
          {w}
          <img src="/img/burger-edge.webp" alt="" width={500} height={672} className="ticker__dot" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker__track">
        {row}
        {row}
      </div>
    </div>
  );
}
