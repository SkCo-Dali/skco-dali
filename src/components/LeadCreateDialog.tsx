
import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lead, Priority } from "@/types/crm";
import { Plus, ChevronDown, Upload, FileText, RefreshCcw } from "lucide-react";

interface LeadCreateDialogProps {
  onLeadCreate: (leadData: Partial<Lead>) => void;
  children?: React.ReactNode;
}

export interface LeadCreateDialogRef {
  openDialog: () => void;
}

const productOptions = [
  "ACCAI",
  "C.A.T", 
  "CREA",
  "ENGRAV",
  "FCES",
  "FCO",
  "FCPIMP",
  "ICRFLO",
  "MFUND",
  "OMINMA",
  "OMPEV"
];

export const LeadCreateDialog = forwardRef<LeadCreateDialogRef, LeadCreateDialogProps>(
  ({ onLeadCreate, children }, ref) => {
    const [open, setOpen] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [productSelectOpen, setProductSelectOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Lead>>({
      name: '',
      email: '',
      phone: '',
      company: '',
      stage: 'Nuevo',
      priority: 'medium',
      source: 'DaliLM',
      value: 0,
      notes: '',
      documentType: '',
      documentNumber: undefined,
      product: ''
    });

    useImperativeHandle(ref, () => ({
      openDialog: () => setOpen(true)
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onLeadCreate({
        ...formData,
        documentNumber: formData.documentNumber || 0,
        product: selectedProducts.join(', ')
      });
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        stage: 'Nuevo',
        priority: 'medium',
        source: 'DaliLM',
        value: 0,
        notes: '',
        documentType: '',
        documentNumber: undefined,
        product: ''
      });
      setSelectedProducts([]);
      setShowMoreFields(false);
    };

    const handleProductToggle = (product: string) => {
      const updatedProducts = selectedProducts.includes(product)
        ? selectedProducts.filter(p => p !== product)
        : [...selectedProducts, product];
      
      setSelectedProducts(updatedProducts);
    };

    const getProductDisplayText = () => {
      const selectedCount = selectedProducts.length;
      if (selectedCount === 0) return "Producto de interés*";
      if (selectedCount === 1) return selectedProducts[0];
      return `${selectedCount} productos seleccionados`;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        setIsUploading(true);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
          }
        }, 200);
      }
    };

    const handleReplaceFile = () => {
      setUploadedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    };

    const handleBulkUpload = () => {
      // Implement bulk upload logic here
      console.log('Uploading file:', uploadedFile);
      setOpen(false);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Solo permitir números, espacios, guiones y paréntesis
      const numericValue = value.replace(/[^0-9\s\-\(\)]/g, '');
      setFormData({...formData, phone: numericValue});
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-center">¡Agrega tus leads!</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-full">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-8 py-2 text-sm font-medium transition-all duration-200"
              >
                Individual
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-8 py-2 text-sm font-medium transition-all duration-200"
              >
                Carga masiva
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value})}>
                      <SelectTrigger className="border-gray-300 rounded-lg h-12 bg-gray-50">
                        <SelectValue placeholder="Tipo de identificación*" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">Cédula de ciudadanía</SelectItem>
                        <SelectItem value="P">Pasaporte</SelectItem>
                        <SelectItem value="E">Cédula de Extranjería</SelectItem>
                        <SelectItem value="T">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="N">NIT</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.documentType && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Tipo de identificación*
                      </Label>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.documentNumber?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
                        setFormData({...formData, documentNumber: value ? Number(value) : undefined});
                      }}
                      className="border-gray-300 rounded-lg h-12 bg-gray-50"
                      placeholder="Número de identificación*"
                      required
                    />
                    {formData.documentNumber && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Número de identificación*
                      </Label>
                    )}
                  </div>
                </div>
                
                

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-gray-300 rounded-lg h-12 bg-gray-50"
                    placeholder="Nombres y apellidos*"
                    required
                  />
                  {formData.name && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Nombres y apellidos*
                    </Label>
                  )}
                </div>
                <div className="relative">
                  <Input
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="border-gray-300 rounded-lg h-12 bg-gray-50"
                    placeholder="Celular*"
                    required
                  />
                  {formData.phone && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Celular*
                    </Label>
                  )}
                </div>
              </div>    

                <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="border-gray-300 rounded-lg h-12 bg-gray-50"
                    placeholder="Correo electrónico*"
                    required
                  />
                  {formData.email && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Correo electrónico*
                    </Label>
                  )}
                </div>
                <div className="relative">
                  <Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full !px-4 justify-between border border-gray-300 rounded-lg h-12 bg-gray-50 font-normal hover:bg-gray-50"
                      >
                        <span className={selectedProducts.length === 0 ? "text-left text-muted-foreground" : ""}>
                          {getProductDisplayText()}
                        </span>
                        <ChevronDown className="h-4 w-4 text-[#00c83c]" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="max-h-60 overflow-y-auto">
                        {productOptions.map((product) => (
                          <div key={product} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                            <Checkbox
                              id={product}
                              checked={selectedProducts.includes(product)}
                              onCheckedChange={() => handleProductToggle(product)}
                            />
                            <label
                              htmlFor={product}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {product}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedProducts.length > 0 && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Producto de interés*
                    </Label>
                  )}
                </div>
                  </div>
                
               <div className="relative">
                  <Input
                    value={formData.campaign}
                    onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                    className="border-gray-300 rounded-lg h-12 bg-gray-50"
                    placeholder="Campaña"
                  />
                  {formData.campaign && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Campaña*
                    </Label>
                  )}
                </div>
                
                
                <div className="relative">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="border-gray-300 rounded-lg resize-none bg-gray-50 min-h-[80px]"
                    placeholder="Comentarios:"
                    rows={3}
                  />
                  {formData.notes && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Comentarios:
                    </Label>
                  )}
                </div>
                
                {showMoreFields && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Input
                          type="text"
                          value={formData.age?.toString() || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
                            setFormData({...formData, age: value ? Number(value) : undefined});
                          }}
                          className="border-gray-300 rounded-lg h-12 bg-gray-50"
                          placeholder="Edad"
                        />
                        {formData.age && (
                          <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                            Edad
                          </Label>
                        )}
                      </div>
                      
                      <div className="relative">
                        <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                          <SelectTrigger className="border-gray-300 rounded-lg h-12 bg-gray-50">
                            <SelectValue placeholder="Género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                            <SelectItem value="Prefiero no decirlo">Prefiero no decirlo</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.gender && (
                          <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                            Género
                          </Label>
                        )}
                      </div>
                    </div>
                   <div className="grid grid-cols-2 gap-4"> 
                    <div className="relative">
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="border-gray-300 rounded-lg h-12 bg-gray-50"
                        placeholder="Empresa"
                      />
                      {formData.company && (
                        <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                          Empresa
                        </Label>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Select value={formData.preferredContactChannel} onValueChange={(value) => setFormData({...formData, preferredContactChannel: value})}>
                        <SelectTrigger className="border-gray-300 rounded-lg h-12 bg-gray-50">
                          <SelectValue placeholder="Canal de contacto preferido" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Llamada">Llamada</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Correo">Correo</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.preferredContactChannel && (
                        <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                          Canal de contacto preferido
                        </Label>
                      )}
                    </div>
                  </div>
                </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowMoreFields(!showMoreFields)}
                  className="flex items-center text-[#00c83c] font-medium hover:text-green-600 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showMoreFields ? 'Ocultar más datos' : 'Añadir más datos'}
                </button>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#00c83c] to-[#00a532] hover:from-[#00a532] hover:to-[#008c2a] text-white font-medium h-10 rounded-full text-base mt-6 transition-all duration-200"
                >
                  Agregar lead
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-[#00c83c] rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Sube tu archivo de leads</h3>
              </div>
              
              <div className="flex items-center text-blue-500 cursor-pointer hover:text-blue-600 mb-6">
                <span className="mr-2">ℹ️</span>
                <span className="text-sm">¿Cómo debes subir tus archivos?</span>
              </div>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50">
                  <div className="flex flex-col items-center space-y-4">
                    <Upload className="h-12 w-12 text-green-500" />
                    <div>
                      <p className="text-gray-600 mb-2">Arrastra y suelta tu archivo aquí o</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <span className="text-blue-500 hover:text-blue-600 underline">selecciona un archivo</span>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Archivos soportados: .xlsx, .xls, .csv</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-green-300 rounded-xl p-6 bg-green-50">
                  <div className="flex flex-col items-center space-y-4">
                    <FileText className="h-12 w-12 text-blue-500" />
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">Carga completa</p>
                      <p className="text-gray-600">{uploadedFile.name}</p>
                    </div>
                    
                    <div className="w-full max-w-md">
                      <Progress value={uploadProgress} className="h-2" />
                      <div className="text-right mt-1">
                        <span className="text-sm font-medium">{uploadProgress}%</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleReplaceFile}
                      className="flex items-center text-blue-500 hover:text-blue-600 text-sm"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Reemplazar archivo
                    </button>
                    
                    <p className="text-sm text-gray-500">2/5 MB</p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleBulkUpload}
                disabled={!uploadedFile || isUploading}
                className="w-full bg-gradient-to-r from-[#00c83c] to-[#00a532] hover:from-[#00a532] hover:to-[#008c2a] text-white font-medium h-10 rounded-full text-base transition-all duration-200"
              >
                Cargar leads
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }
);

LeadCreateDialog.displayName = "LeadCreateDialog";
