import { useState, useEffect } from "react";
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
import { Wand2, Loader2, Bug, Send, ArrowLeft } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

const formSchema = insertErrorSchema.extend({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(10, "내용을 최소 10자 이상 입력해주세요"),
}).omit({ reporterId: true });

type FormData = z.infer<typeof formSchema>;

export default function ErrorSubmitPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [contentLength, setContentLength] = useState(0);

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const generateTitleMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("/api/generate-title", "POST", { content });
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

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("/api/errors", "POST", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "오류가 성공적으로 접수되었습니다",
        description: "담당자가 확인 후 처리해드리겠습니다.",
      });
      form.reset();
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

  const handleContentChange = (value: string) => {
    setContentLength(value.length);
    form.setValue("content", value);
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
                <Bug className="inline-block w-6 h-6 text-blue-600 mr-2" />
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
              <h1 className="text-xl font-bold text-gray-900">
                <Bug className="inline-block w-6 h-6 text-blue-600 mr-2" />
                SR-MaaS 통합정보시스템 오류 관리 시스템
              </h1>
            </div>
            <Button onClick={() => window.location.href = "/api/logout"} variant="outline" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bug className="w-12 h-12 text-blue-600 mr-4" />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="우선순위를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="긴급">긴급</SelectItem>
                            <SelectItem value="높음">높음</SelectItem>
                            <SelectItem value="보통">보통</SelectItem>
                            <SelectItem value="낮음">낮음</SelectItem>
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
                      <FormLabel>
                        제목 <span className="text-blue-600">(오류 접수)</span>
                      </FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="오류 제목을 입력하거나 오류 접수를 위해 내용을 먼저 작성하세요"
                            data-testid="input-error-title"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateTitle}
                          disabled={generateTitleMutation.isPending || contentLength < 10}
                          data-testid="button-generate-title"
                        >
                          {generateTitleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Wand2 className="w-4 h-4 mr-1" />
                          )}
                          오류 접수
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        내용을 10자 이상 입력하면 자동으로 제목을 생성할 수 있습니다.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>오류 내용</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleContentChange(e.target.value);
                          }}
                          placeholder="오류가 발생한 상황과 재현 방법을 자세히 설명해주세요..."
                          className="min-h-[120px] resize-none"
                          data-testid="textarea-error-content"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span data-testid="text-content-length">{contentLength}자</span>
                        <span>최소 10자 이상 입력 시 제목 생성 가능</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="browser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>브라우저 정보</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            readOnly
                            data-testid="input-browser-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="os"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>운영체제 정보</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            value={field.value || ""}
                            data-testid="input-os-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitMutation.isPending}
                    className="px-8"
                    data-testid="button-submit-error"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    오류 접수하기
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