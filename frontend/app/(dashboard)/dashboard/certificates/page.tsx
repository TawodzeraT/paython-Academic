'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Award, Download, Share2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Certificate {
  id: string;
  uniqueCode: string;
  issuedAt: string;
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    difficulty: string;
  };
}

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/certificates')
      .then(({ data }) => setCerts(data.certificates))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const copyVerifyLink = (code: string) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied!');
  };

  const difficultyColor: Record<string, string> = {
    BEGINNER:     'text-green-600 bg-green-50 dark:bg-green-900/20',
    INTERMEDIATE: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    ADVANCED:     'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {certs.length} certificate{certs.length !== 1 ? 's' : ''} earned
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <Award size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No certificates yet</h3>
          <p className="text-gray-500 text-sm">
            Complete a course to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-900 p-8 text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <Award size={36} className="mx-auto text-brand-200 mb-3" />
                <p className="text-brand-200 text-xs uppercase tracking-widest mb-1">
                  Certificate of Completion
                </p>
                <p className="text-white font-bold text-lg leading-tight">{cert.course.title}</p>
                <p className="text-brand-200 text-sm mt-2">{user?.name}</p>
              </div>

              {/* Footer */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[cert.course.difficulty]}`}>
                      {cert.course.difficulty.charAt(0) + cert.course.difficulty.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>

                <p className="text-xs text-gray-400 font-mono mb-3 truncate">
                  ID: {cert.uniqueCode}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyVerifyLink(cert.uniqueCode)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Share2 size={13} /> Share
                  </button>
                  
                    href={`/verify/${cert.uniqueCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink size={13} /> Verify
                  </a>
                  <button
                    onClick={() => toast('PDF download coming in Phase 2!')}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
