import { createContext, useContext } from "react";

export type Locale = "en" | "pt" | "es";

export const locales: Locale[] = ["en", "pt", "es"];

type Dictionary = {
  nav: {
    editor: string;
    about: string;
    contact: string;
    language: string;
    onlineLabel: string;
    onlineLoading: string;
    online: string;
    theme: string;
  };
  editor: {
    untitled: string;
    newFile: string;
    open: string;
    save: string;
    tools: string;
    applyTool: string;
    edit: string;
    chars: string;
    lines: string;
    words: string;
    saved: string;
    discardTitle: string;
    discardDescription: (title: string) => string;
    cancel: string;
    discard: string;
    invalidJsonTitle: string;
    invalidJsonDescription: string;
    heading: string;
    tabsLabel: string;
    textAreaLabel: string;
    renameTab: string;
    closeTab: (title: string) => string;
    unsavedFile: string;
    diskUnsaved: string;
    saveBeforeCloseTitle: string;
    saveAndClose: string;
    find: string;
    replace: string;
    replaceAll: string;
    findPlaceholder: string;
    replacePlaceholder: string;
    previousMatch: string;
    nextMatch: string;
    noMatches: string;
    matchCase: string;
    closeSearch: string;
    close: string;
    wordWrap: string;
    lineColumn: (line: number, column: number) => string;
    textFiles: string;
    fileError: string;
    errorTitle: string;
    saveStatuses: Record<"loading" | "saving" | "saved" | "error", string>;
    closeConfirm: (title: string) => string;
    documentName: string;
    toolOptions: {
      uppercase: string;
      lowercase: string;
      titleCase: string;
      removeEmptyLines: string;
      removeDuplicateLines: string;
      sortLines: string;
      trimLines: string;
      formatJson: string;
    };
  };
  contact: {
    title: string;
    description: string;
    email: string;
    location: string;
    locationValue: string;
    note: string;
  };
  footer: {
    rights: string;
    contact: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      editor: "Editor",
      about: "About",
      contact: "Contact",
      language: "Language",
      onlineLabel: "People online now",
      onlineLoading: "loading",
      online: "online",
      theme: "Toggle theme",
    },
    editor: {
      untitled: "Untitled",
      newFile: "New file",
      open: "Open",
      save: "Save",
      tools: "Text tools",
      applyTool: "Apply",
      edit: "Edit",
      chars: "chars",
      lines: "lines",
      words: "words",
      saved: "autosaved",
      discardTitle: "Discard changes?",
      discardDescription: (title) =>
        `${title} has unsaved changes. Closing it will discard the current edits.`,
      cancel: "Cancel",
      discard: "Discard",
      invalidJsonTitle: "Invalid JSON",
      invalidJsonDescription:
        'Format JSON only works with pure JSON, for example {"name":"TabPad"}. Keys and strings need double quotes, and trailing commas are not allowed. Select only the JSON block if the file has other text.',
      heading: "TabPad text editor",
      tabsLabel: "Open documents",
      textAreaLabel: "Document content",
      renameTab: "Rename tab",
      closeTab: (title) => `Close ${title}`,
      unsavedFile: "File has unsaved disk changes",
      diskUnsaved: "not saved to disk",
      saveBeforeCloseTitle: "Save changes before closing?",
      saveAndClose: "Save and close",
      find: "Find",
      replace: "Replace",
      replaceAll: "Replace all",
      findPlaceholder: "Find text",
      replacePlaceholder: "Replace with",
      previousMatch: "Previous match",
      nextMatch: "Next match",
      noMatches: "No matches",
      matchCase: "Match case",
      closeSearch: "Close search",
      close: "Close",
      wordWrap: "Word wrap",
      lineColumn: (line, column) => `Ln ${line}, Col ${column}`,
      textFiles: "Text files",
      fileError:
        "The file could not be opened or saved. Check browser permissions and try again.",
      errorTitle: "Unable to complete action",
      saveStatuses: {
        loading: "loading session",
        saving: "saving locally…",
        saved: "saved locally",
        error: "local save failed",
      },
      closeConfirm: (title) => `Save changes to ${title}?`,
      documentName: "document.txt",
      toolOptions: {
        uppercase: "UPPER",
        lowercase: "lower",
        titleCase: "Title",
        removeEmptyLines: "No blanks",
        removeDuplicateLines: "Unique",
        sortLines: "Sort",
        trimLines: "Trim",
        formatJson: "JSON",
      },
    },
    contact: {
      title: "Contact Us",
      description: "Have questions or feedback? We'd love to hear from you.",
      email: "Email",
      location: "Location",
      locationValue: "Online - anywhere you are",
      note: "You can also reach us via GitHub or social channels soon.",
    },
    footer: {
      rights: "All rights reserved.",
      contact: "Contact",
    },
  },
  pt: {
    nav: {
      editor: "Editor",
      about: "Sobre",
      contact: "Contato",
      language: "Idioma",
      onlineLabel: "Pessoas online agora",
      onlineLoading: "carregando",
      online: "online",
      theme: "Alternar tema",
    },
    editor: {
      untitled: "Sem título",
      newFile: "Novo arquivo",
      open: "Abrir",
      save: "Salvar",
      tools: "Ferramentas de texto",
      applyTool: "Aplicar",
      edit: "Editar",
      chars: "caracteres",
      lines: "linhas",
      words: "palavras",
      saved: "salvo automaticamente",
      discardTitle: "Descartar alterações?",
      discardDescription: (title) =>
        `${title} tem alterações não salvas no arquivo. Você pode salvar no disco antes de fechar.`,
      cancel: "Cancelar",
      discard: "Descartar",
      invalidJsonTitle: "JSON inválido",
      invalidJsonDescription:
        'Formatar JSON funciona apenas com JSON puro, por exemplo {"nome":"TabPad"}. Chaves e textos precisam de aspas duplas, e vírgula sobrando no final não é permitida. Selecione apenas o bloco JSON se o arquivo tiver outros textos.',
      heading: "Editor de texto TabPad",
      tabsLabel: "Documentos abertos",
      textAreaLabel: "Conteúdo do documento",
      renameTab: "Renomear aba",
      closeTab: (title) => `Fechar ${title}`,
      unsavedFile: "Arquivo com alterações não salvas no disco",
      diskUnsaved: "não salvo no disco",
      saveBeforeCloseTitle: "Salvar alterações antes de fechar?",
      saveAndClose: "Salvar e fechar",
      find: "Localizar",
      replace: "Substituir",
      replaceAll: "Substituir tudo",
      findPlaceholder: "Localizar texto",
      replacePlaceholder: "Substituir por",
      previousMatch: "Ocorrência anterior",
      nextMatch: "Próxima ocorrência",
      noMatches: "Nenhuma ocorrência",
      matchCase: "Diferenciar maiúsculas",
      closeSearch: "Fechar busca",
      close: "Fechar",
      wordWrap: "Quebra automática de linha",
      lineColumn: (line, column) => `Lin ${line}, Col ${column}`,
      textFiles: "Arquivos de texto",
      fileError:
        "Não foi possível abrir ou salvar o arquivo. Verifique as permissões do navegador e tente novamente.",
      errorTitle: "Não foi possível concluir a ação",
      saveStatuses: {
        loading: "carregando sessão",
        saving: "salvando localmente…",
        saved: "salvo localmente",
        error: "falha ao salvar localmente",
      },
      closeConfirm: (title) => `Salvar alterações em ${title}?`,
      documentName: "documento.txt",
      toolOptions: {
        uppercase: "MAIUS",
        lowercase: "minus",
        titleCase: "Titulo",
        removeEmptyLines: "Sem vazias",
        removeDuplicateLines: "Unicas",
        sortLines: "Ordenar",
        trimLines: "Limpar",
        formatJson: "JSON",
      },
    },
    contact: {
      title: "Contato",
      description: "Tem perguntas ou feedback? Vamos gostar de ouvir você.",
      email: "Email",
      location: "Localização",
      locationValue: "Online - de qualquer lugar",
      note: "Em breve você também poderá falar conosco pelo GitHub ou redes sociais.",
    },
    footer: {
      rights: "Todos os direitos reservados.",
      contact: "Contato",
    },
  },
  es: {
    nav: {
      editor: "Editor",
      about: "Acerca de",
      contact: "Contacto",
      language: "Idioma",
      onlineLabel: "Personas online ahora",
      onlineLoading: "cargando",
      online: "en línea",
      theme: "Cambiar tema",
    },
    editor: {
      untitled: "Sin título",
      newFile: "Nuevo archivo",
      open: "Abrir",
      save: "Guardar",
      tools: "Herramientas de texto",
      applyTool: "Aplicar",
      edit: "Editar",
      chars: "caracteres",
      lines: "líneas",
      words: "palabras",
      saved: "guardado automatico",
      discardTitle: "¿Descartar cambios?",
      discardDescription: (title) =>
        `${title} tiene cambios sin guardar en el archivo. Puedes guardarlo en el disco antes de cerrar.`,
      cancel: "Cancelar",
      discard: "Descartar",
      invalidJsonTitle: "JSON inválido",
      invalidJsonDescription:
        'Formatear JSON solo funciona con JSON puro, por ejemplo {"nombre":"TabPad"}. Las claves y textos necesitan comillas dobles y no se permiten comas finales. Selecciona solo el bloque JSON si el archivo contiene otros textos.',
      heading: "Editor de texto TabPad",
      tabsLabel: "Documentos abiertos",
      textAreaLabel: "Contenido del documento",
      renameTab: "Renombrar pestaña",
      closeTab: (title) => `Cerrar ${title}`,
      unsavedFile: "Archivo con cambios sin guardar en el disco",
      diskUnsaved: "no guardado en el disco",
      saveBeforeCloseTitle: "¿Guardar cambios antes de cerrar?",
      saveAndClose: "Guardar y cerrar",
      find: "Buscar",
      replace: "Reemplazar",
      replaceAll: "Reemplazar todo",
      findPlaceholder: "Buscar texto",
      replacePlaceholder: "Reemplazar con",
      previousMatch: "Coincidencia anterior",
      nextMatch: "Siguiente coincidencia",
      noMatches: "Sin coincidencias",
      matchCase: "Distinguir mayúsculas",
      closeSearch: "Cerrar búsqueda",
      close: "Cerrar",
      wordWrap: "Ajuste automático de línea",
      lineColumn: (line, column) => `Lín ${line}, Col ${column}`,
      textFiles: "Archivos de texto",
      fileError:
        "No se pudo abrir o guardar el archivo. Verifica los permisos del navegador e inténtalo de nuevo.",
      errorTitle: "No se pudo completar la acción",
      saveStatuses: {
        loading: "cargando sesión",
        saving: "guardando localmente…",
        saved: "guardado localmente",
        error: "falló el guardado local",
      },
      closeConfirm: (title) => `¿Guardar cambios en ${title}?`,
      documentName: "documento.txt",
      toolOptions: {
        uppercase: "MAYUS",
        lowercase: "minus",
        titleCase: "Titulo",
        removeEmptyLines: "Sin vacias",
        removeDuplicateLines: "Unicas",
        sortLines: "Ordenar",
        trimLines: "Limpiar",
        formatJson: "JSON",
      },
    },
    contact: {
      title: "Contacto",
      description:
        "¿Tienes preguntas o comentarios? Nos encantaría escucharte.",
      email: "Email",
      location: "Ubicación",
      locationValue: "Online - desde cualquier lugar",
      note: "Pronto también podrás contactarnos por GitHub o redes sociales.",
    },
    footer: {
      rights: "Todos los derechos reservados.",
      contact: "Contacto",
    },
  },
};

const localeLabels: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  es: "ES",
};

const I18nContext = createContext({
  locale: "en" as Locale,
  t: dictionaries.en,
});

export function getLocale(value?: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export function getLocaleLabel(locale: Locale) {
  return localeLabels[locale];
}

export function getLocalePath(locale: Locale, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "en") {
    return normalizedPath === "/" ? "/" : normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
