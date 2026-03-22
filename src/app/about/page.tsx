"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGasData } from "@/hooks/useGasData";

export default function AboutPage() {
  const { plants, terminals } = useGasData();

  // 사이트 기준 카운트
  const plantSiteCount = new Set(plants.map(p => p.plant_name)).size;
  const terminalCount = terminals.length;
  const totalCapacity = plants.reduce((sum, p) => sum + (p.capacity_mw || 0), 0);

  const fade = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-5 pt-28 pb-20">

        {/* Back */}
        <motion.div custom={0} variants={fade} initial="hidden" animate="visible">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            지도로 돌아가기
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div custom={1} variants={fade} initial="hidden" animate="visible" className="mb-16">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            GasOut
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            전국 LNG 인프라 현황을 한눈에 파악하고,<br />
            탈가스 운동을 위한 정보를 제공합니다.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div custom={2} variants={fade} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-16">
          <div className="text-center py-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-3xl font-black text-blue-400">{plantSiteCount || '—'}</div>
            <div className="text-xs text-muted-foreground mt-1">발전소</div>
          </div>
          <div className="text-center py-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-3xl font-black text-orange-400">{terminalCount || '—'}</div>
            <div className="text-xs text-muted-foreground mt-1">터미널</div>
          </div>
          <div className="text-center py-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-3xl font-black text-foreground">{totalCapacity ? `${(totalCapacity / 1000).toFixed(0)}` : '—'}<span className="text-base font-normal text-muted-foreground ml-0.5">GW</span></div>
            <div className="text-xs text-muted-foreground mt-1">총 설비용량</div>
          </div>
        </motion.div>

        {/* Why */}
        <motion.div custom={3} variants={fade} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">왜 탈가스인가</h2>

          <div className="space-y-5 text-[15px] text-slate-300 leading-[1.8]">
            <p>
              화석연료를넘어서(Korea Beyond Fossil Fuels, KBF)는 국내 30여개 시민사회단체가 기후위기 대응과 온실가스 감축을 위해 활동하는 전국 탈화석연료 네트워크입니다. 우리는 &lsquo;화석연료퇴출&rsquo;과 &lsquo;재생에너지 확대&rsquo;를 목표로 정책 변화, 금융 전환, 지역사회 연대 등 다양한 캠페인을 전개합니다.
            </p>
            <p>
              정부는 2038년까지 전체 60기의 석탄발전소 가운데 40기만을 폐쇄하고, 이 중 37기는 가스발전 또는 수소/암모니아 혼소 발전으로 전환할 예정입니다. 석탄발전을 가스가 아닌 재생에너지로 대체해야 기후·환경뿐 아니라 경제적으로 유리하다는 사실은 이미 입증되었습니다. 정부는 노후화된 석탄발전소를 가스발전으로 전환하려는 계획을 철회하고 재생에너지 확대 정책을 강화해야 합니다.
            </p>
            <p>
              작년말 정부의 탈석탄동맹(PPCA)가입으로 석탄발전소를 꺼야 한다는 국가적합의는 이루어졌고, 재생에너지가 미래라는 데도 이견이 없습니다. 하지만 &ldquo;브릿지 전원&rdquo;이라는 이름으로 LNG발전을 경유하려는 움직임에 대해 우려합니다.
            </p>
          </div>
        </motion.div>

        {/* LNG 문제 */}
        <motion.div custom={4} variants={fade} initial="hidden" animate="visible" className="mb-16">
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/15">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-red-400">LNG의 문제점</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-200/70 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-500/60 mt-1.5 shrink-0">&#8226;</span>
                여전히 탄소를 배출하며, 메탄가스가 누출됩니다
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500/60 mt-1.5 shrink-0">&#8226;</span>
                연료를 수입해야 하고, 비용이 높습니다
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500/60 mt-1.5 shrink-0">&#8226;</span>
                11차 전력수급기본계획 기준, 2036년 LNG 가동률은 11%대로 하락 예정
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500/60 mt-1.5 shrink-0">&#8226;</span>
                설비는 늘지만 가동은 줄어드는 좌초자산 위험
              </li>
            </ul>
          </div>
        </motion.div>

        {/* 구분선 */}
        <motion.div custom={5} variants={fade} initial="hidden" animate="visible">
          <div className="border-t border-slate-800 mb-16" />
        </motion.div>

        {/* 참여 */}
        <motion.div custom={6} variants={fade} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">참여하기</h2>

          <p className="text-[15px] text-slate-300 leading-[1.8] mb-8">
            GasOut은 전국의 탈가스 운동을 위한 정보 플랫폼입니다.
            더 많은 시민들이 함께할 수 있도록 도와주세요.
          </p>

          <div className="space-y-3 mb-8">
            {[
              "LNG 발전소 및 터미널 관련 정보 제공",
              "LNG 인프라 관련 뉴스 공유",
              "지역별 탈가스 활동 공유",
              "피드백 및 개선 제안",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-6 h-11 text-sm font-semibold">
            <Mail className="w-4 h-4 mr-2" />
            담당자에게 연락하기
          </Button>
        </motion.div>

        {/* Footer link */}
        <motion.div custom={7} variants={fade} initial="hidden" animate="visible" className="pt-8 border-t border-slate-800">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              메인 페이지로 돌아가기
            </Button>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
