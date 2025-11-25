import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Briefcase,
  Heart,
  MapPin,
  Bell,
  MessageSquare,
  Home,
  ChevronRight,
  Check,
  Mail,
  Phone,
  IdCard,
  Calendar,
} from "lucide-react";
import { ProfilePersonalInfo } from "@/components/profile/ProfilePersonalInfo";
import { ProfileProfessionalInfo } from "@/components/profile/ProfileProfessionalInfo";
import { ProfileFamilyInfo } from "@/components/profile/ProfileFamilyInfo";
import { ProfileContactInfo } from "@/components/profile/ProfileContactInfo";
import { ProfileNotifications } from "@/components/profile/ProfileNotifications";
import { ProfileSuggestions } from "@/components/profile/ProfileSuggestions";
import { ProfileAppPreferences } from "@/components/profile/ProfileAppPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { profile, updateProfile } = useUserProfile();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Calculate completion for each section
  const calculatePersonalCompletion = () => {
    const fields = [profile.preferredName, profile.birthDate, profile.gender, profile.phone, profile.countryCode];
    const completed = fields.filter((f) => f).length;
    return { completed, total: fields.length };
  };

  const calculateProfessionalCompletion = () => {
    const fields = [profile.role, profile.department, profile.startDate, profile.manager, profile.specialization];
    const completed = fields.filter((f) => f).length;
    return { completed, total: fields.length };
  };

  const calculateFamilyCompletion = () => {
    const fields = [profile.maritalStatus, profile.emergencyContact?.name];
    const completed = fields.filter((f) => f).length;
    return { completed, total: fields.length };
  };

  const calculateContactCompletion = () => {
    const fields = [profile.address?.street, profile.address?.city, profile.address?.country];
    const completed = fields.filter((f) => f).length;
    return { completed, total: fields.length };
  };

  const calculateNotificationsCompletion = () => {
    return { completed: 2, total: 2 }; // Assuming notifications are configured
  };

  const calculateSuggestionsCompletion = () => {
    return { completed: 1, total: 1 }; // Always considered complete
  };

  const calculatePreferencesCompletion = () => {
    const fields = [profile.customHomepage, profile.emailSignature];
    const completed = fields.filter((f) => f).length;
    return { completed, total: fields.length };
  };

  const sections = [
    {
      id: "personal",
      title: "Datos Personales",
      icon: User,
      completion: calculatePersonalCompletion(),
    },
    {
      id: "professional",
      title: "Información Profesional",
      icon: Briefcase,
      completion: calculateProfessionalCompletion(),
    },
    {
      id: "family",
      title: "Información Familiar",
      icon: Heart,
      completion: calculateFamilyCompletion(),
    },
    {
      id: "contact",
      title: "Información de Contacto",
      icon: MapPin,
      completion: calculateContactCompletion(),
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: Bell,
      completion: calculateNotificationsCompletion(),
    },
    {
      id: "suggestions",
      title: "Sugerencias",
      icon: MessageSquare,
      completion: calculateSuggestionsCompletion(),
    },
    {
      id: "preferences",
      title: "Preferencias de App",
      icon: Home,
      completion: calculatePreferencesCompletion(),
    },
  ];

  const totalFields = sections.reduce((acc, s) => acc + s.completion.total, 0);
  const completedFields = sections.reduce((acc, s) => acc + s.completion.completed, 0);
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const renderSectionContent = () => {
    switch (activeSection) {
      case "personal":
        return <ProfilePersonalInfo profile={profile} updateProfile={updateProfile} />;
      case "professional":
        return <ProfileProfessionalInfo profile={profile} updateProfile={updateProfile} />;
      case "family":
        return <ProfileFamilyInfo profile={profile} updateProfile={updateProfile} />;
      case "contact":
        return <ProfileContactInfo profile={profile} updateProfile={updateProfile} />;
      case "notifications":
        return <ProfileNotifications profile={profile} updateProfile={updateProfile} />;
      case "suggestions":
        return <ProfileSuggestions profile={profile} updateProfile={updateProfile} />;
      case "preferences":
        return <ProfileAppPreferences profile={profile} updateProfile={updateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-4 px-4">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground cursor-pointer hover:text-foreground">Inicio</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-primary font-medium">Mis datos</span>
        </div>

        <div className="grid grid-cols-8 gap-6">
          {/* Left Side - Basic Info */}
          <div className="col-span-3 space-y-6 bg-[#EDFEFA] shadow-md rounded-xl p-4">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-full bg-gradient-to-r from-[#8FE000] to-[#00C73D] p-1">
                  <AvatarImage className="h-34 w-34" src={user?.avatar || ""} />
                  <AvatarFallback className="bg-muted text-3xl font-semibold text-foreground">
                    {profile.preferredName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center space-y-2 w-full">
                <h2 className="text-2xl font-bold text-foreground">{profile.preferredName || user?.name}</h2>
                <p className="text-sm text-muted-foreground">Rol en Dali:</p>
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                  {user?.role || "Usuario"}
                </Badge>
              </div>
            </div>

            {/* Basic Data Card */}
            <Card className="border-border/40">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{user?.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {profile.countryCode && profile.phone
                        ? `${profile.countryCode} ${profile.phone}`
                        : "No configurado"}
                    </p>
                  </div>

                  {/* Birth Date */}
                  {profile.birthDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Fecha de nacimiento</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{profile.birthDate}</p>
                    </div>
                  )}

                  {/* Gender */}
                  {profile.gender && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Género</span>
                      </div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {profile.gender === "male" ? "Masculino" : profile.gender === "female" ? "Femenino" : "Otro"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Sections */}
          <div className="col-span-5 space-y-6">
            {!activeSection ? (
              <>
                {/* Completion Banner */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {completionPercentage === 100 ? "¡Tu información está completa!" : "Completa tu perfil"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {completionPercentage === 100
                              ? "Disfruta de una experiencia optimizada con todos tus datos actualizados."
                              : "Completa todos los campos para mejorar tu experiencia."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                          {completionPercentage === 100 && (
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Sections List */}
                <div className="space-y-4">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isComplete = section.completion.completed === section.completion.total;

                    return (
                      <Card
                        key={section.id}
                        className="border-border/40 hover:border-primary/40 transition-colors cursor-pointer"
                        onClick={() => setActiveSection(section.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="font-semibold">{section.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {section.completion.completed}/{section.completion.total} campos completados
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card className="border-border/40">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>{sections.find((s) => s.id === activeSection)?.title}</CardTitle>
                    <button onClick={() => setActiveSection(null)} className="text-sm text-primary hover:underline">
                      ← Volver a secciones
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">{renderSectionContent()}</CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
