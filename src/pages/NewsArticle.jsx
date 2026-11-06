import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Gauge,
  Info,
  Newspaper,
  Orbit,
  Ruler,
  Sparkles,
} from 'lucide-react';
import { fetchNewsArticle } from '../services/newsApiService';

const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' };
const NEO_CONTEXT_URL = 'https://cneos.jpl.nasa.gov/about/neo_groups.html';

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', { ...DATE_OPTIONS, timeZone: 'UTC' });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const options = {
    ...DATE_OPTIONS,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTimeZoneLabel = /^Asia\/(Kolkata|Calcutta)$/.test(localTimeZone)
    ? 'IST'
    : localTimeZone;
  return {
    utc: new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date),
    local: new Intl.DateTimeFormat('en-US', { ...options, timeZone: localTimeZone }).format(date),
    localTimeZone: localTimeZoneLabel,
  };
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return null;
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits });
}

function getMeasurements(metadata) {
  const approach = metadata.closeApproach;
  const diameterMin = formatNumber(metadata.estimatedDiameterKm?.min, 3);
  const diameterMax = formatNumber(metadata.estimatedDiameterKm?.max, 3);

  return [
    {
      label: 'Miss distance',
      value: formatNumber(approach?.missDistanceKm, 0),
      unit: 'km',
      detail: approach?.missDistanceLunar != null
        ? `${formatNumber(approach.missDistanceLunar, 1)} lunar distances`
        : null,
      icon: Orbit,
      accent: 'cyan',
    },
    {
      label: 'Relative velocity',
      value: formatNumber(approach?.velocityKmPerSecond, 2),
      unit: 'km/s',
      detail: approach?.velocityKmPerHour != null
        ? `${formatNumber(approach.velocityKmPerHour, 0)} km/h`
        : null,
      icon: Gauge,
      accent: 'violet',
    },
    {
      label: 'Estimated diameter',
      value: diameterMin && diameterMax ? `${diameterMin}–${diameterMax}` : null,
      unit: 'km',
      detail: 'NASA estimate range',
      icon: Ruler,
      accent: 'blue',
    },
    {
      label: 'Absolute magnitude (H)',
      value: formatNumber(metadata.absoluteMagnitudeH, 2),
      unit: null,
      detail: 'Brightness-based size indicator',
      icon: Sparkles,
      accent: 'fuchsia',
    },
  ].filter(measurement => measurement.value !== null);
}

function safeHttpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function getAuthor(metadata) {
  if (Array.isArray(metadata.authors) && metadata.authors.length) {
    return metadata.authors.join(', ');
  }
  return metadata.author || null;
}

function contentLabel(metadata) {
  if (metadata.contentType === 'explanation') return "NASA's explanation";
  if (metadata.contentType === 'abstract') return 'Research abstract';
  if (metadata.contentType === 'feed_excerpt') return 'Text provided in the source feed';
  return 'Article content';
}

function SectionHeading({ id, eyebrow, title, children }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="scroll-mt-28 mt-1 text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">{title}</h2>
      {children}
    </div>
  );
}

function DateTimeLabels({ time }) {
  if (!time) return null;
  return (
    <div className="mt-3 flex flex-col gap-1 text-xs leading-5 text-slate-300 sm:flex-row sm:gap-5">
      <span><span className="text-slate-500">UTC</span> · {time.utc}</span>
      <span><span className="text-slate-500">Local ({time.localTimeZone})</span> · {time.local}</span>
    </div>
  );
}

