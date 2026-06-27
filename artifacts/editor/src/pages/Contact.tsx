// artifacts/editor/src/pages/Contact.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.contact.title}</CardTitle>
          <CardDescription>{t.contact.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">{t.contact.email}</h3>
              <p className="text-sm text-muted-foreground">
                <a
                  href="mailto:contato@tabpad.online"
                  className="hover:text-primary"
                >
                  contato@tabpad.online
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">{t.contact.location}</h3>
              <p className="text-sm text-muted-foreground">
                {t.contact.locationValue}
              </p>
            </div>
          </div>
          <div className="border-t pt-4 mt-2 text-sm text-muted-foreground">
            <p>{t.contact.note}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
