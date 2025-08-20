import { useState, useEffect, useRef } from "react";

// Web Speech API 타입 선언
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertErrorSchema } from "@shared/schema";
import { z } from "zod";
import { Wand2, Loader2, Bug, Send, ArrowLeft, Upload, X, FileImage, Mic } from "lucide-react";
import logoImage from "@assets/CIBI_basic_1755647078820.png";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";

const formSchema = insertErrorSchema.extend({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(10, "내용을 최소 10자 이상 입력해주세요"),
}).omit({ reporterId: true });

type FormData = z.infer<typeof formSchema>;

export default function ErrorSubmitPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [contentLength, setContentLength] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Web Speech API 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ko-KR'; // 한국어 설정
        
        recognitionInstance.onstart = () => {
          console.log('음성 인식 시작됨');
        };
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          
          if (transcript) {
            // 음성 인식 결과를 처리하는 별도 함수 호출
            handleSpeechResult(transcript);
          }
        };
        
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('음성 인식 오류:', event.error);
          setIsVoiceRecording(false);
          
          let errorMessage = '음성 인식 중 오류가 발생했습니다.';
          if (event.error === 'not-allowed') {
            errorMessage = '마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.';
          } else if (event.error === 'no-speech') {
            errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
          }
          
          toast({
            title: "음성 인식 오류",
            description: errorMessage,
            variant: "destructive",
          });
        };
        
        recognitionInstance.onend = () => {
          console.log('음성 인식 종료됨');
          setIsVoiceRecording(false);
          
          // 음성 인식 완료 후 시스템 분류 재시도
          const currentContent = form.getValues('content');
          if (currentContent && currentContent.length >= 10) {
            setTimeout(() => {
              analyzeSystemMutation.mutate(currentContent);
            }, 500); // 0.5초 후 시스템 분석 재시도
          }
        };
        
        recognitionRef.current = recognitionInstance;
        setRecognition(recognitionInstance);
      } else {
        toast({
          title: "음성 인식 지원 안됨",
          description: "이 브라우저는 음성 인식을 지원하지 않습니다.",
          variant: "destructive",
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // 음성 인식 결과 처리 함수
  const handleSpeechResult = (transcript: string) => {
    const currentContent = form.getValues('content');
    const newContent = currentContent ? `${currentContent} ${transcript}` : transcript;
    form.setValue('content', newContent);
    setContentLength(newContent.length);
    
    // 자동 제목 생성 및 시스템 분석 트리거
    if (newContent.length >= 10) {
      // 음성 인식 완료 후 시스템 분석 강제 실행
      setTimeout(() => {
        analyzeSystemMutation.mutate(newContent);
      }, 1000); // 1초 후 시스템 분석 실행
      
      handleContentChange(newContent);
    }
  };

  const getSystemInfo = () => {
    const userAgent = navigator.userAgent;
    
    let systemName = "알 수 없음";
    if (userAgent.includes("Windows NT 10.0")) systemName = "Windows 10/11";
    else if (userAgent.includes("Windows NT 6.3")) systemName = "Windows 8.1";
    else if (userAgent.includes("Windows NT 6.2")) systemName = "Windows 8";
    else if (userAgent.includes("Windows NT 6.1")) systemName = "Windows 7";
    else if (userAgent.includes("Mac OS X")) {
      const macMatch = userAgent.match(/Mac OS X ([0-9_]+)/);
      if (macMatch) {
        const version = macMatch[1].replace(/_/g, '.');
        systemName = `macOS ${version}`;
      } else {
        systemName = "macOS";
      }
    }
    else if (userAgent.includes("Linux")) systemName = "Linux";
    else if (userAgent.includes("Android")) systemName = "Android";
    else if (userAgent.includes("iPhone")) systemName = "iOS (iPhone)";
    else if (userAgent.includes("iPad")) systemName = "iOS (iPad)";

    return systemName;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      system: "역무지원",
      priority: "보통",
      browser: navigator.userAgent,
      os: navigator.platform,
    },
  });

  // 자동 제목 생성 뮤테이션
  const generateTitleMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('/api/errors/generate-title', 'POST', { content });
      return response;
    },
    onSuccess: (data: any) => {
      form.setValue("title", data.title);
      toast({
        title: "제목 생성 완료",
        description: "제목이 자동으로 생성되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "제목 생성 실패",
        description: "제목 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 시스템 자동 분석 뮤테이션
  const analyzeSystemMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('/api/errors/analyze-system', 'POST', { content });
      return response;
    },
    onSuccess: (data: any) => {
      // 강제로 리렌더링을 위해 setValue 호출 후 trigger
      form.setValue("system", data.system, { shouldDirty: true });
      form.trigger("system"); // 필드 재검증 및 UI 업데이트 트리거
      toast({
        title: "시스템 분석 완료",
        description: `${data.system} 시스템으로 자동 분류되었습니다.`,
      });
    },
    onError: (error) => {
      console.error("System analysis error:", error);
      // 시스템 분석 실패 시에는 사용자에게 알리지 않고 조용히 처리
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // FormData 객체 생성 (파일 업로드용)
      const formData = new FormData();
      
      // 기본 데이터 추가
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // 파일 첨부
      attachments.forEach((file) => {
        formData.append(`attachments`, file);
      });
      
      const response = await fetch("/api/errors", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "오류가 성공적으로 접수되었습니다",
        description: "담당자가 확인 후 처리해드리겠습니다.",
      });
      form.reset();
      setAttachments([]);
      setContentLength(0);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류 접수 실패",
        description: "오류 접수 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  const handleGenerateTitle = () => {
    const content = form.getValues("content");
    if (content.length < 10) {
      toast({
        title: "내용이 부족합니다",
        description: "제목 생성을 위해 내용을 10자 이상 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    generateTitleMutation.mutate(content);
  };

  // 내용 변경 시 자동으로 제목 생성 및 시스템 분석하는 기능
  const handleContentChange = (value: string) => {
    const previousLength = contentLength;
    setContentLength(value.length);
    form.setValue("content", value);
    
    // 이전에는 10자 미만이었지만 현재 10자 이상이 되었을 때만 자동 생성
    if (previousLength < 10 && value.length >= 10) {
      // 제목이 비어있을 때만 제목 자동 생성
      if (!form.getValues("title")) {
        try {
          generateTitleMutation.mutate(value);
        } catch (error) {
          console.error("Title generation error:", error);
        }
      }
      
      // 내용이 10자 이상이면 항상 시스템 자동 분석 실행
      try {
        analyzeSystemMutation.mutate(value);
      } catch (error) {
        console.error("System analysis error:", error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB 제한
        
        if (!isValidType) {
          toast({
            title: "파일 형식 오류",
            description: "이미지 파일만 업로드할 수 있습니다.",
            variant: "destructive",
          });
        }
        
        if (!isValidSize) {
          toast({
            title: "파일 크기 오류",
            description: "파일 크기는 10MB 이하로 제한됩니다.",
            variant: "destructive",
          });
        }
        
        return isValidType && isValidSize;
      });
      
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // 최대 5개 파일
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 음성 입력 기능
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "음성 인식 불가",
        description: "음성 인식 기능을 사용할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (isVoiceRecording) {
      // 녹음 중지
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
      toast({
        title: "음성 입력 중지",
        description: "음성 입력이 중지되었습니다.",
      });
    } else {
      // 녹음 시작
      try {
        recognitionRef.current.start();
        setIsVoiceRecording(true);
        toast({
          title: "음성 입력 시작",
          description: "음성을 인식하고 있습니다. 다시 클릭하여 중지하세요.",
        });
      } catch (error) {
        console.error('음성 인식 시작 오류:', error);
        setIsVoiceRecording(false);
        toast({
          title: "음성 인식 시작 실패",
          description: "음성 인식을 시작할 수 없습니다. 마이크 권한을 확인해주세요.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                <img 
                  src={logoImage} 
                  alt="SRT Logo" 
                  className="inline-block w-6 h-6 mr-2 object-contain"
                />
                SR-MaaS 통합정보시스템 오류 관리 시스템
              </h1>
            </div>
            <Button onClick={() => window.location.href = "/api/logout"} variant="outline" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <Link href="/">
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer">
                  <img 
                    src={logoImage} 
                    alt="SRT Logo" 
                    className="inline-block w-6 h-6 mr-2 object-contain"
                  />
                  SR-MaaS 통합정보시스템 오류 관리 시스템
                </h1>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoImage} 
              alt="SRT Logo" 
              className="w-12 h-12 mr-4 object-contain"
            />
            <h1 className="text-3xl font-bold text-gray-900">오류 접수</h1>
          </div>
          <p className="text-lg text-gray-600">
            시스템 오류를 신고하고 빠른 해결을 받아보세요
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">오류 신고서 작성</CardTitle>
            <CardDescription>
              오류에 대한 상세한 정보를 입력해주시면, 더 빠르고 정확한 해결이 가능합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="system"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>시스템</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-system">
                              <SelectValue placeholder="시스템을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="역무지원">역무지원</SelectItem>
                            <SelectItem value="안전관리">안전관리</SelectItem>
                            <SelectItem value="시설물관리">시설물관리</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>우선순위</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="우선순위를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="긴급">🔴 긴급</SelectItem>
                            <SelectItem value="높음">🟠 높음</SelectItem>
                            <SelectItem value="보통">🟡 보통</SelectItem>
                            <SelectItem value="낮음">🟢 낮음</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>제목</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateTitle}
                          disabled={generateTitleMutation.isPending}
                          data-testid="button-generate-title"
                        >
                          {generateTitleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Wand2 className="w-4 h-4 mr-2" />
                          )}
                          자동 생성
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="오류의 간단한 제목을 입력하세요"
                            {...field}
                            data-testid="input-title"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>내용</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="relative">
                            <Textarea
                              placeholder="오류 상황을 자세히 설명해주세요. (최소 10자)"
                              className="min-h-[120px] resize-none pr-12"
                              {...field}
                              onChange={(e) => handleContentChange(e.target.value)}
                              data-testid="textarea-content"
                            />
                            <button
                              type="button"
                              onClick={handleVoiceInput}
                              className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 ${
                                isVoiceRecording 
                                  ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' 
                                  : recognition
                                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                              }`}
                              title={
                                !recognition 
                                  ? "음성 인식을 지원하지 않는 브라우저입니다" 
                                  : isVoiceRecording 
                                    ? "음성 입력 중지" 
                                    : "음성 입력 시작 (Google Web Speech API)"
                              }
                              disabled={!recognition}
                              data-testid="button-voice-input"
                            >
                              <Mic className={`w-5 h-5 ${isVoiceRecording ? 'scale-110' : ''} transition-transform duration-300`} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{contentLength} / 최소 10자</span>
                            {contentLength >= 10 && (
                              <span className="text-green-600 flex items-center">
                                <Wand2 className="w-4 h-4 mr-1" />
                                자동 제목 생성 가능
                              </span>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 이미지 첨부 섹션 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이미지 첨부 (선택사항)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        data-testid="input-file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          클릭하거나 파일을 드래그해서 이미지를 업로드하세요
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, GIF 파일만 가능 (최대 10MB, 5개 파일)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 첨부된 파일 목록 */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">첨부된 파일:</h4>
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileImage className="w-5 h-5 text-blue-500" />
                              <div>
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              data-testid={`button-remove-attachment-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">시스템 상세</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">브라우저:</span>
                      <div className="font-medium">Chrome</div>
                    </div>
                    <div>
                      <span className="text-gray-500">운영체제:</span>
                      <div className="font-medium">Win32</div>
                    </div>
                    <div>
                      <span className="text-gray-500">시스템:</span>
                      <div className="font-medium">Windows 10/11</div>
                    </div>
                    <div>
                      <span className="text-gray-500">화면 해상도:</span>
                      <div className="font-medium">1920 × 1080</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/">
                    <Button type="button" variant="outline" data-testid="button-cancel">
                      취소
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    오류 접수
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}