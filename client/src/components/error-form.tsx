import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertErrorSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wand2, Upload, RotateCcw, Send } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const formSchema = insertErrorSchema.extend({
  reporterId: z.string().optional()
});

export default function ErrorForm() {
  const [contentLength, setContentLength] = useState(0);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "보통",
      system: "웹 프론트엔드",
      browser: "",
      os: "",
    },
  });

  const createErrorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/errors", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "오류가 성공적으로 신고되었습니다.",
      });
      form.reset();
      setContentLength(0);
      queryClient.invalidateQueries({ queryKey: ['/api/errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/errors'] });
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
        title: "오류",
        description: "오류 신고 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const generateTitleMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-title", { content });
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("title", data.title);
      toast({
        title: "제목 생성 완료",
        description: "제목이 자동으로 생성되었습니다.",
      });
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
        title: "제목 생성 실패",
        description: "제목 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createErrorMutation.mutate(values);
  };

  const handleGenerateTitle = () => {
    const content = form.getValues("content");
    if (content.length < 10) {
      toast({
        title: "내용 부족",
        description: "내용을 10자 이상 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }
    generateTitleMutation.mutate(content);
  };

  const handleReset = () => {
    form.reset();
    setContentLength(0);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* AI Title Generation Section */}
        <div className="space-y-2">
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
                    onClick={handleGenerateTitle}
                    disabled={generateTitleMutation.isPending}
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
        </div>

        {/* Error Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>오류 내용 <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  placeholder="발견된 오류에 대해 자세히 설명해 주세요..."
                  onChange={(e) => {
                    field.onChange(e);
                    setContentLength(e.target.value.length);
                  }}
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

        {/* Priority and System Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>우선순위</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="낮음">낮음</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="높음">높음</SelectItem>
                    <SelectItem value="긴급">긴급</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="system"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시스템 분류</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-system">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="웹 프론트엔드">웹 프론트엔드</SelectItem>
                    <SelectItem value="백엔드 API">백엔드 API</SelectItem>
                    <SelectItem value="데이터베이스">데이터베이스</SelectItem>
                    <SelectItem value="모바일 앱">모바일 앱</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional System Information */}
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
                    placeholder="Chrome 119.0.0.0"
                    data-testid="input-browser"
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
                <FormLabel>운영체제</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Windows 11"
                    data-testid="input-os"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">스크린샷/파일 첨부</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>파일을 업로드하거나</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    data-testid="input-file-upload"
                  />
                </label>
                <p className="pl-1">드래그 앤 드롭하세요</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF 최대 10MB</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            초기화
          </Button>
          <Button
            type="submit"
            disabled={createErrorMutation.isPending}
            data-testid="button-submit"
          >
            {createErrorMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Send className="w-4 h-4 mr-1" />
            )}
            오류 신고
          </Button>
        </div>
      </form>
    </Form>
  );
}
