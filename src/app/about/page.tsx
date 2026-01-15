"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Activity, BarChart3, Search, Mail, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-10 relative z-10 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
              GasOut <span className="text-primary">Project</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Making the invisible visible. <br />
              전국의 화력 발전소와 기후 위기 현장을 기록하고 감시합니다.
            </p>
          </motion.div>

          {/* GasOut? */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 glass-card overflow-hidden">
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  GasOut이란?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                    우리는 경남기후위기비상행동에서 전국의 탈가스 탈 LNG 운동을 고민하고 있는 활동가들입니다.
                  </p>

                  <div className="py-6 px-8 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <p className="text-xl font-bold text-primary leading-relaxed text-center relative z-10">
                      "왜 <span className="text-white">경남</span> 기후위기비상행동이 <span className="text-white">전국</span>의 탈가스 운동을 고민하는지 궁금하실겁니다."
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    우리는 지난 2023년, 하동석탄화력발전소 1호기가 폐지되는 대신, 한국남부발전이 안동에 LNG 복합화력발전소 2호기를 건설하겠다는 계획을 밝히는 장면을 목격했습니다. 우리 지역의 오염과 위험을 다른 지역이 떠안게 되는 광경을 말입니다.
                  </p>

                  <div className="bg-white/5 p-6 rounded-xl border-l-4 border-primary shadow-lg backdrop-blur-sm">
                    <p className="text-white leading-relaxed font-bold text-lg">
                      결국 전국적인 운동만이 실제로 기후위기를 해결할 수 있다는 것을 알게 되었습니다.
                    </p>
                  </div>

                  <div className="py-8 border-t border-b border-white/10 my-8">
                    <p className="text-2xl font-bold text-foreground leading-relaxed text-center">
                      왜 하필 <span className="text-secondary text-glow">LNG</span>냐 궁금하실겁니다.
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    우리는 석탄발전소를 빠른 시일내에 꺼야한다는 것에 대해서는 시민적 합의가 이루어졌다고 믿습니다. 재생에너지가 지구의 미래라는 것에 대해서도 이견이 없다고 생각합니다. 하지만 지금 당장 석탄발전소를 재생에너지로 바로 이어가지 못하고, 굳이 브릿지 전원이라는 이름으로 LNG발전을 경유하려는 것에 대해서 우려를 갖고 있습니다.
                  </p>

                  <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20 shadow-sm">
                    <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      LNG의 문제점
                    </h4>
                    <p className="text-red-200/80 leading-relaxed text-sm">
                      LNG발전은 여전히 탄소를 발생시키며, 메탄가스가 샙니다. 절대로 탄소중립을 가능하게 하는 발전원이 아닙니다. 연료는 수입해야하고, 비쌉니다. 더구나 11차 전력수급기본계획에 따르면 LNG발전 설비는 터무니 없이 증가하는데, 지금도 이미 LNG발전의 가동량은 전체 설비의 절반 수준이고, 2036년에는 11%대로 내려갑니다.
                    </p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl text-center border border-white/5">
                    <p className="text-foreground leading-relaxed font-semibold italic">
                      "LNG발전은 우리의 미래가 아니며, 발전산업의 이해관계가 얽혀 일어난 산물입니다."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Features */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 glass-card overflow-hidden">
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  주요 기능
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Zap,
                      color: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                      title: "LNG 시설 통합 지도",
                      desc: "전국 LNG 발전소와 터미널을 통합 지도에 표시합니다. 유형별/분류별로 구분하여 직관적으로 확인할 수 있습니다."
                    },
                    {
                      icon: Search,
                      color: "text-blue-400",
                      bg: "bg-blue-400/10",
                      title: "실시간 관련 뉴스",
                      desc: "LNG 인프라 관련 뉴스를 전국/지역/발전소별로 분류하여 실시간으로 수집하고 제공합니다."
                    },
                    {
                      icon: BarChart3,
                      color: "text-purple-400",
                      bg: "bg-purple-400/10",
                      title: "실시간 통계 대시보드",
                      desc: "시설 현황, 총 용량, 운영 상태 등을 실시간으로 집계하여 시각적인 대시보드로 제공합니다."
                    },
                    {
                      icon: Activity,
                      color: "text-orange-400",
                      bg: "bg-orange-400/10",
                      title: "고급 필터링",
                      desc: "다양한 조건(유형, 상태, 분류 등)으로 시설을 필터링하여 원하는 정보를 빠르게 찾을 수 있습니다."
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/10 group">
                      <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 glass-card overflow-hidden">
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  데이터 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { count: "267", label: "총 시설", sub: "발전소 + 터미널", color: "text-white" },
                    { count: "144", label: "LNG 발전소", sub: "복합/열병합", color: "text-blue-400" },
                    { count: "123", label: "LNG 터미널", sub: "가스공사/민간", color: "text-red-400" },
                    { count: "ON", label: "실시간 수집", sub: "뉴스 모니터링", color: "text-secondary" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/5 text-center hover:scale-105 transition-transform duration-200">
                      <div className={`text-4xl font-black ${stat.color} mb-2 text-glow`}>{stat.count}<span className="text-lg font-normal text-muted-foreground ml-1">{stat.count !== "ON" && "개"}</span></div>
                      <div className="text-sm font-bold text-foreground">{stat.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 glass-card overflow-hidden">
              <CardHeader className="pb-6 border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-foreground rounded-full"></div>
                  참여해 주세요
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-8">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    GasOut 프로젝트는 전국의 탈가스 탈 LNG 운동을 위한 정보 플랫폼입니다.
                    LNG 발전소와 터미널의 현황을 한눈에 파악하고, 관련 뉴스를 실시간으로 확인할 수 있습니다.
                    더 많은 시민들이 참여할 수 있도록 도와주세요.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                        참여 방법
                      </h3>
                      <ul className="text-muted-foreground space-y-2 text-sm">
                        <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> LNG 발전소 및 터미널 관련 정보 제공</li>
                        <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> LNG 인프라 관련 뉴스 정보 공유</li>
                        <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> 지역별 탈가스 활동 공유</li>
                        <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> 페이지 피드백 및 개선 제안</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-white/10 flex flex-col justify-center items-center text-center shadow-lg">
                      <p className="text-gray-300 mb-6">
                        경남기후위기비상행동으로 연락주시면<br />언제든 함께할 수 있습니다.
                      </p>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto shadow-lg shadow-primary/20">
                        <Mail className="w-4 h-4 mr-2" /> 연락하기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center pb-12"
        >
          <Link href="/">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all">
              메인 페이지로 돌아가기
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

