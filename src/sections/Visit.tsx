import { ArrowIcon, ClockIcon, InstaIcon, PinIcon, WhatsIcon } from "@/components/Icons";
import { SITE } from "@/data/site";

const { lat, lng } = SITE.geo;
const BBOX = [lng - 0.008, lat - 0.005, lng + 0.008, lat + 0.005].join("%2C");
const MAP = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${lat}%2C${lng}`;

/** "Visite a gente": cartão com endereço e horários ao lado do mapa. */
export default function Visit() {
  return (
    <section id="visite" className="visit" aria-labelledby="visit-title">
      <div className="visit__card">
        <div className="visit__info">
          <h2 id="visit-title" className="visit__title">
            Visite
            <em className="serif">a gente</em>
          </h2>

          <div className="visit__block">
            <PinIcon />
            <p>
              <b>{SITE.address.street}</b>
              <br />
              {SITE.address.neighborhood} · {SITE.address.city}, {SITE.address.state}
            </p>
          </div>

          <div className="visit__block">
            <ClockIcon />
            <ul>
              {SITE.hours.map((h) => (
                <li key={h.days}>
                  <span>{h.days}</span>
                  <b>{h.time}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className="visit__ctas">
            <a className="btn btn--deep" href={SITE.maps} target="_blank" rel="noopener noreferrer">
              Como chegar <ArrowIcon width={18} height={18} />
            </a>
            <a className="btn btn--line" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsIcon width={18} height={18} /> Reservar
            </a>
            <a className="btn btn--line" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              <InstaIcon width={18} height={18} /> {SITE.instagramHandle}
            </a>
          </div>
        </div>

        <div className="visit__map">
          <iframe title="Mapa: Brasa Burger em Pinheiros" src={MAP} loading="lazy" referrerPolicy="no-referrer" />
        </div>
      </div>
    </section>
  );
}
