
import { useState, useRef } from 'react';
import { ArrowLeft, Plus, Upload, X, User, FileText, Image, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Personality, CreatePersonalityRequest } from '../types/personalities';

interface PersonalityManagerProps {
  onClose: () => void;
  onSelectPersonality?: (personality: Personality) => void;
}

export const PersonalityManager: React.FC<PersonalityManagerProps> = ({ 
  onClose, 
  onSelectPersonality 
}) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit'>('list');
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [editingPersonality, setEditingPersonality] = useState<Personality | null>(null);
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [starterPhrases, setStarterPhrases] = useState<string[]>(['']);
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    setActiveView('create');
    resetForm();
  };

  const handleEditPersonality = (personality: Personality) => {
    setEditingPersonality(personality);
    setName(personality.name);
    setDescription(personality.description);
    setInstructions(personality.instructions);
    setStarterPhrases(personality.starterPhrases.length > 0 ? personality.starterPhrases : ['']);
    setAvatarPreview(personality.avatarUrl || null);
    setActiveView('edit');
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setInstructions('');
    setStarterPhrases(['']);
    setKnowledgeFiles([]);
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditingPersonality(null);
  };

  const handleBackToList = () => {
    setActiveView('list');
    resetForm();
  };

  const handleSavePersonality = async () => {
    if (!name.trim() || !description.trim() || !instructions.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre, descripción e instrucciones",
        variant: "destructive"
      });
      return;
    }

    try {
      const newPersonality: Personality = {
        id: editingPersonality?.id || Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        starterPhrases: starterPhrases.filter(phrase => phrase.trim()),
        knowledgeFiles: [], // TODO: Handle file uploads
        avatarUrl: avatarPreview || undefined,
        isActive: true,
        createdAt: editingPersonality?.createdAt || new Date(),
        updatedAt: new Date(),
        userId: 'current-user' // TODO: Get from auth context
      };

      if (editingPersonality) {
        setPersonalities(prev => prev.map(p => p.id === editingPersonality.id ? newPersonality : p));
        toast({
          title: "Personalidad actualizada",
          description: `${newPersonality.name} ha sido actualizada exitosamente`
        });
      } else {
        setPersonalities(prev => [...prev, newPersonality]);
        toast({
          title: "Personalidad creada",
          description: `${newPersonality.name} ha sido creada exitosamente`
        });
      }

      handleBackToList();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la personalidad",
        variant: "destructive"
      });
    }
  };

  const handleDeletePersonality = (personality: Personality) => {
    setPersonalities(prev => prev.filter(p => p.id !== personality.id));
    toast({
      title: "Personalidad eliminada",
      description: `${personality.name} ha sido eliminada`
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    setKnowledgeFiles(prev => [...prev, ...validFiles]);
  };

  const handleAvatarUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo no válido",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive"
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addStarterPhrase = () => {
    setStarterPhrases(prev => [...prev, '']);
  };

  const updateStarterPhrase = (index: number, value: string) => {
    setStarterPhrases(prev => prev.map((phrase, i) => i === index ? value : phrase));
  };

  const removeStarterPhrase = (index: number) => {
    setStarterPhrases(prev => prev.filter((_, i) => i !== index));
  };

  if (activeView === 'list') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-gray-900 dark:text-white">Personalidades</h3>
          </div>
          <Button
            onClick={handleCreateNew}
            size="sm"
            className="bg-skandia-green hover:bg-skandia-green/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {personalities.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay personalidades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea tu primera personalidad personalizada
              </p>
              <Button onClick={handleCreateNew} className="bg-skandia-green hover:bg-skandia-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Crear personalidad
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {personalities.map((personality) => (
                <Card 
                  key={personality.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectPersonality?.(personality)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          {personality.avatarUrl ? (
                            <img 
                              src={personality.avatarUrl} 
                              alt={personality.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{personality.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {personality.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPersonality(personality);
                          }}
                          className="h-8 w-8"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePersonality(personality);
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{personality.knowledgeFiles.length} archivos</span>
                      <span>{personality.starterPhrases.length} frases</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToList}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {activeView === 'create' ? 'Nueva Personalidad' : 'Editar Personalidad'}
          </h3>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBackToList}>
            Cancelar
          </Button>
          <Button onClick={handleSavePersonality} className="bg-skandia-green hover:bg-skandia-green/90">
            {activeView === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-2xl">
          {/* Avatar */}
          <div className="text-center">
            <div 
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-lg"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Image className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Cargar foto</span>
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleAvatarUpload(e.target.files)}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">Haz clic para cargar una imagen</p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe un nombre para tu personalidad"
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega una descripción breve de lo que hace esta personalidad"
              className="w-full"
              rows={3}
            />
          </div>

          {/* Instrucciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instrucciones *
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="¿Qué hace esta personalidad? ¿Cómo se comporta? ¿Qué debe evitar hacer?"
              className="w-full"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Las conversaciones con tu personalidad pueden potencialmente incluir todas las instrucciones proporcionadas o parte de ellas.
            </p>
          </div>

          {/* Frases para iniciar conversación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frases para iniciar una conversación
            </label>
            <div className="space-y-2">
              {starterPhrases.map((phrase, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={phrase}
                    onChange={(e) => updateStarterPhrase(index, e.target.value)}
                    placeholder="Ejemplo: ¿Cómo puedo ayudarte hoy?"
                    className="flex-1"
                  />
                  {starterPhrases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStarterPhrase(index)}
                      className="h-10 w-10 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addStarterPhrase}
                className="w-full"
                disabled={starterPhrases.length >= 4}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar frase
              </Button>
            </div>
          </div>

          {/* Conocimientos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conocimientos
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Las conversaciones con tu personalidad pueden potencialmente revelar todos los archivos cargados o parte de ellos.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Arrastra archivos aquí o
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Cargar archivos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {knowledgeFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {knowledgeFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setKnowledgeFiles(prev => prev.filter((_, i) => i !== index))}
                      className="h-6 w-6 text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
