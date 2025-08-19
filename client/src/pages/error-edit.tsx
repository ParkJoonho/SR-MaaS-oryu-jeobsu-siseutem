import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, ChevronLeft, Save, Paperclip, Calendar, User, Monitor, Smartphone, Brain, Loader2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Error } from "@shared/schema";

interface ErrorEditProps {
  errorId: string;
}

export default function ErrorEdit({ errorId }: ErrorEditProps) {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processingNote, setProcessingNote] = useState("");
  const [status, setStatus] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: error, isLoading } = useQuery<Error>({
    queryKey: ['/api/errors', errorId],
    queryFn: async () => {
      return apiRequest(`/api/errors/${errorId}`);
    },
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setStatus(error.status);
    }
  }, [error]);

  const updateErrorMutation = useMutation({
    mutationFn: async ({ status, processingNote }: { status: string; processingNote?: string }) => {
      const updateData: any = { status };
      if (processingNote) {
        updateData.processingNote = processingNote;
      }
      await apiRequest(`/api/errors/${errorId}`, 'PATCH', updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/errors'] });
      toast({
        title: "저장 완료",
        description: "오류 처리 내용이 성공적으로 저장되었습니다.",
      });
      setLocation('/admin-dashboard');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다. 다시 로그인하겠습니다...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "저장 실패",
        description: "오류 처리 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (saveType: string = "저장") => {
    let finalStatus = status;
    
    // Set status based on save type
    if (saveType === "보류") {
      finalStatus = "보류";
    } else if (saveType === "임시저장") {
      finalStatus = "처리중";
    } else if (!status) {
      toast({
        title: "상태 선택 필요",
        description: "오류 상태를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    updateErrorMutation.mutate({ status: finalStatus, processingNote });
  };

  const handleBack = () => {
    setLocation('/admin-dashboard');
  };

  const formatSystemName = (system: string) => {
    switch(system) {
      case '역무지원': return '역무지원 시스템';
      case '안전관리': return '안전관리 시스템';
      case '시설물관리': return '시설물관리 시스템';
      default: return system;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "긴급":
        return "bg-red-100 text-red-800";
      case "높음":
        return "bg-yellow-100 text-yellow-800";
      case "보통":
        return "bg-blue-100 text-blue-800";
      case "낮음":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const nextImage = () => {
    if (error?.attachments && error.attachments.length > 0 && currentImageIndex < error.attachments.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageAnalysis(""); // Clear previous analysis when switching images
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setImageAnalysis(""); // Clear previous analysis when switching images
    }
  };

  const handleAnalyzeImage = async () => {
    if (!hasAttachments || attachments.length === 0) {
      toast({
        title: "분석 불가",
        description: "분석할 이미지가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const currentImagePath = attachments[currentImageIndex];
      const response = await apiRequest('/api/errors/analyze-image', 'POST', {
        imagePath: currentImagePath
      });
      
      setImageAnalysis(response.analysis);
      toast({
        title: "분석 완료",
        description: "AI가 이미지를 성공적으로 분석했습니다.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다. 다시 로그인하겠습니다...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error('Error analyzing image:', error);
      toast({
        title: "분석 실패",
        description: "이미지 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류를 찾을 수 없습니다</h1>
          <Button onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const hasAttachments = error.attachments && error.attachments.length > 0;
  const attachments = error.attachments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack} data-testid="button-back">
                <ChevronLeft className="w-5 h-5 mr-2" />
                목록으로 돌아가기
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">오류 편집 - #{error.id}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getPriorityColor(error.priority)}>
                {error.priority}
              </Badge>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSave("보류")} 
                  disabled={updateErrorMutation.isPending}
                  variant="outline" 
                  data-testid="button-hold"
                >
                  보류
                </Button>
                <Button 
                  onClick={() => handleSave("임시저장")} 
                  disabled={updateErrorMutation.isPending}
                  variant="outline" 
                  data-testid="button-temp-save"
                >
                  임시저장
                </Button>
                <Button 
                  onClick={() => handleSave("저장")} 
                  disabled={updateErrorMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateErrorMutation.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Error Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  오류 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">제목</label>
                  <p className="text-sm text-gray-900 font-medium mt-1">{error.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">시스템</label>
                    <p className="text-sm text-gray-900 mt-1">{formatSystemName(error.system)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">상태</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="접수됨">접수됨</SelectItem>
                        <SelectItem value="처리중">처리중</SelectItem>
                        <SelectItem value="완료">완료</SelectItem>
                        <SelectItem value="보류">보류</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      신고일
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {error.createdAt ? new Date(error.createdAt).toLocaleString('ko-KR') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      신고자 ID
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{error.reporterId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Environment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  시스템 환경
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">브라우저</label>
                  <p className="text-sm text-gray-900 mt-1 break-all">{error.browser || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">운영체제</label>
                  <p className="text-sm text-gray-900 mt-1">{error.os || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Error Content */}
            <Card>
              <CardHeader>
                <CardTitle>오류 내용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{error.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Processing Notes */}
            <Card>
              <CardHeader>
                <CardTitle>처리 내용</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="오류 처리 내용을 입력하세요..."
                  value={processingNote}
                  onChange={(e) => setProcessingNote(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-processing-note"
                />
                
                {/* Save Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    onClick={() => handleSave("보류")} 
                    disabled={updateErrorMutation.isPending}
                    variant="outline" 
                    data-testid="button-hold-bottom"
                  >
                    보류
                  </Button>
                  <Button 
                    onClick={() => handleSave("임시저장")} 
                    disabled={updateErrorMutation.isPending}
                    variant="outline" 
                    data-testid="button-temp-save-bottom"
                  >
                    임시저장
                  </Button>
                  <Button 
                    onClick={() => handleSave("저장")} 
                    disabled={updateErrorMutation.isPending}
                    data-testid="button-save-bottom"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateErrorMutation.isPending ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Image Viewer */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Paperclip className="w-5 h-5 mr-2" />
                    첨부파일
                  </div>
                  {hasAttachments && (
                    <div className="text-sm text-gray-500">
                      {currentImageIndex + 1} / {attachments.length}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasAttachments ? (
                  <div className="space-y-4">
                    {/* Image Viewer */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                      <img
                        src={attachments[currentImageIndex].startsWith('/uploads/') 
                          ? attachments[currentImageIndex] 
                          : `/uploads/${attachments[currentImageIndex]}`}
                        alt={`첨부파일 ${currentImageIndex + 1}`}
                        className="max-w-full max-h-[400px] object-contain"
                        data-testid={`image-viewer-${currentImageIndex}`}
                      />
                      
                      {/* Navigation Arrows */}
                      {attachments.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            data-testid="button-prev-image"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={nextImage}
                            disabled={currentImageIndex === attachments.length - 1}
                            data-testid="button-next-image"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {attachments.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {attachments.map((filename, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setImageAnalysis(""); // Clear analysis when switching via thumbnail
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            data-testid={`thumbnail-${index}`}
                          >
                            <img
                              src={filename.startsWith('/uploads/') ? filename : `/uploads/${filename}`}
                              alt={`썸네일 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* File Information */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">파일명:</span>{' '}
                        {attachments[currentImageIndex].split('/').pop()}
                      </p>
                      <div className="flex items-center justify-between">
                        <a
                          href={attachments[currentImageIndex].startsWith('/uploads/') 
                            ? attachments[currentImageIndex] 
                            : `/uploads/${attachments[currentImageIndex]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          data-testid={`link-download-${currentImageIndex}`}
                        >
                          원본 파일 다운로드
                        </a>
                        <Button
                          onClick={handleAnalyzeImage}
                          disabled={isAnalyzing}
                          size="sm"
                          className="ml-2"
                          data-testid="button-analyze-image"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              분석 중...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              AI 분석
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* AI Analysis Results */}
                    {imageAnalysis && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Brain className="w-5 h-5 text-blue-600 mr-2" />
                          <h4 className="text-sm font-semibold text-blue-800">AI 오류 분석 결과</h4>
                        </div>
                        <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                          {imageAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Paperclip className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>첨부된 파일이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}