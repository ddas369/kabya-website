import Reveal from "./ui/Reveal.jsx";

export default function DownloadCTA({ playStoreUrl, apkUrl, apkFileName }) {
  const hasLinks = Boolean(playStoreUrl || apkUrl);

  return (
    <section id="download" className="bg-gold py-20">
      <div className="container-page flex flex-col items-center text-center">
        <Reveal variant="scale" className="flex flex-col items-center">
          <h2 className="max-w-lg text-3xl font-medium leading-tight text-ink sm:text-4xl">
            Start reading and writing Assamese without missing a word.
          </h2>

          {hasLinks ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {playStoreUrl && (
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-semibold text-parchment transition-transform hover:scale-[1.03]"
                >
                  Get it on Google Play
                </a>
              )}
              {apkUrl && (
                <a
                  href={apkUrl}
                  className="rounded-full border border-ink/30 px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
                >
                  Download APK{apkFileName ? ` (${apkFileName})` : ""}
                </a>
              )}
            </div>
          ) : (
            <p className="mt-6 text-[15px] font-medium text-ink/70">
              Download links are coming soon - check back shortly.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
