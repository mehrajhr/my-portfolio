export function PortfolioLoader() {
  return <div className="portfolio-loader" role="status" aria-live="polite" aria-label="Loading portfolio">
    <div className="loader-emblem"><span>MHR</span><i/><b/></div>
    <p className="loader-kicker">MEHRAJ HASAN RIAJ</p>
    <p className="loader-caption">Preparing the portfolio</p>
    <div className="loader-track" aria-hidden="true"><span/></div>
  </div>;
}
