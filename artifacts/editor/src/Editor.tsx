import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  CaseSensitive,
  ChevronDown,
  Code2,
  FilePlus,
  FolderOpen,
  Replace,
  Save,
  Search,
  Sparkles,
  WrapText,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import {
  applyTextTool,
  findMatches,
  getCursorPosition,
  replaceAllText,
  type ToolAction,
} from "@/lib/editor-tools";
import {
  finishLegacyMigration,
  loadEditorState,
  readLegacyState,
  saveEditorState,
  type PersistedEditorState,
} from "@/lib/editor-storage";
import { Humanizer } from "@/components/Humanizer";

const autosaveDelayMs = 500;
const generateId = () =>
  crypto.randomUUID?.() ??
  Math.random().toString(36).slice(2) + Date.now().toString(36);

interface Tab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
  fileHandle: FileSystemFileHandle | null;
}

type SaveStatus = "loading" | "saving" | "saved" | "error";

function createEmptyTab(title: string): Tab {
  return {
    id: generateId(),
    title,
    content: "",
    isDirty: false,
    fileHandle: null,
  };
}

function normalizeState(state: PersistedEditorState, defaultTitle: string) {
  const tabs: Tab[] = state.tabs
    .filter((tab) => typeof tab.id === "string")
    .map((tab) => ({
      ...tab,
      title: tab.title || defaultTitle,
      content: tab.content || "",
      fileHandle: null,
    }));
  if (!tabs.length) tabs.push(createEmptyTab(defaultTitle));
  return {
    tabs,
    activeTabId: tabs.some((tab) => tab.id === state.activeTabId)
      ? state.activeTabId
      : tabs[0].id,
    wordWrap: state.wordWrap ?? true,
  };
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Editor() {
  const { t, locale } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);
  const initialTab = useMemo(() => createEmptyTab(t.editor.untitled), []);
  const [editorState, setEditorState] = useState({
    tabs: [initialTab],
    activeTabId: initialTab.id,
    wordWrap: true,
  });
  const { tabs, activeTabId, wordWrap } = editorState;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [selectedTool, setSelectedTool] = useState<ToolAction>("formatJson");
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null,
  );
  const [toolError, setToolError] = useState<string | null>(null);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchIndex, setMatchIndex] = useState(-1);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [humanizerOpen, setHumanizerOpen] = useState(false);

  const matches = useMemo(
    () => findMatches(activeTab?.content ?? "", searchQuery, matchCase),
    [activeTab?.content, searchQuery, matchCase],
  );
  const cursor = getCursorPosition(activeTab?.content ?? "", cursorOffset);

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setSaveStatus("saving");
    setEditorState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab,
      ),
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await loadEditorState();
        const legacy = stored ? null : readLegacyState();
        if (!cancelled && (stored || legacy))
          setEditorState(normalizeState(stored ?? legacy!, t.editor.untitled));
        if (legacy) {
          await saveEditorState(legacy);
          finishLegacyMigration();
        }
        if (!cancelled) setSaveStatus("saved");
      } catch {
        if (!cancelled) setSaveStatus("error");
      } finally {
        hydrated.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.editor.untitled]);

  useEffect(() => {
    if (!hydrated.current) return;
    setSaveStatus("saving");
    const timeout = window.setTimeout(() => {
      const state: PersistedEditorState = {
        activeTabId,
        wordWrap,
        tabs: tabs.map(({ id, title, content, isDirty }) => ({
          id,
          title,
          content,
          isDirty,
        })),
      };
      void saveEditorState(state)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, autosaveDelayMs);
    return () => window.clearTimeout(timeout);
  }, [tabs, activeTabId, wordWrap]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveStatus === "saving" || saveStatus === "error")
        event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveStatus]);

  const newTab = useCallback(() => {
    const tab = createEmptyTab(t.editor.untitled);
    setEditorState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, tab],
      activeTabId: tab.id,
    }));
  }, [t.editor.untitled]);

  const removeTab = useCallback(
    (id: string) => {
      setEditorState((prev) => {
        const index = prev.tabs.findIndex((tab) => tab.id === id);
        const remaining = prev.tabs.filter((tab) => tab.id !== id);
        if (!remaining.length)
          remaining.push(createEmptyTab(t.editor.untitled));
        return {
          ...prev,
          tabs: remaining,
          activeTabId:
            prev.activeTabId === id
              ? remaining[Math.min(index, remaining.length - 1)].id
              : prev.activeTabId,
        };
      });
    },
    [t.editor.untitled],
  );

  const closeTab = useCallback(
    (id: string) => {
      const tab = tabs.find((candidate) => candidate.id === id);
      if (tab?.isDirty) setPendingCloseTabId(id);
      else removeTab(id);
    },
    [tabs, removeTab],
  );

  const addOpenedFile = useCallback(
    (
      title: string,
      content: string,
      fileHandle: FileSystemFileHandle | null,
    ) => {
      const current = tabs.find((tab) => tab.id === activeTabId);
      if (
        current &&
        current.title === t.editor.untitled &&
        !current.isDirty &&
        !current.content
      ) {
        updateTab(current.id, { title, content, isDirty: false, fileHandle });
      } else {
        const tab: Tab = {
          id: generateId(),
          title,
          content,
          isDirty: false,
          fileHandle,
        };
        setEditorState((prev) => ({
          ...prev,
          tabs: [...prev.tabs, tab],
          activeTabId: tab.id,
        }));
      }
    },
    [tabs, activeTabId, t.editor.untitled, updateTab],
  );

  const openFile = useCallback(async () => {
    try {
      if ("showOpenFilePicker" in window) {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: t.editor.textFiles,
              accept: {
                "text/plain": [".txt", ".md", ".json", ".csv", ".log"],
              },
            },
          ],
        });
        const file = await handle.getFile();
        addOpenedFile(file.name, await file.text(), handle);
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".txt,.md,.json,.csv,.log";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) addOpenedFile(file.name, await file.text(), null);
        };
        input.click();
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError")
        setToolError(t.editor.fileError);
    }
  }, [addOpenedFile, t.editor]);

  const saveFileAs = useCallback(
    async (id = activeTabId): Promise<boolean> => {
      const tab = tabs.find((candidate) => candidate.id === id);
      if (!tab) return false;
      try {
        if ("showSaveFilePicker" in window) {
          const handle = await window.showSaveFilePicker({
            suggestedName:
              tab.title === t.editor.untitled
                ? t.editor.documentName
                : tab.title,
          });
          const writable = await handle.createWritable();
          await writable.write(tab.content);
          await writable.close();
          updateTab(id, {
            title: handle.name,
            isDirty: false,
            fileHandle: handle,
          });
        } else {
          const url = URL.createObjectURL(
            new Blob([tab.content], { type: "text/plain;charset=utf-8" }),
          );
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download =
            tab.title === t.editor.untitled ? t.editor.documentName : tab.title;
          anchor.click();
          URL.revokeObjectURL(url);
          updateTab(id, { isDirty: false });
        }
        return true;
      } catch (error) {
        if ((error as DOMException).name !== "AbortError")
          setToolError(t.editor.fileError);
        return false;
      }
    },
    [tabs, activeTabId, t.editor, updateTab],
  );

  const saveFile = useCallback(
    async (id = activeTabId): Promise<boolean> => {
      const tab = tabs.find((candidate) => candidate.id === id);
      if (!tab) return false;
      if (!tab.fileHandle) return saveFileAs(id);
      try {
        const writable = await tab.fileHandle.createWritable();
        await writable.write(tab.content);
        await writable.close();
        updateTab(id, { isDirty: false });
        return true;
      } catch {
        setToolError(t.editor.fileError);
        return false;
      }
    },
    [tabs, activeTabId, saveFileAs, updateTab, t.editor.fileError],
  );

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      if (!matches.length) return;
      const next = (matchIndex + direction + matches.length) % matches.length;
      setMatchIndex(next);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          matches[next],
          matches[next] + searchQuery.length,
        );
      });
    },
    [matches, matchIndex, searchQuery.length],
  );

  const replaceCurrent = () => {
    if (!matches.length) return;
    const index = matches[Math.max(matchIndex, 0)];
    updateTab(activeTab.id, {
      content:
        activeTab.content.slice(0, index) +
        replacement +
        activeTab.content.slice(index + searchQuery.length),
      isDirty: true,
    });
    setMatchIndex(-1);
  };

  const runTool = () => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const hasSelection = end > start;
    try {
      const transformed = applyTextTool(
        selectedTool,
        hasSelection ? activeTab.content.slice(start, end) : activeTab.content,
      );
      updateTab(activeTab.id, {
        content: hasSelection
          ? activeTab.content.slice(0, start) +
            transformed +
            activeTab.content.slice(end)
          : transformed,
        isDirty: true,
      });
    } catch {
      setToolError(t.editor.invalidJsonDescription);
    }
  };

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (["n", "o", "s", "w", "f"].includes(key)) event.preventDefault();
      if (key === "n") newTab();
      if (key === "o") void openFile();
      if (key === "s") void (event.shiftKey ? saveFileAs() : saveFile());
      if (key === "w") closeTab(activeTabId);
      if (key === "f") setSearchOpen(true);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [newTab, openFile, saveFile, saveFileAs, closeTab, activeTabId]);

  const commitRename = () => {
    if (renameTabId && renameValue.trim())
      updateTab(renameTabId, { title: renameValue.trim(), isDirty: true });
    setRenameTabId(null);
  };

  const dropTab = (targetId: string) => {
    if (!draggedTabId || draggedTabId === targetId) return;
    setEditorState((prev) => {
      const tabs = [...prev.tabs];
      const from = tabs.findIndex((tab) => tab.id === draggedTabId);
      const to = tabs.findIndex((tab) => tab.id === targetId);
      const [moved] = tabs.splice(from, 1);
      tabs.splice(to, 0, moved);
      return { ...prev, tabs };
    });
    setDraggedTabId(null);
  };

  const statusLabel = t.editor.saveStatuses[saveStatus];

  return (
    <section
      className="flex h-[calc(100vh-3.5rem)] min-h-[420px] w-full flex-col bg-background"
      aria-labelledby="editor-heading"
    >
      <h2 id="editor-heading" className="sr-only">
        {t.editor.heading}
      </h2>
      <div className="sticky top-14 z-40 shrink-0 bg-background">
        <div
          className="flex items-end overflow-x-auto border-b border-border bg-muted/60 px-2 pt-2 hide-scrollbar"
          role="tablist"
          aria-label={t.editor.tabsLabel}
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                role="tab"
                tabIndex={activeTabId === tab.id ? 0 : -1}
                aria-selected={activeTabId === tab.id}
                draggable
                onDragStart={() => setDraggedTabId(tab.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropTab(tab.id)}
                onClick={() =>
                  setEditorState((prev) => ({ ...prev, activeTabId: tab.id }))
                }
                onDoubleClick={() => {
                  setRenameTabId(tab.id);
                  setRenameValue(tab.title);
                }}
                className={`group flex h-8 min-w-[120px] max-w-[200px] cursor-pointer select-none items-center rounded-t-md border border-b-0 px-3 ${activeTabId === tab.id ? "relative -mb-px border-border bg-background text-foreground" : "border-transparent text-muted-foreground hover:bg-muted"}`}
              >
                {renameTabId === tab.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    aria-label={t.editor.renameTab}
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenameTabId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 truncate text-xs font-medium">
                    {tab.title}
                  </span>
                )}
                {tab.isDirty && (
                  <span
                    className="mx-2 h-2 w-2 rounded-full bg-primary"
                    aria-label={t.editor.unsavedFile}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  aria-label={t.editor.closeTab(tab.title)}
                  className="rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100 focus:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={newTab}
            className="mb-1 ml-1 shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-muted"
            aria-label={`${t.editor.newFile} (Ctrl+N)`}
          >
            <FilePlus size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => void openFile()}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent"
              aria-label={`${t.editor.open} (Ctrl+O)`}
            >
              <FolderOpen size={16} />
            </button>
            <button
              onClick={() => void saveFile()}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent"
              aria-label={`${t.editor.save} (Ctrl+S)`}
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => setSearchOpen((open) => !open)}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent"
              aria-label={`${t.editor.find} (Ctrl+F)`}
              aria-pressed={searchOpen}
            >
              <Search size={16} />
            </button>
            <button
              onClick={() =>
                setEditorState((prev) => ({
                  ...prev,
                  wordWrap: !prev.wordWrap,
                }))
              }
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent"
              aria-label={t.editor.wordWrap}
              aria-pressed={wordWrap}
            >
              <WrapText size={16} />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <button
              onClick={() => setHumanizerOpen((open) => !open)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium ${humanizerOpen ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
              aria-pressed={humanizerOpen}
            >
              <Sparkles size={14} />
              <span>
                {
                  { en: "Humanize AI", pt: "Humanizar IA", es: "Humanizar IA" }[
                    locale
                  ]
                }
              </span>
            </button>
            <label className="relative flex h-8 min-w-[148px] max-w-[190px] flex-1 items-center rounded-sm border border-border bg-muted/30 text-xs sm:flex-none">
              <span className="flex h-full w-8 items-center justify-center border-r">
                <Sparkles size={14} aria-hidden />
              </span>
              <select
                className="h-full min-w-0 flex-1 appearance-none bg-transparent pl-2 pr-7 outline-none"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value as ToolAction)}
                aria-label={t.editor.tools}
              >
                {Object.entries(t.editor.toolOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2"
                size={14}
              />
            </label>
            <button
              onClick={runTool}
              className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-2.5 text-xs font-medium text-primary-foreground"
            >
              <Code2 size={14} />
              <span>{t.editor.applyTool}</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div
            className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-2"
            role="search"
          >
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMatchIndex(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToMatch(e.shiftKey ? -1 : 1);
                if (e.key === "Escape") setSearchOpen(false);
              }}
              placeholder={t.editor.findPlaceholder}
              aria-label={t.editor.find}
              className="h-8 min-w-40 rounded-sm border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder={t.editor.replacePlaceholder}
              aria-label={t.editor.replace}
              className="h-8 min-w-40 rounded-sm border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {matches.length
                ? `${Math.max(matchIndex + 1, 0)}/${matches.length}`
                : t.editor.noMatches}
            </span>
            <button
              onClick={() => goToMatch(-1)}
              disabled={!matches.length}
              className="h-8 rounded-sm border px-2 text-xs disabled:opacity-40"
              aria-label={t.editor.previousMatch}
            >
              ↑
            </button>
            <button
              onClick={() => goToMatch(1)}
              disabled={!matches.length}
              className="h-8 rounded-sm border px-2 text-xs disabled:opacity-40"
              aria-label={t.editor.nextMatch}
            >
              ↓
            </button>
            <button
              onClick={replaceCurrent}
              disabled={!matches.length}
              className="inline-flex h-8 items-center gap-1 rounded-sm border px-2 text-xs disabled:opacity-40"
            >
              <Replace size={13} />
              {t.editor.replace}
            </button>
            <button
              onClick={() =>
                updateTab(activeTab.id, {
                  content: replaceAllText(
                    activeTab.content,
                    searchQuery,
                    replacement,
                    matchCase,
                  ),
                  isDirty: true,
                })
              }
              disabled={!matches.length}
              className="h-8 rounded-sm border px-2 text-xs disabled:opacity-40"
            >
              {t.editor.replaceAll}
            </button>
            <button
              onClick={() => setMatchCase((value) => !value)}
              aria-pressed={matchCase}
              aria-label={t.editor.matchCase}
              className={`h-8 rounded-sm border px-2 ${matchCase ? "bg-accent" : ""}`}
            >
              <CaseSensitive size={15} />
            </button>
            <button
              onClick={() => setSearchOpen(false)}
              aria-label={t.editor.closeSearch}
              className="ml-auto rounded-sm p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {humanizerOpen ? (
        <Humanizer
          initialText={activeTab?.content ?? ""}
          onClose={() => setHumanizerOpen(false)}
          onReplace={(content) => {
            updateTab(activeTab.id, { content, isDirty: true });
            setHumanizerOpen(false);
          }}
        />
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={activeTab?.content ?? ""}
            onChange={(e) =>
              updateTab(activeTab.id, {
                content: e.target.value,
                isDirty: true,
              })
            }
            onSelect={(e) => setCursorOffset(e.currentTarget.selectionStart)}
            aria-label={t.editor.textAreaLabel}
            className={`absolute inset-0 h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-relaxed outline-none ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-auto"}`}
            wrap={wordWrap ? "soft" : "off"}
            spellCheck={false}
          />
        </div>
      )}

      <div className="flex h-7 shrink-0 items-center justify-between border-t bg-muted/40 px-4 text-[11px] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-40 truncate">{activeTab?.title}</span>
          <span
            aria-live="polite"
            className={saveStatus === "error" ? "text-destructive" : ""}
          >
            · {statusLabel}
          </span>
          {activeTab?.isDirty && <span>· {t.editor.diskUnsaved}</span>}
        </div>
        <div className="flex gap-3">
          <span>{t.editor.lineColumn(cursor.line, cursor.column)}</span>
          <span className="hidden sm:inline">
            {activeTab?.content.length ?? 0} {t.editor.chars}
          </span>
          <span>
            {countWords(activeTab?.content ?? "")} {t.editor.words}
          </span>
          <span className="hidden sm:inline">
            {activeTab?.content.split("\n").length ?? 1} {t.editor.lines}
          </span>
        </div>
      </div>

      <Dialog
        open={pendingCloseTabId !== null}
        onOpenChange={(open) => !open && setPendingCloseTabId(null)}
      >
        <DialogContent className="max-w-md" closeLabel={t.editor.close}>
          <DialogHeader>
            <AlertTriangle className="mb-2 text-destructive" />
            <DialogTitle>{t.editor.saveBeforeCloseTitle}</DialogTitle>
            <DialogDescription>
              {t.editor.discardDescription(
                tabs.find((tab) => tab.id === pendingCloseTabId)?.title ??
                  t.editor.untitled,
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setPendingCloseTabId(null)}
              className="h-9 rounded-sm border px-3"
            >
              {t.editor.cancel}
            </button>
            <button
              onClick={() => {
                if (pendingCloseTabId) removeTab(pendingCloseTabId);
                setPendingCloseTabId(null);
              }}
              className="h-9 rounded-sm bg-destructive px-3 text-destructive-foreground"
            >
              {t.editor.discard}
            </button>
            <button
              onClick={async () => {
                if (pendingCloseTabId && (await saveFile(pendingCloseTabId))) {
                  removeTab(pendingCloseTabId);
                  setPendingCloseTabId(null);
                }
              }}
              className="h-9 rounded-sm bg-primary px-3 text-primary-foreground"
            >
              {t.editor.saveAndClose}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={toolError !== null} onOpenChange={() => setToolError(null)}>
        <DialogContent className="max-w-md" closeLabel={t.editor.close}>
          <DialogHeader>
            <Code2 className="mb-2 text-destructive" />
            <DialogTitle>{t.editor.errorTitle}</DialogTitle>
            <DialogDescription>{toolError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setToolError(null)}
              className="h-9 rounded-sm bg-primary px-3 text-primary-foreground"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
