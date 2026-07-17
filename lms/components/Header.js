'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';

export default function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur border-b border-line">
      <div className="wrap flex items-center gap-5 h-[62px]">
        <Link href="/" className="flex items-center gap-3" aria-label="LMS SET">
          <img src="/logo-set.png" alt="Logo SET" className="h-8 w-auto" width={900} height={408} />
          <span className="leading-tight hidden sm:block">
            <b>Cổng học tập</b>
            <small className="block text-[10.5px] text-ink-soft">lms.set.edu.vn</small>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <a href="https://set.edu.vn/khoa-hoc" className="hidden md:inline text-ink-soft hover:text-brand-700">Danh mục khóa học</a>
          {user ? (
            <>
              <span className="text-ink-soft hidden sm:inline">{user.user_metadata?.full_name || user.email}</span>
              <button onClick={() => supabaseBrowser().auth.signOut().then(() => location.assign('/login'))}
                className="border border-line rounded-lg px-3 py-1.5 font-semibold">Đăng xuất</button>
            </>
          ) : (
            <Link href="/login" className="btn-green !px-4 !py-2 text-[13.5px]">Đăng nhập</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
