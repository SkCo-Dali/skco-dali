import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CountryPhoneSelector } from './CountryPhoneSelector';
import { Facebook, Instagram, Linkedin, Twitter, Music } from 'lucide-react';
import { countries } from '@/data/countries';

interface ContactData {
  whatsapp: {
    countryCode: string;
    phone: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    xTwitter?: string;
    tiktok?: string;
  };
}

interface StepContactChannelsProps {
  initialValue: ContactData;
  onNext: (data: ContactData) => void;
  onBack: () => void;
}

export function StepContactChannels({ initialValue, onNext, onBack }: StepContactChannelsProps) {
  const [data, setData] = useState<ContactData>(initialValue);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (): boolean => {
    const { countryCode, phone } = data.whatsapp;
    
    if (!phone) {
      setPhoneError('El WhatsApp es requerido');
      return false;
    }

    // Validación específica para Colombia
    if (countryCode === '+57') {
      if (phone.length !== 10) {
        setPhoneError('Debe tener 10 dígitos');
        return false;
      }
      if (!phone.startsWith('3')) {
        setPhoneError('Debe iniciar con 3');
        return false;
      }
    } else {
      // Validación general para otros países
      if (phone.length < 7 || phone.length > 15) {
        setPhoneError('Número inválido');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validatePhone()) return;
    onNext(data);
  };

  // Encontrar el país basado en el countryCode (dialCode)
  const selectedCountry = countries.find(c => c.dialCode === data.whatsapp.countryCode);
  const selectedCountryCode = selectedCountry?.code || 'CO';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Conecta tus canales de contacto</h2>
        <p className="text-muted-foreground">
          WhatsApp habilita un botón en tus correos para que te contacten con un clic
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label>WhatsApp (requerido)</Label>
          <CountryPhoneSelector
            selectedCountryCode={selectedCountryCode}
            phone={data.whatsapp.phone}
            onCountryChange={(code, dialCode) => {
              setData({
                ...data,
                whatsapp: { ...data.whatsapp, countryCode: dialCode },
              });
              setPhoneError('');
            }}
            onPhoneChange={(phone) => {
              setData({
                ...data,
                whatsapp: { ...data.whatsapp, phone },
              });
              setPhoneError('');
            }}
            error={phoneError}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="social">
            <AccordionTrigger>Agregar otras redes (opcional)</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/tu-perfil"
                  value={data.socialMedia?.facebook || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socialMedia: { ...data.socialMedia, facebook: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@tu_usuario"
                  value={data.socialMedia?.instagram || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socialMedia: { ...data.socialMedia, instagram: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/tu-perfil"
                  value={data.socialMedia?.linkedin || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socialMedia: { ...data.socialMedia, linkedin: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  X (Twitter)
                </Label>
                <Input
                  id="twitter"
                  placeholder="@tu_usuario"
                  value={data.socialMedia?.xTwitter || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socialMedia: { ...data.socialMedia, xTwitter: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  placeholder="@tu_usuario"
                  value={data.socialMedia?.tiktok || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socialMedia: { ...data.socialMedia, tiktok: e.target.value },
                    })
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Atrás
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
