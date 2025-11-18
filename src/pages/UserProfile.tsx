import { useState } from "react";
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

        <div className="w-full flex justify-center">
          {/* Profile Content */}
          <div className="max-w-7xl w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-[37px] bg-transparent gap-0 rounded-none p-0">
                <TabsTrigger 
                  value="personal" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Personal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="professional" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Profesional</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="family" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Familiar</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Contacto</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="suggestions" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Sugerencias</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-primary-foreground rounded-t-xl flex items-center gap-2 h-full text-muted-foreground mx-1"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Preferencias</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-0">
                <ProfilePersonalInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-0">
                <ProfileProfessionalInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="family" className="space-y-4 mt-0">
                <ProfileFamilyInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-0">
                <ProfileContactInfo profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 mt-0">
                <ProfileNotifications profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4 mt-0">
                <ProfileSuggestions profile={profile} updateProfile={updateProfile} />
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 mt-0">
                <ProfileAppPreferences profile={profile} updateProfile={updateProfile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
