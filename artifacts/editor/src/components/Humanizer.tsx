import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Cloud,
  Clipboard,
  Cpu,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useI18n, type Locale } from "@/i18n";
import {
  getBrowserAiSupport,
  humanizeInBrowser,
  type BrowserProgress,
} from "@/lib/browser-humanizer";
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
    device: string;
    cloud: string;
    private: string;
    fast: string;
    downloadNotice: string;
    unsupported: string;
    fallback: string;
    auto: string;
    processing: string;
    localError: string;
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
    device: "On this device",
    cloud: "In the cloud",
    private: "Private · Qwen 3.5 2B",
    fast: "Faster · Gemini / Groq",
    downloadNotice:
      "First use downloads about 1–2 GB and stores it in your browser.",
    unsupported: "WebGPU is unavailable or this device has limited memory.",
    fallback: "Local processing failed; switched to the cloud automatically.",
    auto: "Automatic",
    processing: "Processing",
    localError: "Local processing failed. Your text was not sent to the cloud.",
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
    device: "Neste dispositivo",
    cloud: "Na nuvem",
    private: "Privado · Qwen 3.5 2B",
    fast: "Mais rápido · Gemini / Groq",
    downloadNotice:
      "O primeiro uso baixa cerca de 1–2 GB e armazena no navegador.",
    unsupported: "WebGPU indisponível ou dispositivo com memória limitada.",
    fallback:
      "O processamento local falhou; mudamos automaticamente para a nuvem.",
    auto: "Automático",
    processing: "Processamento",
    localError:
      "O processamento local falhou. Seu texto não foi enviado à nuvem.",
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
    device: "En este dispositivo",
    cloud: "En la nube",
    private: "Privado · Qwen 3.5 2B",
    fast: "Más rápido · Gemini / Groq",
    downloadNotice:
      "El primer uso descarga cerca de 1–2 GB y lo guarda en el navegador.",
    unsupported:
      "WebGPU no está disponible o el dispositivo tiene poca memoria.",
    fallback:
      "El procesamiento local falló; cambiamos automáticamente a la nube.",
    auto: "Automático",
    processing: "Procesamiento",
    localError:
      "El procesamiento local falló. Tu texto no fue enviado a la nube.",
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
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const support = useMemo(() => getBrowserAiSupport(), []);
  const [mode, setMode] = useState<"auto" | "device" | "cloud">("auto");
  const [browserProgress, setBrowserProgress] =
    useState<BrowserProgress | null>(null);
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
      body: JSON.stringify({ text: clean, tone, intensity, preserveMarkdown }),
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
    setBrowserProgress(null);
    setProvider(null);
    try {
      if (mode !== "cloud" && support.supported) {
        try {
          setResult(
            await humanizeInBrowser(
              clean,
              tone,
              intensity,
              preserveMarkdown,
              setBrowserProgress,
            ),
          );
          setProvider("qwen-webgpu");
          return;
        } catch {
          if (mode === "device") throw new Error(t.localError);
          setMode("cloud");
          setError(t.fallback);
        }
      }
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
          <div className="flex h-9 rounded-sm border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setMode("auto")}
              className={`flex items-center gap-1.5 rounded-sm px-2 text-xs ${mode === "auto" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Sparkles size={14} />
              {t.auto}
            </button>
            <button
              type="button"
              disabled={!support.supported}
              onClick={() => setMode("device")}
              className={`flex items-center gap-1.5 rounded-sm px-2 text-xs disabled:opacity-40 ${mode === "device" ? "bg-primary text-primary-foreground" : ""}`}
              title={support.supported ? t.private : t.unsupported}
            >
              <Cpu size={14} />
              {t.device}
            </button>
            <button
              type="button"
              onClick={() => setMode("cloud")}
              className={`flex items-center gap-1.5 rounded-sm px-2 text-xs ${mode === "cloud" ? "bg-primary text-primary-foreground" : ""}`}
              title={t.fast}
            >
              <Cloud size={14} />
              {t.cloud}
            </button>
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

      {(mode === "device" || (mode === "auto" && support.supported)) && (
        <div className="border-b bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
          {browserProgress?.status === "downloading"
            ? `${t.downloadNotice} ${browserProgress.percent}%`
            : browserProgress?.status === "generating"
              ? t.humanizing
              : t.downloadNotice}
          {browserProgress?.status === "downloading" && (
            <div className="mt-1 h-1 overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${browserProgress.percent}%` }}
              />
            </div>
          )}
        </div>
      )}
      {!support.supported && (
        <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          {t.unsupported} {t.fast}
        </div>
      )}

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
