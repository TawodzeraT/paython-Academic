'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface CertData {
  uniqueCode: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
  difficulty: string;
}

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [cert, setCert] = useState<CertData | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/student/certificates/verify/${code}`)
      .then(({ data }) => {
        setValid(data.valid);
        if (data.valid) setCert(data.certificate);
      })
      .catch(() => setValid(false))
      .finally(() => setIsLoading(false));
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {valid && cert ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Certificate visual */}
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <Award size={52} className="mx-auto text-brand-200 mb-4" />
                <p className="text-brand-200 text-xs uppercase tracking-[0.2em] mb-2">
                  Certificate of Completion
                </p>
                <p className="text-white/70 text-sm mb-1">This certifies that</p>
                <p className="text-white text-2xl font-bold mb-2">{cert.studentName}</p>
                <p className="text-white/70 text-sm mb-1">has successfully completed</p>
                <p className="text-white text-xl font-semibold">{cert.courseTitle}</p>
              </div>
            </div>

            {/* Verification badge */}
            <div className="p-6">
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-5">
                <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                    Verified Certificate
                  </p>
                  <p className="text-green-600 dark:text-green-500 text-xs mt-0.5">
                    This certificate is authentic and issued by Paython Academy.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: 'Student', value: cert.studentName },
                  { label: 'Course', value: cert.courseTitle },
                  { label: 'Level', value: cert.difficulty.charAt(0) + cert.difficulty.slice(1).toLowerCase() },
                  { label: 'Issued', value: new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Certificate ID', value: cert.uniqueCode },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-900 dark:text-white font-medium text-right max-w-xs truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6">
              <Link
                href="/courses"
                className="block text-center w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Browse Paython Academy Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-10 text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Certificate Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This certificate could not be verified. It may be invalid or revoked.
            </p>
            <Link href="/" className="text-brand-600 hover:underline text-sm">
              Go to Paython Academy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
