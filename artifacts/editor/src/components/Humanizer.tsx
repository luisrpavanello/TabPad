import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Cloud,
  Clipboard,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useI18n, type Locale } from "@/i18n";
import type { HumanizeTone as Tone } from "@/lib/humanizer-prompt";

type Usage = { inputTokens: number; outputTokens: number; totalTokens: number };

const copy: Record<
  Locale,
  {
    title: string;
    description: string;
    original: string;
    result: string;
    close: string;
    tones: Record<Tone, string>;
    tone: string;
    intensity: string;
    intensities: string[];
    markdown: string;
    humanize: string;
    humanizing: string;
    copy: string;
    copied: string;
    replace: string;
    empty: string;
    limit: string;
    resultPlaceholder: string;
    usage: string;
    input: string;
    output: string;
    total: string;
    chars: string;
    words: string;
    error: string;
    cloud: string;
    processing: string;
    personalize: string;
    context: string;
    contextPlaceholder: string;
    audience: string;
    audiencePlaceholder: string;
    intention: string;
    intentionPlaceholder: string;
    voiceSample: string;
    voiceSamplePlaceholder: string;
  }
> = {
  en: {
    title: "AI Humanizer",
    description: "Rewrite for a more natural rhythm while preserving meaning.",
    original: "Original text",
    result: "Humanized result",
    close: "Close humanizer",
    tones: {
      natural: "Natural",
      professional: "Professional",
      casual: "Casual",
      academic: "Academic",
    },
    tone: "Tone",
    intensity: "Intensity",
    intensities: ["Light", "Balanced", "Strong"],
    markdown: "Preserve Markdown",
    humanize: "Humanize",
    humanizing: "Humanizing…",
    copy: "Copy",
    copied: "Copied",
    replace: "Replace original",
    empty: "Enter some text first.",
    limit: "Maximum 12,000 characters.",
    resultPlaceholder: "Your result will appear here.",
    usage: "Consumption",
    input: "input",
    output: "output",
    total: "total",
    chars: "characters",
    words: "words",
    error: "Unable to humanize the text. Please try again.",
    cloud: "In the cloud",
    processing: "Processing",
    personalize: "Personalize the writing",
    context: "Context",
    contextPlaceholder: "Where will this text be used?",
    audience: "Audience",
    audiencePlaceholder: "Who will read it?",
    intention: "Intention",
    intentionPlaceholder: "What should the reader understand or feel?",
    voiceSample: "My voice (optional sample)",
    voiceSamplePlaceholder:
      "Paste a short passage genuinely written by you. The result will follow its rhythm and vocabulary.",
  },
  pt: {
    title: "Humanizador com IA",
    description: "Reescreva com ritmo mais natural sem alterar o significado.",
    original: "Texto original",
    result: "Resultado humanizado",
    close: "Fechar humanizador",
    tones: {
      natural: "Natural",
      professional: "Profissional",
      casual: "Casual",
      academic: "Acadêmico",
    },
    tone: "Tom",
    intensity: "Intensidade",
    intensities: ["Leve", "Equilibrada", "Forte"],
    markdown: "Preservar Markdown",
    humanize: "Humanizar",
    humanizing: "Humanizando…",
    copy: "Copiar",
    copied: "Copiado",
    replace: "Substituir texto original",
    empty: "Digite algum texto primeiro.",
    limit: "Máximo de 12.000 caracteres.",
    resultPlaceholder: "O resultado aparecerá aqui.",
    usage: "Consumo",
    input: "entrada",
    output: "saída",
    total: "total",
    chars: "caracteres",
    words: "palavras",
    error: "Não foi possível humanizar o texto. Tente novamente.",
    cloud: "Na nuvem",
    processing: "Processamento",
    personalize: "Personalizar a escrita",
    context: "Contexto",
    contextPlaceholder: "Onde este texto será usado?",
    audience: "Público",
    audiencePlaceholder: "Quem vai ler?",
    intention: "Intenção",
    intentionPlaceholder: "O que o leitor deve entender ou sentir?",
    voiceSample: "Minha voz (amostra opcional)",
    voiceSamplePlaceholder:
      "Cole um trecho curto realmente escrito por você. O resultado seguirá seu ritmo e vocabulário.",
  },
  es: {
    title: "Humanizador con IA",
    description:
      "Reescribe con un ritmo más natural sin alterar el significado.",
    original: "Texto original",
    result: "Resultado humanizado",
    close: "Cerrar humanizador",
    tones: {
      natural: "Natural",
      professional: "Profesional",
      casual: "Casual",
      academic: "Académico",
    },
    tone: "Tono",
    intensity: "Intensidad",
    intensities: ["Suave", "Equilibrada", "Fuerte"],
    markdown: "Conservar Markdown",
    humanize: "Humanizar",
    humanizing: "Humanizando…",
    copy: "Copiar",
    copied: "Copiado",
    replace: "Reemplazar texto original",
    empty: "Escribe algún texto primero.",
    limit: "Máximo de 12.000 caracteres.",
    resultPlaceholder: "El resultado aparecerá aquí.",
    usage: "Consumo",
    input: "entrada",
    output: "salida",
    total: "total",
    chars: "caracteres",
    words: "palabras",
    error: "No se pudo humanizar el texto. Inténtalo de nuevo.",
    cloud: "En la nube",
    processing: "Procesamiento",
    personalize: "Personalizar la escritura",
    context: "Contexto",
    contextPlaceholder: "¿Dónde se utilizará este texto?",
    audience: "Público",
    audiencePlaceholder: "¿Quién lo leerá?",
    intention: "Intención",
    intentionPlaceholder: "¿Qué debería entender o sentir el lector?",
    voiceSample: "Mi voz (muestra opcional)",
    voiceSamplePlaceholder:
      "Pega un fragmento corto escrito realmente por ti. El resultado seguirá su ritmo y vocabulario.",
  },
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

export function Humanizer({
  initialText,
  onClose,
  onReplace,
}: {
  initialText: string;
  onClose: () => void;
  onReplace: (text: string) => void;
}) {
  const { locale } = useI18n();
  const t = copy[locale];
  const [source, setSource] = useState(initialText);
  const [result, setResult] = useState("");
  const [tone, setTone] = useState<Tone>("natural");
  const [intensity, setIntensity] = useState(2);
  const [preserveMarkdown, setPreserveMarkdown] = useState(true);
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [intention, setIntention] = useState("");
  const [voiceSample, setVoiceSample] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => setSource(initialText), [initialText]);
  const stats = useMemo(
    () => ({
      sourceWords: countWords(source),
      resultWords: countWords(result),
    }),
    [source, result],
  );

  const humanizeCloud = async (clean: string) => {
    const response = await fetch(`${apiBaseUrl}/api/humanize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: clean,
        tone,
        intensity,
        preserveMarkdown,
        context: context.trim() || undefined,
        audience: audience.trim() || undefined,
        intention: intention.trim() || undefined,
        voiceSample: voiceSample.trim() || undefined,
      }),
    });
    const data = (await response.json().catch(() => null)) as {
      result?: unknown;
      usage?: unknown;
      error?: unknown;
      provider?: unknown;
    } | null;
    if (!response.ok || typeof data?.result !== "string")
      throw new Error(typeof data?.error === "string" ? data.error : t.error);
    if (data.usage && typeof data.usage === "object")
      setUsage(data.usage as Usage);
    if (typeof data.provider === "string") setProvider(data.provider);
    return data.result;
  };

  const humanize = async () => {
    const clean = source.trim();
    if (!clean) {
      setError(t.empty);
      return;
    }
    if (clean.length > 12_000) {
      setError(t.limit);
      return;
    }
    setLoading(true);
    setError("");
    setUsage(null);
    setCopied(false);
    setProvider(null);
    try {
      setResult(await humanizeCloud(clean));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section
      className="flex min-h-0 flex-1 flex-col bg-background"
      aria-labelledby="humanizer-title"
    >
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3
            id="humanizer-title"
            className="flex items-center gap-2 font-semibold"
          >
            <Sparkles size={17} className="text-primary" />
            {t.title}
          </h3>
          <p className="text-xs text-muted-foreground">{t.description}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-sm p-2 text-muted-foreground hover:bg-accent"
          aria-label={t.close}
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="grid gap-1 text-xs font-medium">
          <span>{t.processing}</span>
          <div className="flex h-9 items-center gap-1.5 rounded-sm border bg-background px-3 text-xs text-muted-foreground">
            <Cloud size={14} className="text-primary" />
            {t.cloud} · Gemini / Groq
          </div>
        </div>
        <label className="grid gap-1 text-xs font-medium">
          {t.tone}
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as Tone)}
            className="h-9 rounded-sm border bg-background px-3 text-sm"
          >
            {(Object.keys(t.tones) as Tone[]).map((value) => (
              <option key={value} value={value}>
                {t.tones[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-48 flex-1 gap-1 text-xs font-medium">
          {t.intensity}: {t.intensities[intensity - 1]}
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
            className="h-9 accent-primary"
          />
        </label>
        <label className="flex h-9 items-center gap-2 rounded-sm border bg-background px-3 text-xs">
          <input
            type="checkbox"
            checked={preserveMarkdown}
            onChange={(event) => setPreserveMarkdown(event.target.checked)}
            className="accent-primary"
          />
          {t.markdown}
        </label>
        <button
          onClick={() => void humanize()}
          disabled={loading || !source.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {loading ? t.humanizing : t.humanize}
        </button>
      </div>

      <details className="border-b bg-muted/10 px-4 py-2">
        <summary className="cursor-pointer select-none text-xs font-medium text-primary">
          {t.personalize}
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-xs font-medium">
            {t.context}
            <input
              value={context}
              onChange={(event) => setContext(event.target.value)}
              maxLength={500}
              placeholder={t.contextPlaceholder}
              className="h-9 rounded-sm border bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            {t.audience}
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              maxLength={500}
              placeholder={t.audiencePlaceholder}
              className="h-9 rounded-sm border bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            {t.intention}
            <input
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              maxLength={500}
              placeholder={t.intentionPlaceholder}
              className="h-9 rounded-sm border bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium md:col-span-3">
            {t.voiceSample}
            <textarea
              value={voiceSample}
              onChange={(event) => setVoiceSample(event.target.value)}
              maxLength={3_000}
              rows={3}
              placeholder={t.voiceSamplePlaceholder}
              className="resize-y rounded-sm border bg-background px-3 py-2 text-sm font-normal leading-relaxed"
            />
          </label>
        </div>
      </details>

      {error && (
        <div
          role="alert"
          className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <div className="flex min-h-64 flex-col border-b md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2 text-xs font-medium">
            <span>{t.original}</span>
            <span className="text-muted-foreground">
              {source.length} {t.chars} · {stats.sourceWords} {t.words}
            </span>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            maxLength={12_000}
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
        <div className="flex min-h-64 flex-col">
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2 text-xs font-medium">
            <span>{t.result}</span>
            <span className="text-muted-foreground">
              {result.length} {t.chars} · {stats.resultWords} {t.words}
            </span>
          </div>
          <textarea
            value={result}
            readOnly
            placeholder={t.resultPlaceholder}
            className="min-h-0 flex-1 resize-none bg-muted/10 p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-4 py-3">
        {(usage || provider) && (
          <p className="mr-auto text-xs text-muted-foreground">
            {provider && `${provider} · `}
            {usage &&
              `${t.usage}: ${usage.inputTokens} ${t.input} · ${usage.outputTokens} ${t.output} · ${usage.totalTokens} ${t.total}`}
          </p>
        )}
        {!usage && !provider && <span className="mr-auto" />}
        <button
          onClick={() => void copyResult()}
          disabled={!result}
          className="inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-sm disabled:opacity-40"
        >
          {copied ? <Check size={15} /> : <Clipboard size={15} />}
          {copied ? t.copied : t.copy}
        </button>
        <button
          onClick={() => onReplace(result)}
          disabled={!result}
          className="h-9 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          {t.replace}
        </button>
      </div>
    </section>
  );
}
