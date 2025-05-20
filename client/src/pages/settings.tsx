import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, Upload, Check, AlertCircle, Image, PenTool } from 'lucide-react';
import { Link } from 'wouter';

interface UserSettings {
  id: string;
  userId: string;
  logoPath: string | null;
  signaturePath: string | null;
  address: string | null;
  oabNumber: string | null;
  useWatermark: boolean;
  logoUrl?: string | null;
  signatureUrl?: string | null;
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState('');
  const [oabNumber, setOabNumber] = useState('');
  const [useWatermark, setUseWatermark] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  
  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    onSuccess: (data: UserSettings) => {
      if (data) {
        setAddress(data.address || '');
        setOabNumber(data.oabNumber || '');
        setUseWatermark(data.useWatermark || false);
        
        // Set image previews from URLs
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
        
        if (data.signatureUrl) {
          setSignaturePreview(data.signatureUrl);
        }
      }
    }}
  });
  
  // Mutation to update text settings
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { address?: string; oabNumber?: string; useWatermark?: boolean }) => 
      apiRequest('POST', '/api/settings/update', data),
    onSuccess: () => {
      toast({
        title: 'Configurações atualizadas',
        description: 'Suas configurações foram salvas com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      return apiRequest('POST', '/api/settings/upload-logo', formData);
    },
    onSuccess: () => {
      toast({
        title: 'Logo atualizado',
        description: 'Seu logo foi salvo com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setLogoFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do logo.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to upload signature
  const uploadSignatureMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('signature', file);
      return apiRequest('POST', '/api/settings/upload-signature', formData);
    },
    onSuccess: () => {
      toast({
        title: 'Assinatura atualizada',
        description: 'Sua assinatura foi salva com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setSignatureFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload da assinatura.',
        variant: 'destructive',
      });
    }
  });
  
  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      address,
      oabNumber,
      useWatermark
    });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignatureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };
  
  const handleSignatureUpload = () => {
    if (signatureFile) {
      uploadSignatureMutation.mutate(signatureFile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-[#9F85FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="mb-4">Você precisa estar autenticado para acessar esta página.</p>
        <Button asChild>
          <a href="/api/login">Entrar</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Personalize as configurações do seu escritório de advocacia para uso em documentos e impressões.
        </p>
      </div>
      
      <Tabs defaultValue="documentos" className="max-w-4xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documentos">Informações para Documentos</TabsTrigger>
          <TabsTrigger value="identidade">Identidade Visual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Escritório</CardTitle>
              <CardDescription>
                Essas informações serão utilizadas automaticamente na geração de documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço do Escritório</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento, bairro, cidade/UF"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="oabNumber">Número da OAB</Label>
                <Input
                  id="oabNumber"
                  placeholder="OAB/XX 123456"
                  value={oabNumber}
                  onChange={(e) => setOabNumber(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="useWatermark" 
                  checked={useWatermark}
                  onCheckedChange={(checked) => setUseWatermark(checked === true)}
                />
                <Label htmlFor="useWatermark">
                  Adicionar marca d'água com o logo do escritório nos documentos gerados
                </Label>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button 
                onClick={handleUpdateSettings}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </div> : 
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </div>
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="identidade" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo do Escritório</CardTitle>
                <CardDescription>
                  O logo será usado na geração de documentos e marca d'água.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50">
                  {logoPreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={logoPreview} 
                        alt="Preview do logo" 
                        className="max-h-[120px] max-w-full object-contain mb-4" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Alterar Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Image className="h-10 w-10 text-gray-400" />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar Logo
                      </Button>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 5MB.
                </p>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  onClick={handleLogoUpload}
                  disabled={!logoFile || uploadLogoMutation.isPending}
                  variant={!logoFile ? "outline" : "default"}
                >
                  {uploadLogoMutation.isPending ? 
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </div> : 
                    <div className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Salvar Logo
                    </div>
                  }
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Assinatura Digital</CardTitle>
                <CardDescription>
                  Sua assinatura será adicionada automaticamente em documentos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50">
                  {signaturePreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={signaturePreview} 
                        alt="Preview da assinatura" 
                        className="max-h-[120px] max-w-full object-contain mb-4" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => document.getElementById('signature-upload')?.click()}
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Alterar Assinatura
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <PenTool className="h-10 w-10 text-gray-400" />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('signature-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar Assinatura
                      </Button>
                    </div>
                  )}
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    className="hidden"
                    onChange={handleSignatureChange}
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 5MB.
                </p>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  onClick={handleSignatureUpload}
                  disabled={!signatureFile || uploadSignatureMutation.isPending}
                  variant={!signatureFile ? "outline" : "default"}
                >
                  {uploadSignatureMutation.isPending ? 
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </div> : 
                    <div className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Salvar Assinatura
                    </div>
                  }
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Importante</h3>
                <p className="text-sm text-amber-700 mt-1">
                  As imagens enviadas serão usadas para personalização de documentos. 
                  Para melhor qualidade, utilize arquivos com fundo transparente (PNG ou SVG) 
                  sempre que possível.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}