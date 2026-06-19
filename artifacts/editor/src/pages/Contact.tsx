// artifacts/editor/src/pages/Contact.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
          <CardDescription>
            Have questions or feedback? We'd love to hear from you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:contato@tabpad.online" className="hover:text-primary">
                  contato@tabpad.online
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">Location</h3>
              <p className="text-sm text-muted-foreground">
                Online – Anywhere you are
              </p>
            </div>
          </div>
          <div className="border-t pt-4 mt-2 text-sm text-muted-foreground">
            <p>You can also reach us via GitHub or Twitter (links coming soon).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}