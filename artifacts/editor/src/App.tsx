// artifacts/editor/src/App.tsx
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { Layout } from "@/components/Layout";
import { getLocale, locales, type Locale } from "@/i18n";
import EditorPage from "@/components/SeoContent";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

function LocalizedLayout() {
  const { locale: rawLocale } = useParams();

  if (!locales.includes(rawLocale as Locale)) {
    return <Navigate to="/" replace />;
  }

  return <Layout locale={getLocale(rawLocale)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout locale="en" />}>
          <Route index element={<EditorPage />} />
          <Route path="notepad-online" element={<EditorPage />} />
          <Route path="online-notepad" element={<EditorPage />} />
          <Route path="text-editor-online" element={<EditorPage />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/:locale" element={<LocalizedLayout />}>
          <Route index element={<EditorPage />} />
          <Route path="bloco-de-notas-online" element={<EditorPage />} />
          <Route path="bloc-de-notas-online" element={<EditorPage />} />
          <Route path="notas-online" element={<EditorPage />} />
          <Route path="caderno-online" element={<EditorPage />} />
          <Route path="cuaderno-online" element={<EditorPage />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
