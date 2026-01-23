import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // 거부된 지 30일이 지난 기사 삭제
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: deletedArticles, error } = await supabase
      .from('articles')
      .delete()
      .eq('status', 'rejected')
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .select('id');

    if (error) {
      console.error('Error deleting rejected articles:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const deletedCount = deletedArticles?.length || 0;

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount}개의 거부된 기사가 삭제되었습니다.`
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET 요청으로 삭제될 기사 수 미리보기
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .lt('updated_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('Error counting rejected articles:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
      message: `${count || 0}개의 거부된 기사가 삭제 대상입니다.`
    });
  } catch (error: any) {
    console.error('Count error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
