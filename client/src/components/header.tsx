import { Bell, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sprout className="text-2xl" data-testid="logo-icon" />
            <div>
              <h1 className="text-xl font-bold" data-testid="app-title">{t("appName")}</h1>
              <p className="text-xs opacity-90" data-testid="app-subtitle">{t("appSubtitle")}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <Select value={language} onValueChange={changeLanguage} data-testid="language-selector">
              <SelectTrigger className="w-32 bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml">മലയാളം</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative bg-white/10 hover:bg-white/20"
              data-testid="notifications-button"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground min-w-5 h-5 text-xs p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
