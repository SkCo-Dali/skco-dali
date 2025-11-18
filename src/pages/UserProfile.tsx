import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell } from "lucide-react";
import { ProfilePersonalInfo } from "@/components/profile/ProfilePersonalInfo";
import { ProfileNotifications } from "@/components/profile/ProfileNotifications";
import { useUserProfile } from "@/hooks/useUserProfile";

const UserProfile = () => {
  const { profile, isLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("personal");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

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
          <Card className="border-border/40 shadow-lg max-w-7xl">
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 gap-2 h-auto bg-muted/50 p-2">
                  <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-background">
                    <User className="h-4 w-4" />
                    <span className="text-truncate hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
                    <Bell className="h-4 w-4" />
                    <span className="text-truncate hidden sm:inline">Notificaciones</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  {profile && <ProfilePersonalInfo profile={profile} updateProfile={updateProfile} />}
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-4">
                  {profile && <ProfileNotifications profile={profile} updateProfile={updateProfile} />}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
