// src/pages/Documents.tsx

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// 1. Remova as importações do mock e a definição de 'Document' se estava lá
// import { saveDocument, getDocuments, deleteDocument } from '@/lib/db';
import apiClient from '@/lib/api'; // <--- 2. Importe o apiClient real
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 3. Defina o tipo Document aqui (ou importe de types.ts)
//    (Nota: O backend ainda não retorna esta lista, então o tipo é provisório)
type Document = {
  id: number; // Assumindo que o backend terá um ID numérico
  name: string;
  uploadedAt: string; // Ou Date, dependendo do que o backend retornar
  // Poderia ter mais campos, como 'chunk_count'
};


export default function Documents() {
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- 4. Comente ou remova o useQuery ---
  // O backend ainda não tem o endpoint GET /documents
  // A 'queryKey' também pode ser simplificada para ['documents']
  // const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
  //   queryKey: ['documents'],
  //   queryFn: async () => {
  //     const response = await apiClient.get('/documents');
  //     return response.data;
  //   },
  //   enabled: !!user || !!useAuthStore.getState().token,
  // });
  
  // Substitui por dados mocados VAZIOS por enquanto
  const documents: Document[] = [];
  const isLoadingDocuments = false; // Define como falso

  // --- 5. Modifique a mutation de upload ---
  const uploadMutation = useMutation({
    // mutationFn agora usa apiClient para chamar POST /documents/upload
    mutationFn: async (file: File) => {
      // Cria um objeto FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file); // 'file' é o nome do campo esperado pelo backend

      const response = await apiClient.post('/documents/upload', formData, {
        // Define o cabeçalho correto para envio de arquivos
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data; // O backend retorna { message: "..." }
    },
    onSuccess: (data) => {
      // queryClient.invalidateQueries({ queryKey: ['documents'] }); // Reativar quando GET existir
      toast({ title: 'Sucesso!', description: data.message });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.response?.data?.error || 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // --- 6. Comente ou remova a mutation de delete ---
  // O backend ainda não tem o endpoint DELETE /documents/<id>
  // const deleteMutation = useMutation({
  //   mutationFn: async (id: number) => { // ID é number
  //      await apiClient.delete(`/documents/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['documents'] });
  //     toast({ title: 'Documento removido!' });
  //   },
  //   onError: (error: any) => {
  //       toast({ title: 'Erro ao remover', description: error.response?.data?.error, variant: 'destructive' });
  //   }
  // });

  // Handler para quando um arquivo é selecionado (via clique ou drop)
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file && file.type === 'application/pdf') {
      // Chama a mutation de upload com o arquivo
      uploadMutation.mutate(file);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Apenas arquivos PDF são aceitos',
        variant: 'destructive',
      });
    }
  };

  // Funções para o Drag-and-Drop (sem mudanças lógicas)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []); // Adicione dependências vazias para useCallback

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Função de formatação de data (sem mudanças)
  const formatDate = (dateString: string) => {
    // ... (código existente)
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Documentos de Estudo</h1>
          <p className="text-muted-foreground mt-1">
            Envie PDFs para usar no chat com o Gênio Guiado
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Documento</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Componente Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`} // Feedback visual
            >
              {/* Input escondido */}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isPending} // Desabilita durante o upload
                id="file-upload" // Adiciona ID para o Label
              />
              {/* Conteúdo visual do dropzone */}
              {uploadMutation.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Enviando documento...
                  </p>
                </div>
              ) : (
                // Adiciona um Label para acessibilidade e clique
                <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Arraste e solte seus PDFs aqui
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            {/* // 7. Adiciona estado de loading para a lista */}
            {isLoadingDocuments ? (
              <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum documento enviado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                         {/* // 8. Adapta para o caso de não ter data ainda */}
                        {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Processando...'}
                      </p>
                    </div>
                    {/* // 9. Comenta o botão de deletar por enquanto */}
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      // onClick={() => deleteMutation.mutate(doc.id)} // ID é number
                      // disabled={deleteMutation.isPending && deleteMutation.variables === doc.id}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === doc.id ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                         <Trash2 className="h-4 w-4" />
                      )}
                    </Button> */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}