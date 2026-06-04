import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderOpen, Save, FilePlus, X, Moon, Sun } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
  fileHandle: FileSystemFileHandle | null;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("editor-theme") as "light" | "dark" | null;
    const isDarkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && isDarkOS)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("editor-theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeContext = React.createContext<{ theme: "light" | "dark"; toggleTheme: () => void }>({ theme: "light", toggleTheme: () => {} });

function Editor() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: crypto.randomUUID(), title: "Sem título", content: "", isDirty: false, fileHandle: null }]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const { theme, toggleTheme } = React.useContext(ThemeContext);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTab) {
      updateTab(activeTab.id, { content: e.target.value, isDirty: true });
    }
  };

  const newTab = useCallback(() => {
    const newId = crypto.randomUUID();
    setTabs((prev) => [...prev, { id: newId, title: "Sem título", content: "", isDirty: false, fileHandle: null }]);
    setActiveTabId(newId);
  }, []);

  const closeTab = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tabToClose = tabs.find((t) => t.id === id);
    if (tabToClose?.isDirty) {
      if (!window.confirm(`Save changes to ${tabToClose.title}?`)) {
        return;
      }
    }
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        const newId = crypto.randomUUID();
        setActiveTabId(newId);
        return [{ id: newId, title: "Sem título", content: "", isDirty: false, fileHandle: null }];
      }
      if (activeTabId === id) {
        setActiveTabId(filtered[Math.max(0, filtered.length - 1)].id);
      }
      return filtered;
    });
  }, [tabs, activeTabId]);

  const openFile = useCallback(async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{ accept: { "text/plain": [".txt", ".md", ".json", ".csv", ".log"] } }]
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab && currentTab.title === "Sem título" && !currentTab.isDirty && currentTab.content === "") {
          updateTab(activeTabId, { title: file.name, content, isDirty: false, fileHandle });
        } else {
          const newId = crypto.randomUUID();
          setTabs((prev) => [...prev, { id: newId, title: file.name, content, isDirty: false, fileHandle }]);
          setActiveTabId(newId);
        }
      } catch (err) {
        console.log("User cancelled or error opening file", err);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,.json,.csv,.log';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const content = await file.text();
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab && currentTab.title === "Sem título" && !currentTab.isDirty && currentTab.content === "") {
          updateTab(activeTabId, { title: file.name, content, isDirty: false, fileHandle: null });
        } else {
          const newId = crypto.randomUUID();
          setTabs((prev) => [...prev, { id: newId, title: file.name, content, isDirty: false, fileHandle: null }]);
          setActiveTabId(newId);
        }
      };
      input.click();
    }
  }, [tabs, activeTabId, updateTab]);

  const saveFile = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId);
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
      saveFileAs();
    }
  }, [tabs, activeTabId, updateTab]);

  const saveFileAs = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: tab.title === "Sem título" ? "document.txt" : tab.title,
          types: [{ accept: { "text/plain": [".txt"] } }]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(tab.content);
        await writable.close();
        updateTab(tab.id, { title: fileHandle.name, isDirty: false, fileHandle });
      } catch (err) {
        console.log("User cancelled or error saving file", err);
      }
    } else {
      const blob = new Blob([tab.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tab.title === "Sem título" ? "document.txt" : tab.title;
      a.click();
      URL.revokeObjectURL(url);
      updateTab(tab.id, { isDirty: false });
    }
  }, [tabs, activeTabId, updateTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n': e.preventDefault(); newTab(); break;
          case 'o': e.preventDefault(); openFile(); break;
          case 's': 
            e.preventDefault(); 
            if (e.shiftKey) saveFileAs(); 
            else saveFile(); 
            break;
          case 'w': e.preventDefault(); closeTab(activeTabId); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newTab, openFile, saveFile, saveFileAs, closeTab, activeTabId]);

  return (
    <div className="flex flex-col h-screen w-full bg-background font-sans overflow-hidden">
      {/* Title / Tab Bar */}
      <div className="flex items-end bg-muted/60 border-b border-border pt-2 px-2 overflow-x-auto hide-scrollbar shrink-0">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
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
                className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-accent/50 ${activeTabId === tab.id ? 'opacity-100' : ''}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={newTab}
          className="p-1.5 ml-1 mb-1 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        >
          <FilePlus size={16} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-background shrink-0">
        <div className="flex items-center space-x-2">
          <button onClick={openFile} className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Open (Ctrl+O)">
            <FolderOpen size={16} />
          </button>
          <button onClick={saveFile} className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Save (Ctrl+S)">
            <Save size={16} />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Toggle Theme">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden bg-background">
        <textarea
          value={activeTab?.content || ""}
          onChange={handleContentChange}
          className="absolute inset-0 w-full h-full resize-none p-6 outline-none bg-transparent text-foreground font-mono text-sm leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-4 bg-muted/40 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <div className="truncate max-w-[50%]">{activeTab?.fileHandle?.name || activeTab?.title || "Sem título"}</div>
        <div className="flex space-x-4">
          <span>{activeTab?.content.length || 0} chars</span>
          <span>{activeTab?.content.split("\n").length || 1} lines</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  );
}
