"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/CustomSelect";
import { formatMnt } from "@/lib/format";

type Tab = "insurance" | "loan";

interface FinanceCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab: Tab;
  price: number;
}

export function FinanceCalculatorModal({
  open,
  onOpenChange,
  initialTab,
  price,
}: FinanceCalculatorModalProps) {
  const [tab, setTab] = React.useState<Tab>(initialTab);

  // Insurance calculator state
  const [insuranceType, setInsuranceType] = React.useState<"comprehensive" | "liability">("comprehensive");
  const [insuranceDiscount, setInsuranceDiscount] = React.useState("0");
  const [insurancePrice, setInsurancePrice] = React.useState(String(price));

  // Loan calculator state
  const [loanPrice, setLoanPrice] = React.useState(String(price));
  const [downPaymentPct, setDownPaymentPct] = React.useState("20");
  const [loanMonths, setLoanMonths] = React.useState("36");
  const [loanApr, setLoanApr] = React.useState("14");

  // Reset tab when initialTab changes
  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Insurance calculation
  const insuranceResult = React.useMemo(() => {
    const vehiclePrice = Number(insurancePrice) || 0;
    const discount = Number(insuranceDiscount) || 0;
    const baseRate = insuranceType === "comprehensive" ? 0.018 : 0.010; // 1.8% or 1.0%
    const annualInsurance = vehiclePrice * baseRate * (1 - discount / 100);
    return annualInsurance;
  }, [insurancePrice, insuranceType, insuranceDiscount]);

  // Loan calculation
  const loanResult = React.useMemo(() => {
    const vehiclePrice = Number(loanPrice) || 0;
    const downPayment = Number(downPaymentPct) || 0;
    const months = Number(loanMonths) || 36;
    const apr = Number(loanApr) || 0;

    const principal = vehiclePrice * (1 - downPayment / 100);

    if (apr === 0) {
      return {
        principal,
        monthlyPayment: principal / months,
      };
    }

    const monthlyRate = apr / 100 / 12;
    const monthlyPayment =
      principal * ((monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));

    return {
      principal,
      monthlyPayment,
    };
  }, [loanPrice, downPaymentPct, loanMonths, loanApr]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-2xl p-5">
        {/* Header with tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab("insurance")}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors",
                tab === "insurance"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              보험료 계산
            </button>
            <button
              type="button"
              onClick={() => setTab("loan")}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors",
                tab === "loan"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              대출 계산
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Insurance Calculator */}
        {tab === "insurance" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">차량가</label>
              <Input
                type="number"
                value={insurancePrice}
                onChange={(e) => setInsurancePrice(e.target.value)}
                className="w-full"
                placeholder="차량 가격"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">보험 유형</label>
              <CustomSelect
                value={insuranceType}
                onChange={(v) => setInsuranceType(v as typeof insuranceType)}
                options={[
                  { value: "comprehensive", label: "종합" },
                  { value: "liability", label: "책임" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">할인율 (%)</label>
              <Input
                type="number"
                value={insuranceDiscount}
                onChange={(e) => setInsuranceDiscount(e.target.value)}
                className="w-full"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">예상 보험료 (연간)</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {formatMnt(Math.round(insuranceResult))}
              </div>
            </div>
          </div>
        )}

        {/* Loan Calculator */}
        {tab === "loan" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">차량가</label>
              <Input
                type="number"
                value={loanPrice}
                onChange={(e) => setLoanPrice(e.target.value)}
                className="w-full"
                placeholder="차량 가격"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">계약금 (%)</label>
              <CustomSelect
                value={downPaymentPct}
                onChange={setDownPaymentPct}
                options={[
                  { value: "10", label: "10%" },
                  { value: "20", label: "20%" },
                  { value: "30", label: "30%" },
                  { value: "40", label: "40%" },
                  { value: "50", label: "50%" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">기간 (개월)</label>
              <CustomSelect
                value={loanMonths}
                onChange={setLoanMonths}
                options={[
                  { value: "12", label: "12개월" },
                  { value: "24", label: "24개월" },
                  { value: "36", label: "36개월" },
                  { value: "48", label: "48개월" },
                  { value: "60", label: "60개월" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">금리 (연이율 %)</label>
              <Input
                type="number"
                value={loanApr}
                onChange={(e) => setLoanApr(e.target.value)}
                className="w-full"
                placeholder="14"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">대출원금</div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatMnt(Math.round(loanResult.principal))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">월 예상 납부액</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {formatMnt(Math.round(loanResult.monthlyPayment))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">계산 결과는 참고용입니다</div>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

