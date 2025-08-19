import ErrorForm from "@/components/error-form";

export default function ErrorReport() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">오류 신고</h2>
          <p className="text-sm text-gray-600 mt-1">
            발견된 오류를 신고해 주세요. 상세한 정보를 제공할수록 빠른 해결이 가능합니다.
          </p>
        </div>
        <ErrorForm />
      </div>
    </div>
  );
}
