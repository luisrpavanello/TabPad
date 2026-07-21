import { useLocation } from "react-router-dom";
import seoContent from "@/seo-content.json";
import Editor from "@/Editor";

type SeoEntry = {
  title: string;
  lead: string;
  sections: Array<{ heading: string; text: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

function normalizedPath(pathname: string) {
  return pathname === "/" ? "/" : `${pathname.replace(/\/$/, "")}/`;
}

export function SeoContent() {
  const { pathname } = useLocation();
  const entry = (seoContent as Record<string, SeoEntry>)[
    normalizedPath(pathname)
  ];

  if (!entry) return null;

  return (
    <article className="border-t border-border bg-muted/20 py-12">
      <div className="container mx-auto max-w-4xl space-y-8 px-4">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {entry.title}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {entry.lead}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {entry.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <p className="leading-7 text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
        <section className="space-y-4" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-semibold">
            FAQ
          </h2>
          <div className="space-y-4">
            {entry.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-md border bg-background p-4"
              >
                <summary className="cursor-pointer font-medium">
                  {faq.question}
                </summary>
                <p className="pt-3 leading-7 text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

export default function EditorPage() {
  return (
    <>
      <Editor />
      <SeoContent />
    </>
  );
}
