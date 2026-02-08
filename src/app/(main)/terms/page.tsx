"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_terms")} />
      
      <Card>
        <CardHeader>
          <CardTitle>이용약관</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제1조 (목적)</h3>
              <p className="text-zinc-600">
                본 약관은 AutoZone.mn(이하 "회사")이 제공하는 온라인 자동차 중개 서비스의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제2조 (정의)</h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-600">
                <li>"서비스"란 회사가 제공하는 자동차 매매, 렌탈, 부품 판매 등의 중개 서비스를 의미합니다.</li>
                <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 회원 및 비회원을 의미합니다.</li>
                <li>"판매자"란 서비스를 통해 자동차, 부품 등을 판매하는 이용자를 의미합니다.</li>
                <li>"구매자"란 서비스를 통해 자동차, 부품 등을 구매하는 이용자를 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제3조 (약관의 효력 및 변경)</h3>
              <p className="text-zinc-600">
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 
                변경된 약관은 전항과 같은 방법으로 공지함으로써 효력을 발생합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제4조 (서비스의 제공 및 변경)</h3>
              <p className="text-zinc-600">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 mt-2">
                <li>중고차 매매 중개 서비스</li>
                <li>차량 렌탈 중개 서비스</li>
                <li>부품 및 타이어 판매 중개 서비스</li>
                <li>서비스 센터 정보 제공 서비스</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제5조 (이용자의 의무)</h3>
              <p className="text-zinc-600">
                이용자는 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 mt-2">
                <li>허위 정보의 등록</li>
                <li>타인의 정보 도용</li>
                <li>서비스의 안정적 운영을 방해하는 행위</li>
                <li>관련 법령 및 본 약관을 위반하는 행위</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-zinc-900 mb-2">제6조 (책임의 제한)</h3>
              <p className="text-zinc-600">
                회사는 중개 서비스 제공자로서 거래 당사자 간의 거래에 대하여 책임을 지지 않으며, 
                실제 거래는 거래 당사자 간에 직접 이루어집니다. 회사는 이용자가 서비스를 이용하여 
                기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임을 지지 않습니다.
              </p>
            </section>

            <div className="mt-6 pt-4 border-t border-zinc-200">
              <p className="text-xs text-zinc-500">
                본 약관은 2024년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


