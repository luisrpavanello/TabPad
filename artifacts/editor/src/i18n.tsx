import { createContext, useContext } from "react";

export type Locale = "en" | "pt" | "es";

export const locales: Locale[] = ["en", "pt", "es"];

type Dictionary = {
  nav: {
    editor: string;
    contact: string;
    language: string;
    onlineLabel: string;
    onlineLoading: string;
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
      contact: "Contact",
      language: "Language",
      onlineLabel: "People online now",
      onlineLoading: "loading",
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
      contact: "Contato",
      language: "Idioma",
      onlineLabel: "Pessoas online agora",
      onlineLoading: "carregando",
      theme: "Alternar tema",
    },
    editor: {
      untitled: "Sem titulo",
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
      discardTitle: "Descartar alteracoes?",
      discardDescription: (title) =>
        `${title} tem alteracoes nao salvas. Fechar a aba vai descartar a edicao atual.`,
      cancel: "Cancelar",
      discard: "Descartar",
      invalidJsonTitle: "JSON invalido",
      invalidJsonDescription:
        'Formatar JSON funciona apenas com JSON puro, por exemplo {"nome":"TabPad"}. Chaves e textos precisam de aspas duplas, e virgula sobrando no final nao e permitida. Selecione apenas o bloco JSON se o arquivo tiver outros textos.',
      closeConfirm: (title) => `Salvar alteracoes em ${title}?`,
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
      description: "Tem perguntas ou feedback? Vamos gostar de ouvir voce.",
      email: "Email",
      location: "Localizacao",
      locationValue: "Online - de qualquer lugar",
      note: "Em breve voce tambem podera falar conosco pelo GitHub ou redes sociais.",
    },
    footer: {
      rights: "Todos os direitos reservados.",
      contact: "Contato",
    },
  },
  es: {
    nav: {
      editor: "Editor",
      contact: "Contacto",
      language: "Idioma",
      onlineLabel: "Personas online ahora",
      onlineLoading: "cargando",
      theme: "Cambiar tema",
    },
    editor: {
      untitled: "Sin titulo",
      newFile: "Nuevo archivo",
      open: "Abrir",
      save: "Guardar",
      tools: "Herramientas de texto",
      applyTool: "Aplicar",
      edit: "Editar",
      chars: "caracteres",
      lines: "lineas",
      words: "palabras",
      saved: "guardado automatico",
      discardTitle: "Descartar cambios?",
      discardDescription: (title) =>
        `${title} tiene cambios sin guardar. Cerrar la pestana descartara la edicion actual.`,
      cancel: "Cancelar",
      discard: "Descartar",
      invalidJsonTitle: "JSON invalido",
      invalidJsonDescription:
        'Formatear JSON solo funciona con JSON puro, por ejemplo {"nombre":"TabPad"}. Las claves y textos necesitan comillas dobles, y no se permiten comas finales. Selecciona solo el bloque JSON si el archivo tiene otros textos.',
      closeConfirm: (title) => `Guardar cambios en ${title}?`,
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
      description: "Tienes preguntas o comentarios? Nos encantaria escucharte.",
      email: "Email",
      location: "Ubicacion",
      locationValue: "Online - desde cualquier lugar",
      note: "Pronto tambien podras contactarnos por GitHub o redes sociales.",
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
