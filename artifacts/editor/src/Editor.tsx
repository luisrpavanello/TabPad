import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Code2,
  FilePlus,
  FolderOpen,
  Save,
  Sparkles,
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

const storageKey = "tabpad.editorState.v2";

const generateId = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

type ToolAction =
  | "uppercase"
  | "lowercase"
  | "titleCase"
  | "removeEmptyLines"
  | "removeDuplicateLines"
  | "sortLines"
  | "trimLines"
  | "formatJson";

interface Tab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
  fileHandle: FileSystemFileHandle | null;
}

interface StoredTab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
}

function createEmptyTab(title: string): Tab {
  return {
    id: generateId(),
    title,
    content: "",
    isDirty: false,
    fileHandle: null,
  };
}

function loadStoredState(defaultTitle: string) {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      const tab = createEmptyTab(defaultTitle);
      return { tabs: [tab], activeTabId: tab.id };
    }

    const parsed = JSON.parse(raw) as {
      tabs?: StoredTab[];
      activeTabId?: string;
    };
    const storedTabs = Array.isArray(parsed.tabs) ? parsed.tabs : [];
    const tabs = storedTabs
      .filter((tab) => typeof tab.id === "string")
      .map<Tab>((tab) => ({
        id: tab.id,
        title: tab.title || defaultTitle,
        content: tab.content || "",
        isDirty: Boolean(tab.isDirty),
        fileHandle: null,
      }));

    if (tabs.length === 0) {
      const tab = createEmptyTab(defaultTitle);
      return { tabs: [tab], activeTabId: tab.id };
    }

    return {
      tabs,
      activeTabId: tabs.some((tab) => tab.id === parsed.activeTabId)
        ? parsed.activeTabId!
        : tabs[0].id,
    };
  } catch {
    const tab = createEmptyTab(defaultTitle);
    return { tabs: [tab], activeTabId: tab.id };
  }
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function applyTextTool(action: ToolAction, value: string) {
  const normalizedValue = value.replace(/\r\n?/g, "\n");

  switch (action) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "titleCase":
      return toTitleCase(value);
    case "removeEmptyLines":
      return normalizedValue
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .join("\n");
    case "removeDuplicateLines":
      return Array.from(new Set(normalizedValue.split("\n"))).join("\n");
    case "sortLines":
      return normalizedValue
        .split("\n")
        .sort((a, b) => a.localeCompare(b))
        .join("\n");
    case "trimLines":
      return normalizedValue
        .split("\n")
        .map((line) => line.replace(/^[\t ]+|[\t ]+$/g, ""))
        .join("\n")
        .replace(/^\n+|\n+$/g, "");
    case "formatJson":
      return value.trim()
        ? JSON.stringify(JSON.parse(value.trim()), null, 2)
        : value;
  }
}