function MeasurementCard({ measurement }) {
  const Icon = measurement.icon;
  const accentClasses = {
    cyan: 'border-cyan-300/20 from-cyan-300/10 text-cyan-200',
    violet: 'border-violet-300/20 from-violet-300/10 text-violet-200',
    blue: 'border-blue-300/20 from-blue-300/10 text-blue-200',
    fuchsia: 'border-fuchsia-300/20 from-fuchsia-300/10 text-fuchsia-200',
  };
  return (
    <div className={`flex h-full min-h-36 flex-col rounded-2xl border bg-gradient-to-br ${accentClasses[measurement.accent]} to-slate-950/30 p-4 shadow-lg shadow-slate-950/20 transition duration-200 hover:-translate-y-0.5 hover:border-opacity-50 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-300">{measurement.label}</p>
        <Icon size={17} aria-hidden="true" />
      </div>
      <p className="mt-auto break-words pt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {measurement.value}
        {measurement.unit && <span className="ml-1.5 text-sm font-medium text-slate-400"> {measurement.unit}</span>}
      </p>
      {measurement.detail && <p className="mt-2 text-xs leading-5 text-slate-300">{measurement.detail}</p>}
    </div>
  );
}

function MeaningCard({ term, description }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{term}</h3>
      <p className="mt-2 text-[0.9375rem] leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setArticle(null);
    setRelated([]);
    setLoading(true);
    setError('');
    setImageFailed(false);

    fetchNewsArticle(id)
      .then(data => {
        if (!active) return;
        if (!data.success || !data.article) {
          setError(data.error || 'Article not found.');
          return;
        }
        setArticle(data.article);
        setRelated(Array.isArray(data.related) ? data.related : []);
      })
      .catch(err => {
        if (active) setError(err.message || 'Failed to load article.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const metadata = article?.metadata || {};
  const isNEO = metadata.type === 'near_earth_object';
  const sourceText = article?.content?.trim() || '';
  const summary = article?.description?.trim() || '';
  const sameText = sourceText && summary
    && sourceText.replace(/\s+/g, ' ') === summary.replace(/\s+/g, ' ');
  const wordCount = sourceText ? sourceText.split(/\s+/).filter(Boolean).length : 0;
  const measurements = isNEO ? getMeasurements(metadata) : [];
  const approachEpoch = metadata.closeApproach?.epochDateCloseApproach;
  const approachTime = Number.isFinite(approachEpoch) ? formatDateTime(approachEpoch) : null;
  const publishedDate = isNEO ? null : formatDate(article?.published_at);
  const isBrief = isNEO
    || ['launch_record', 'mission_data', 'vehicle_data', 'archive_data', 'event_record'].includes(metadata.contentType)
    || !sourceText
    || wordCount < 70;
  const referenceUrl = safeHttpsUrl(metadata.referenceUrl);
  const imageAttribution = metadata.imageAttribution;
  const author = getAuthor(metadata);
  const classification = metadata.isPotentiallyHazardous;
  const objectName = metadata.name || metadata.designation || 'This near-Earth object';
  const quickFacts = [
    metadata.objectId ? ['NASA catalog ID', metadata.objectId] : null,
    Number.isFinite(metadata.reportedCloseApproachCount)
      ? ['Close-approach records in this API response', String(metadata.reportedCloseApproachCount)]
      : null,
    typeof metadata.isSentryObject === 'boolean'
      ? ['Sentry status', metadata.isSentryObject ? 'Listed in NASA/JPL Sentry' : 'Not listed in Sentry by this record']
      : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <Link
        to="/news"
        className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/50 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-slate-800/70 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to News
      </Link>

      {loading && (
        <div role="status" className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
          Loading article…
        </div>
      )}
      {!loading && error && (
        <div role="alert" className="glass-panel rounded-2xl border border-rose-400/30 p-5 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && article && (
        <article className="news-article overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-slate-950/90 shadow-2xl shadow-black/30 ring-1 ring-white/[0.03]">
          {article.image_url && !imageFailed ? (
            <div className="relative h-48 overflow-hidden bg-slate-950 sm:h-64 lg:h-80">
              <img
                src={article.image_url}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-slate-950/10" />
              {imageAttribution && (
                <p className="absolute bottom-3 right-4 max-w-[85%] text-right text-[0.68rem] text-white/75 drop-shadow sm:bottom-5 sm:right-6">
                  {imageAttribution.credit || imageAttribution.provider}
                  {imageAttribution.provider ? ` · ${imageAttribution.provider}` : ''}
                </p>
              )}
            </div>
          ) : (
            <div className="mx-5 mt-5 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 sm:mx-8 sm:mt-7 lg:mx-12">
              <Orbit size={15} className="text-cyan-300" aria-hidden="true" />
              <span>Image unavailable</span>
            </div>
          )}

          <div className={`px-5 pb-8 sm:px-8 sm:pb-9 lg:px-12 ${article.image_url && !imageFailed ? 'pt-6 sm:pt-8' : 'pt-4 sm:pt-5'}`}>
            <header className="border-b border-slate-800/90 pb-7 sm:pb-9">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 font-medium text-cyan-200">
                  <Newspaper size={14} />
                  {article.source}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-slate-300">
                  {article.category}
                </span>
                <span className={`rounded-full border px-3 py-1.5 ${isBrief ? 'border-amber-300/20 bg-amber-300/[0.07] text-amber-200' : 'border-violet-300/20 bg-violet-300/[0.07] text-violet-200'}`}>
                  {metadata.contentType === 'abstract'
                    ? 'Research Abstract'
                    : isBrief ? 'Brief Update' : 'Source Article'}
                </span>
                {publishedDate && (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <CalendarDays size={14} />
                    {publishedDate}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-5xl scroll-mt-28 text-[2rem] font-semibold leading-[1.13] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>

              {approachTime && (
                <div className="mt-4 flex items-start gap-3 text-[0.9375rem] text-slate-300">
                  <Clock3 size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                  <div>
                    <p className="font-medium text-slate-200">Earth close-approach time</p>
                    <DateTimeLabels time={approachTime} />
                  </div>
                </div>
              )}

              {author && (
                <p className="mt-4 text-sm text-slate-400">
                  By <span className="text-slate-200">{author}</span>
                </p>
              )}
              {metadata.copyright && (
                <p className="mt-3 text-xs text-slate-400">Image credit: {metadata.copyright}</p>
              )}
            </header>

            {isNEO ? (
              <div className="space-y-6 pt-6 sm:space-y-7 sm:pt-7">
                <section className="scroll-mt-28" aria-labelledby="neo-overview-heading">
                  <SectionHeading id="neo-overview-heading" eyebrow="NASA near-Earth object record" title="Overview" />
                  <p className="mt-3 max-w-4xl text-[0.9375rem] leading-7 text-slate-300 sm:text-base sm:leading-7">
                    NASA’s NeoWs record tracks {objectName} and reports a close approach to {metadata.closeApproach?.orbitingBody || 'Earth'}. The measurements below are values returned by the NASA API; the explanatory notes are independent educational context, not an official NASA assessment.
                  </p>
                </section>

                {measurements.length > 0 && (
                  <section className="scroll-mt-28" aria-labelledby="neo-measurements-heading">
                    <SectionHeading id="neo-measurements-heading" eyebrow="Reported by NeoWs" title="Key measurements" />
                    <p className="mb-5 text-sm leading-6 text-slate-400">
                      Only measurements present in the source record are shown.
                    </p>
                    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
                      {measurements.map(measurement => (
                        <MeasurementCard key={measurement.label} measurement={measurement} />
                      ))}
                    </div>
                  </section>
                )}

                <section className="scroll-mt-28" aria-labelledby="neo-understanding-heading">
                  <SectionHeading id="neo-understanding-heading" eyebrow="Plain-language context" title="Understanding the numbers" />
                  <p className="mb-5 mt-2 text-xs text-slate-500">
                    General scientific explanations; these are not event-specific NASA findings.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MeaningCard
                      term="Miss distance"
                      description="The closest separation from Earth reported for this pass. It describes distance, not a prediction that the object will collide with Earth."
                    />
                    <MeaningCard
                      term="Relative velocity"
                      description="How fast the object is moving relative to Earth during the listed close approach."
                    />
                    <MeaningCard
                      term="Estimated diameter"
                      description="A model-based size range, not a direct measurement from a close-up image. The range reflects uncertainty in the estimate."
                    />
                    <MeaningCard
                      term="Absolute magnitude (H)"
                      description="A measure of an object's intrinsic brightness under a standard viewing geometry. It is not how bright the object appears from Earth; size estimates also depend on reflectivity."
                    />
                  </div>
                </section>

                <section className="scroll-mt-28 grid auto-rows-fr gap-4 lg:grid-cols-2">
                  <div className="flex h-full flex-col rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.07] to-slate-950/30 p-5 sm:p-6">
                    <SectionHeading id="neo-why-heading" eyebrow="Planetary defense" title="Why does this matter?" />
                    <p className="flex-1 text-[0.9375rem] leading-7 text-slate-300">
                      Repeated observations help astronomers refine near-Earth object orbits and estimate future positions. Monitoring builds a better catalog of the population and helps identify which objects, if any, need closer analysis.
                    </p>
                    <a
                      href="https://cneos.jpl.nasa.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-200 hover:text-white"
                    >
                      About NASA/JPL CNEOS <ArrowUpRight size={14} />
                    </a>
                  </div>

                  <div className="flex h-full flex-col rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-300/[0.07] to-slate-950/30 p-5 sm:p-6">
                    <SectionHeading id="neo-safety-heading" eyebrow="Context, not a prediction" title="Should we be concerned?" />
                    {classification === true && (
                      <p className="flex-1 text-[0.9375rem] leading-7 text-slate-300">
                        NASA’s API flags this object as potentially hazardous. NASA/JPL’s definition uses a minimum orbit intersection distance (MOID) of 0.05 astronomical units or less and an absolute magnitude (H) of 22 or less. It does <strong className="font-semibold text-slate-100">not</strong> mean an impact is predicted. This feed entry does not provide an impact probability, so it cannot establish an individual impact risk.
                      </p>
                    )}
                    {classification === false && (
                      <p className="flex-1 text-[0.9375rem] leading-7 text-slate-300">
                        This NASA API record does not flag the object as potentially hazardous. That classification flag alone is not a complete impact-risk assessment, and this feed entry does not provide an impact probability.
                      </p>
                    )}
                    {classification == null && (
                      <p className="flex-1 text-[0.9375rem] leading-7 text-slate-300">
                        The source record does not include a potentially hazardous classification or an impact probability. No safety conclusion can be drawn from the missing fields.
                      </p>
                    )}
                    <a
                      href={NEO_CONTEXT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-violet-200 hover:text-white"
                    >
                      NASA/JPL classification definition <ArrowUpRight size={14} />
                    </a>
                  </div>
                </section>

                {quickFacts.length > 0 && (
                  <section className="scroll-mt-28" aria-labelledby="neo-quick-facts-heading">
                    <SectionHeading id="neo-quick-facts-heading" eyebrow="At a glance" title="Quick facts" />
                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {quickFacts.map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-700/70 bg-slate-900/55 px-4 py-3">
                          <dt className="text-xs text-slate-500">{label}</dt>
                          <dd className="mt-1 break-words text-sm font-medium text-slate-100">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {related.length > 0 && (
                  <section className="scroll-mt-28" aria-labelledby="related-space-heading">
                    <SectionHeading id="related-space-heading" eyebrow="More from NASA NeoWs" title="Related space discoveries" />
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {related.map(item => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="group rounded-xl border border-slate-700/70 bg-slate-900/45 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900/80"
                        >
                          <span className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-300">{item.source}</span>
                          <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-100 group-hover:text-cyan-100">{item.title}</h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-8 pt-7 sm:pt-9">
                {summary && !sameText && (
                  <section aria-labelledby="article-overview-heading" className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.06] to-violet-400/[0.04] p-5 sm:p-6">
                    <SectionHeading id="article-overview-heading" title="Overview" />
                    <p className="text-base leading-8 text-slate-300">{summary}</p>
                  </section>
                )}

                {sourceText && (
                  <section aria-labelledby="article-content-heading">
                    <SectionHeading
                      id="article-content-heading"
                      eyebrow={metadata.contentType === 'abstract' ? 'Research' : 'From the source'}
                      title={contentLabel(metadata)}
                    >
                      {metadata.contentType === 'feed_excerpt' && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          The source feed may provide an excerpt rather than the publisher’s complete article.
                        </p>
                      )}
                      {metadata.contentType === 'abstract' && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          This is a research abstract, not the full paper.
                        </p>
                      )}
                    </SectionHeading>
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-line text-base leading-8 text-slate-300">{sourceText}</p>
                    </div>
                  </section>
                )}

                {!summary && !sourceText && (
                  <p className="rounded-2xl border border-slate-700/70 bg-slate-900/40 p-5 text-sm leading-6 text-slate-400">
                    The source did not provide additional article text for this brief update.
                  </p>
                )}
              </div>
            )}

            {metadata.type === 'research_abstract' && (metadata.authors?.length > 0 || metadata.categories?.length > 0) && (
              <section className="mx-auto mt-8 max-w-4xl border-t border-slate-800 pt-6">
                <h2 className="text-sm font-semibold text-slate-200">Research information</h2>
                {metadata.authors?.length > 0 && (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    <span className="text-slate-300">Authors:</span> {metadata.authors.join(', ')}
                  </p>
                )}
                {metadata.categories?.length > 0 && (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    <span className="text-slate-300">arXiv categories:</span> {metadata.categories.join(', ')}
                  </p>
                )}
              </section>
            )}

            {(referenceUrl || imageAttribution?.nasaId) && (
              <footer className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
                {referenceUrl && (
                  <a
                    href={referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition hover:text-cyan-200"
                  >
                    View source record <ExternalLink size={13} />
                  </a>
                )}
                {imageAttribution?.nasaId && (
                  <span className="inline-flex items-center gap-1.5">
                    <Info size={13} />
                    NASA Image Library · {imageAttribution.nasaId}
                  </span>
                )}
              </footer>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
