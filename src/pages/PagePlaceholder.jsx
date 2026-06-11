import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const PagePlaceholder = ({ title, description, note, ctaText = "Back to home", ctaLink = "/" }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full rounded-[2rem] border border-[#e5e7eb] bg-white p-10 shadow-[0_40px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
          Coming soon
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-950 sm:text-5xl">{title}</h1>
            <p className="mt-6 text-base leading-8 text-stone-600 sm:text-lg">{description}</p>
            {note && (
              <p className="mt-6 text-sm text-stone-500 border-l-2 border-brand-400 pl-4">
                {note}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to={ctaLink}
                className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-500"
              >
                {ctaText}
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-brand-300 hover:text-brand-600"
              >
                Back to landing
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">What this page will include</p>
              <ul className="mt-4 space-y-3 text-sm text-stone-600">
                <li>• Deep integration with the existing recruiter templates</li>
                <li>• Clear step-by-step guidance for each workflow</li>
                <li>• Live interaction patterns that match your dashboard experience</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-brand-200/40 bg-brand-50 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-700">Why it’s better</p>
              <p className="mt-4 text-sm text-brand-900 leading-7">
                This route keeps your product map intact while giving users a polished landing experience for the next feature launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PagePlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  note: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
};

export default PagePlaceholder;