export default function Editor() {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [{ tabs, activeTabId }, setEditorState] = useState(() =>
    loadStoredState(t.editor.untitled),
  );
  const [selectedTool, setSelectedTool] = useState<ToolAction>("formatJson");
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null,
  );
  const [toolError, setToolError] = useState<string | null>(null);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setEditorState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab,
      ),
    }));
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTab) {
      updateTab(activeTab.id, { content: e.target.value, isDirty: true });
    }
  };

  const newTab = useCallback(() => {
    const tab = createEmptyTab(t.editor.untitled);
    setEditorState((prev) => ({
      tabs: [...prev.tabs, tab],
      activeTabId: tab.id,
    }));
  }, [t.editor.untitled]);

  const removeTab = useCallback(
    (id: string) => {
      setEditorState((prev) => {
        const filtered = prev.tabs.filter((tab) => tab.id !== id);

        if (filtered.length === 0) {
          const tab = createEmptyTab(t.editor.untitled);
          return { tabs: [tab], activeTabId: tab.id };
        }

        return {
          tabs: filtered,
          activeTabId:
            prev.activeTabId === id
              ? filtered[Math.max(0, filtered.length - 1)].id
              : prev.activeTabId,
        };
      });
    },
    [t.editor.untitled],
  );

  const closeTab = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const tabToClose = tabs.find((tab) => tab.id === id);

      if (tabToClose?.isDirty) {
        setPendingCloseTabId(id);
        return;
      }

      removeTab(id);
    },
    [removeTab, tabs],
  );

  const openFile = useCallback(async () => {
    if ("showOpenFilePicker" in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              accept: {
                "text/plain": [".txt", ".md", ".json", ".csv", ".log"],
              },
            },
          ],
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        const currentTab = tabs.find((tab) => tab.id === activeTabId);

        if (
          currentTab &&
          currentTab.title === t.editor.untitled &&
          !currentTab.isDirty &&
          currentTab.content === ""
        ) {
          updateTab(activeTabId, {
            title: file.name,
            content,
            isDirty: false,
            fileHandle,
          });
        } else {
          const tab = {
            id: generateId(),
            title: file.name,
            content,
            isDirty: false,
            fileHandle,
          };
          setEditorState((prev) => ({
            tabs: [...prev.tabs, tab],
            activeTabId: tab.id,
          }));
        }
      } catch (err) {
        console.log("User cancelled or error opening file", err);
      }
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.md,.json,.csv,.log";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const content = await file.text();
        const tab = {
          id: generateId(),
          title: file.name,
          content,
          isDirty: false,
          fileHandle: null,
        };
        setEditorState((prev) => ({
          tabs: [...prev.tabs, tab],
          activeTabId: tab.id,
        }));
      };
      input.click();
    }
  }, [tabs, activeTabId, updateTab, t.editor.untitled]);

  const saveFileAs = useCallback(async () => {
    const tab = tabs.find((candidate) => candidate.id === activeTabId);
    if (!tab) return;

    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName:
            tab.title === t.editor.untitled ? t.editor.documentName : tab.title,
          types: [{ accept: { "text/plain": [".txt", ".md"] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(tab.content);
        await writable.close();
        updateTab(tab.id, {
          title: fileHandle.name,
          isDirty: false,
          fileHandle,
        });
      } catch (err) {
        console.log("User cancelled or error saving file", err);
      }
    } else {
      const blob = new Blob([tab.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        tab.title === t.editor.untitled ? t.editor.documentName : tab.title;
      a.click();
      URL.revokeObjectURL(url);
      updateTab(tab.id, { isDirty: false });
    }
  }, [tabs, activeTabId, updateTab, t.editor]);

  const saveFile = useCallback(async () => {
    const tab = tabs.find((candidate) => candidate.id === activeTabId);
    if (!tab) return;

    if (tab.fileHandle) {
      try {
        const writable = await (tab.fileHandle as any).createWritable();
        await writable.write(tab.content);
        await writable.close();
        updateTab(tab.id, { isDirty: false });
      } catch (err) {
        console.error("Failed to save", err);
      }
    } else {
      await saveFileAs();
    }
  }, [tabs, activeTabId, updateTab, saveFileAs]);

  const runTool = useCallback(() => {
    if (!activeTab) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? 0;
    const selectionEnd = textarea?.selectionEnd ?? 0;
    const hasSelection = Boolean(textarea && selectionEnd > selectionStart);
    const targetText = hasSelection
      ? activeTab.content.slice(selectionStart, selectionEnd)
      : activeTab.content;

    try {
      const transformedText = applyTextTool(selectedTool, targetText);
      const content = hasSelection
        ? `${activeTab.content.slice(0, selectionStart)}${transformedText}${activeTab.content.slice(selectionEnd)}`
        : transformedText;

      updateTab(activeTab.id, {
        content,
        isDirty: true,
      });

      if (hasSelection) {
        window.requestAnimationFrame(() => {
          textarea?.focus();
          textarea?.setSelectionRange(
            selectionStart,
            selectionStart + transformedText.length,
          );
        });
      }
    } catch (error) {
      if (selectedTool === "formatJson") {
        setToolError(t.editor.invalidJsonDescription);
      } else {
        console.error(error);
      }
    }
  }, [activeTab, selectedTool, t.editor.invalidJsonDescription, updateTab]);

  useEffect(() => {
    const state = {
      activeTabId,
      tabs: tabs.map<StoredTab>((tab) => ({
        id: tab.id,
        title: tab.title,
        content: tab.content,
        isDirty: tab.isDirty,
      })),
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [tabs, activeTabId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            newTab();
            break;
          case "o":
            e.preventDefault();
            void openFile();
            break;
          case "s":
            e.preventDefault();
            if (e.shiftKey) void saveFileAs();
            else void saveFile();
            break;
          case "w":
            e.preventDefault();
            closeTab(activeTabId);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newTab, openFile, saveFile, saveFileAs, closeTab, activeTabId]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-[420px] w-full flex-col bg-background font-sans">
      <div className="sticky top-14 z-40 shrink-0 bg-background">
        <div className="flex items-end bg-muted/60 border-b border-border pt-2 px-2 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() =>
                  setEditorState((prev) => ({ ...prev, activeTabId: tab.id }))
                }
                className={`group flex items-center h-8 px-3 rounded-t-md border border-b-0 cursor-pointer min-w-[120px] max-w-[200px] select-none transition-colors ${
                  activeTabId === tab.id
                    ? "bg-background border-border text-foreground relative -mb-[1px] z-10"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex-1 truncate text-xs font-medium">
                  {tab.title}
                </div>
                {tab.isDirty && (
                  <div className="w-2 h-2 rounded-full bg-primary mx-2" />
                )}
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-accent/50 ${activeTabId === tab.id ? "opacity-100" : ""}`}
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={newTab}
            className="p-1.5 ml-1 mb-1 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            title={`${t.editor.newFile} (Ctrl+N)`}
          >
            <FilePlus size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 min-h-10 border-b border-border bg-background py-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => void openFile()}
              className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={`${t.editor.open} (Ctrl+O)`}
            >
              <FolderOpen size={16} />
            </button>
            <button
              onClick={() => void saveFile()}
              className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={`${t.editor.save} (Ctrl+S)`}
            >
              <Save size={16} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <label className="relative flex h-8 min-w-[148px] max-w-[190px] flex-1 items-center rounded-sm border border-border bg-muted/30 text-xs text-muted-foreground shadow-sm transition-colors focus-within:border-primary/70 focus-within:bg-background sm:flex-none">
              <span className="flex h-full w-8 items-center justify-center border-r border-border/80">
                <Sparkles size={14} aria-hidden="true" />
              </span>
              <select
                className="h-full min-w-0 flex-1 appearance-none bg-transparent pl-2 pr-7 font-medium text-foreground outline-none"
                value={selectedTool}
                onChange={(event) =>
                  setSelectedTool(event.target.value as ToolAction)
                }
                aria-label={t.editor.tools}
              >
                {Object.entries(t.editor.toolOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
                aria-hidden="true"
              />
            </label>
            <button
              onClick={runTool}
              className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90"
              title={t.editor.tools}
            >
              <Code2 size={14} />
              <span>{t.editor.applyTool}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        <div className="relative h-full overflow-hidden bg-background">
          <textarea
            ref={textareaRef}
            value={activeTab?.content || ""}
            onChange={handleContentChange}
            className="absolute inset-0 w-full h-full resize-none p-6 outline-none bg-transparent text-foreground font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="h-6 flex items-center justify-between px-4 bg-muted/40 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <div className="truncate max-w-[50%]">
          {activeTab?.fileHandle?.name || activeTab?.title || t.editor.untitled}
          <span className="ml-2 hidden sm:inline">· {t.editor.saved}</span>
        </div>
        <div className="flex space-x-4">
          <span>
            {activeTab?.content.length || 0} {t.editor.chars}
          </span>
          <span>
            {countWords(activeTab?.content || "")} {t.editor.words}
          </span>
          <span>
            {activeTab?.content.split("\n").length || 1} {t.editor.lines}
          </span>
        </div>
      </div>

      <Dialog
        open={pendingCloseTabId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingCloseTabId(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle>{t.editor.discardTitle}</DialogTitle>
            <DialogDescription>
              {t.editor.discardDescription(
                tabs.find((tab) => tab.id === pendingCloseTabId)?.title ||
                  t.editor.untitled,
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPendingCloseTabId(null)}
              className="h-9 rounded-sm border border-border px-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              {t.editor.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingCloseTabId) {
                  removeTab(pendingCloseTabId);
                }
                setPendingCloseTabId(null);
              }}
              className="h-9 rounded-sm bg-destructive px-3 text-sm font-medium text-destructive-foreground hover:opacity-90"
            >
              {t.editor.discard}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={toolError !== null} onOpenChange={() => setToolError(null)}>
        <DialogContent className="max-w-md rounded-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
              <Code2 size={20} />
            </div>
            <DialogTitle>{t.editor.invalidJsonTitle}</DialogTitle>
            <DialogDescription>{toolError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setToolError(null)}
              className="h-9 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
