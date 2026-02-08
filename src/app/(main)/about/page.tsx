"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_about")} />
      
      <Card>
        <CardHeader>
          <CardTitle>회사 소개</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
            <p>
              AutoZone.mn은 몽골 최대의 자동차 통합 플랫폼입니다. 중고차 매매, 렌탈, 부품 및 타이어 판매, 
              서비스 센터 정보를 한 곳에서 제공하여 고객의 자동차 관련 모든 니즈를 충족시킵니다.
            </p>
            <p>
              저희는 2024년 설립 이후 몽골 자동차 시장의 디지털 전환을 선도하고 있으며, 
              안전하고 투명한 거래 환경을 제공하기 위해 노력하고 있습니다.
            </p>
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-zinc-900">주요 서비스</h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-600">
                <li>중고차 매매 중개</li>
                <li>차량 렌탈 서비스</li>
                <li>부품 및 타이어 판매</li>
                <li>서비스 센터 정보 제공</li>
              </ul>
            </div>
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-zinc-900">연락처</h3>
              <p className="text-zinc-600">
                이메일: info@autozone.mn<br />
                전화: 1533-6451<br />
                주소: 울란바토르, 몽골
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


