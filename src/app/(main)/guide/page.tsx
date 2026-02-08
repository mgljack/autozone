"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";

export default function GuidePage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_guide")} />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>차량 구매 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">1. 차량 검색</h3>
                <p className="text-zinc-600">
                  메인 페이지의 검색 기능을 활용하여 원하는 차량을 검색할 수 있습니다. 
                  제조사, 모델, 가격대, 연식 등 다양한 조건으로 필터링할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">2. 차량 상세 정보 확인</h3>
                <p className="text-zinc-600">
                  관심 있는 차량의 상세 페이지에서 사진, 옵션, 주행거리, 가격 등 
                  모든 정보를 확인할 수 있습니다. 판매자 연락처를 통해 직접 문의할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">3. 거래 진행</h3>
                <p className="text-zinc-600">
                  판매자와 직접 연락하여 거래 조건을 협의하고, 현장에서 차량을 확인한 후 
                  거래를 진행하시기 바랍니다. AutoZone.mn은 중개 서비스만 제공하며, 
                  실제 거래는 거래 당사자 간에 이루어집니다.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>차량 판매 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">1. 판매 등록</h3>
                <p className="text-zinc-600">
                  상단 메뉴의 "판매" 버튼을 클릭하여 판매할 차량의 카테고리를 선택합니다. 
                  차량, 오토바이, 타이어, 부품 중 선택할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">2. 차량 정보 입력</h3>
                <p className="text-zinc-600">
                  제조사, 모델, 연식, 주행거리, 가격 등 차량의 상세 정보를 입력합니다. 
                  가능한 한 정확한 정보를 입력하시면 구매자의 신뢰를 얻을 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">3. 사진 등록</h3>
                <p className="text-zinc-600">
                  차량의 사진을 여러 장 등록하시면 구매자의 관심을 더 많이 받을 수 있습니다. 
                  외관, 내부, 엔진룸 등 다양한 각도에서 촬영한 사진을 등록하시기 바랍니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">4. 공고 게시</h3>
                <p className="text-zinc-600">
                  모든 정보를 입력한 후 공고를 게시하면 구매자들이 차량 정보를 확인할 수 있습니다. 
                  구매자로부터 문의가 오면 연락처를 통해 직접 연락을 주고받을 수 있습니다.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>렌탈 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">1. 렌탈 차량 검색</h3>
                <p className="text-zinc-600">
                  "렌탈" 메뉴에서 원하는 차량 타입(소형차, 대형차, 화물차)을 선택하여 
                  렌탈 가능한 차량을 검색할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">2. 렌탈 조건 확인</h3>
                <p className="text-zinc-600">
                  각 차량의 일일 렌탈 가격, 이용 가능 기간, 보증금 등 렌탈 조건을 확인합니다. 
                  렌탈 제공자와 직접 연락하여 상세 조건을 협의할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">3. 렌탈 등록</h3>
                <p className="text-zinc-600">
                  차량을 렌탈하고 싶으시다면 "판매" 메뉴에서 "렌탈 등록"을 선택하여 
                  차량 정보와 렌탈 조건을 입력하고 공고를 게시할 수 있습니다.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>자주 묻는 질문 (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm text-zinc-700">
              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">Q. 거래 수수료가 있나요?</h3>
                <p className="text-zinc-600">
                  A. AutoZone.mn은 기본적으로 무료로 서비스를 제공합니다. 
                  다만, 프리미엄 등록(GOLD, SILVER)을 원하시는 경우 추가 비용이 발생할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">Q. 판매자와 직접 연락할 수 있나요?</h3>
                <p className="text-zinc-600">
                  A. 네, 차량 상세 페이지에 표시된 판매자 연락처를 통해 직접 연락할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 mb-2">Q. 거래 분쟁이 발생하면 어떻게 하나요?</h3>
                <p className="text-zinc-600">
                  A. AutoZone.mn은 중개 서비스만 제공하며, 실제 거래는 거래 당사자 간에 이루어집니다. 
                  분쟁 발생 시 거래 당사자 간에 직접 해결하시거나 관련 기관에 도움을 요청하시기 바랍니다.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

