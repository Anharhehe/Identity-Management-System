import { NextRequest, NextResponse } from 'next/server';

function extractArticles(data: any): any[] {
  if (Array.isArray(data)) return data;
  return data?.articles || data?.data || data?.news || data?.results || [];
}

const API_KEY = '505ab7ce8d73c94315e4e8263fab44373b6b69156ebecbb9d7aef56e026c6de7';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'en';
  const category = searchParams.get('category') || 'general';

  try {
    // Fetch 3 pages in parallel to guarantee 30 articles
    const pageRequests = [1, 2, 3].map((page) =>
      fetch(
        `https://api.freenewsapi.io/v1/news?language=${language}&category=${category}&page_size=10&page=${page}&apikey=${API_KEY}`,
        { headers: { Accept: 'application/json' }, next: { revalidate: 300 } }
      )
        .then((r) => (r.ok ? r.json() : {}))
        .then(extractArticles)
        .catch(() => [] as any[])
    );

    const pages = await Promise.all(pageRequests);
    let allArticles: any[] = pages.flat();

    // Fallback: single request with large page_size if pagination returned nothing
    if (allArticles.length < 10) {
      const res = await fetch(
        `https://api.freenewsapi.io/v1/news?language=${language}&category=${category}&page_size=30&apikey=${API_KEY}`,
        { headers: { Accept: 'application/json' }, next: { revalidate: 300 } }
      );
      if (res.ok) {
        const data = await res.json();
        allArticles = extractArticles(data);
      }
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const unique = allArticles.filter((a: any) => {
      const key = a.title || a.uuid || JSON.stringify(a);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ articles: unique });
  } catch {
    return NextResponse.json({ articles: [], error: 'Failed to fetch news' }, { status: 500 });
  }
}
