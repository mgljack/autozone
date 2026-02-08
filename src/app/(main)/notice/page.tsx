"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";

export default function NoticePage() {
  const { t } = useI18n();
  
  const notices = [
    {
      id: 1,
      title: "서비스 오픈 안내",
      date: "2024.01.15",
      content: "AutoZone.mn 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.",
      important: true,
    },
    {
      id: 2,
      title: "신규 기능 업데이트 안내",
      date: "2024.01.10",
      content: "차량 상세 페이지에 옵션 정보 보기 기능이 추가되었습니다.",
      important: false,
    },
    {
      id: 3,
      title: "개인정보 처리방침 변경 안내",
      date: "2024.01.05",
      content: "개인정보 처리방침이 일부 변경되었습니다. 자세한 내용은 이용약관을 참고해주세요.",
      important: false,
    },
    {
      id: 4,
      title: "시스템 점검 안내",
      date: "2024.01.01",
      content: "2024년 1월 1일 00:00 ~ 06:00 시스템 점검으로 인해 서비스 이용이 제한됩니다.",
      important: false,
    },
  ];

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_notice")} />
      
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {notice.important && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
                        중요
                      </span>
                    )}
                    <h3 className="font-semibold text-zinc-900">{notice.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-600">{notice.content}</p>
                  <p className="text-xs text-zinc-400">{notice.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


