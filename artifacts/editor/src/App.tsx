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
import AboutPage from "@/components/SeoContent";
import Editor from "@/Editor";
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
          <Route index element={<Editor />} />
          <Route path="notepad-online" element={<Editor />} />
          <Route path="online-notepad" element={<Editor />} />
          <Route path="text-editor-online" element={<Editor />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/:locale" element={<LocalizedLayout />}>
          <Route index element={<Editor />} />
          <Route path="bloco-de-notas-online" element={<Editor />} />
          <Route path="bloc-de-notas-online" element={<Editor />} />
          <Route path="notas-online" element={<Editor />} />
          <Route path="caderno-online" element={<Editor />} />
          <Route path="cuaderno-online" element={<Editor />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
