import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { countries } from "@/data/countries";
import { cn } from "@/lib/utils";

interface CountryPhoneSelectorProps {
  selectedCountryCode: string;
  phone: string;
  onCountryChange: (countryCode: string, dialCode: string) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

export function CountryPhoneSelector({
  selectedCountryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
}: CountryPhoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCountry = countries.find((c) => c.code === selectedCountryCode) || countries[0];

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.dialCode.includes(searchQuery),
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-[180px] justify-between">
              <span className="flex items-center gap-2">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar país..." value={searchQuery} onValueChange={setSearchQuery} />
              <CommandList>
                <CommandEmpty>No se encontró el país</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.code}
                      onSelect={() => {
                        onCountryChange(country.code, country.dialCode);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span className="text-2xl mr-2">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-muted-foreground">{country.dialCode}</span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedCountryCode === country.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex-1">
          <Input
            type="tel"
            placeholder="3109876543"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
            className={cn(error && "border-destructive")}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
