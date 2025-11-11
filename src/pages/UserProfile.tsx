import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, Heart, MapPin, Bell, MessageSquare, Home } from "lucide-react";
import { ProfilePersonalInfo } from "@/components/profile/ProfilePersonalInfo";
import { ProfileProfessionalInfo } from "@/components/profile/ProfileProfessionalInfo";
import { ProfileFamilyInfo } from "@/components/profile/ProfileFamilyInfo";
import { ProfileContactInfo } from "@/components/profile/ProfileContactInfo";
import { ProfileNotifications } from "@/components/profile/ProfileNotifications";
import { ProfileSuggestions } from "@/components/profile/ProfileSuggestions";
import { ProfileAppPreferences } from "@/components/profile/ProfileAppPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";

const UserProfile = () => {
  const { profile, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-4 px-4 max-w-full">
        {/* Header */}
        <div className="mb-4 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground text-md">Administra tu información personal y preferencias</p>
        </div>

        {/* Profile Content */}
        <Card className="border-border/40 shadow-lg max-w-7xl flex justify-center">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-muted/50 p-2">
                <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-background">
                  <User className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="gap-2 data-[state=active]:bg-background">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Profesional</span>
                </TabsTrigger>
                <TabsTrigger value="family" className="gap-2 data-[state=active]:bg-background">
                  <Heart className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Familiar</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2 data-[state=active]:bg-background">
                  <MapPin className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Contacto</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
                  <Bell className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-2 data-[state=active]:bg-background">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Sugerencias</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2 data-[state=active]:bg-background">
                  <Home className="h-4 w-4" />
                  <span className="text-truncate hidden sm:inline">Preferencias</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <ProfilePersonalInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                <ProfileProfessionalInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="family" className="space-y-4 mt-4">
                <ProfileFamilyInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <ProfileContactInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 mt-4">
                <ProfileNotifications profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4 mt-4">
                <ProfileSuggestions profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 mt-4">
                <ProfileAppPreferences profile={profile} updateProfile={updateProfile} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
