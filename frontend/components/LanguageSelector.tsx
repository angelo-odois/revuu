'use client';

import { useI18n, locales, localeNames, localeFlags, type Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Selecionar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageSelectorInline() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocale(loc)}
          className="gap-2"
        >
          <span>{localeFlags[loc]}</span>
          <span className="hidden sm:inline">{localeNames[loc]}</span>
        </Button>
      ))}
    </div>
  );
}
