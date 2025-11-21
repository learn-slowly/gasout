import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeclarationPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
            <main className="max-w-2xl w-full animate-fade-in-up">
                <Card className="border-0 shadow-xl shadow-slate-900/10 glass-card ring-1 ring-white/20 rounded-3xl overflow-hidden text-center p-10">
                    <CardHeader className="pb-6">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-3xl">📢</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            기후시민선언
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 text-lg mb-8">
                            현재 페이지를 준비 중입니다.<br />
                            조금만 기다려 주세요!
                        </p>
                        <div className="h-1 w-24 bg-slate-200 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-slate-900 w-1/2 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
