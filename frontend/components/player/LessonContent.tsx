'use client';

import { Download, FileText, Link as LinkIcon } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number | null;
}

interface Lesson {
  content: string | null;
  attachments: Attachment[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-8">

      {/* Markdown content */}
      {lesson.content && (
        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
            prose-strong:text-white
            prose-li:text-gray-300
            prose-blockquote:border-brand-500 prose-blockquote:text-gray-400"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }}
        />
      )}

      {/* Attachments */}
      {lesson.attachments.length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            Resources & Downloads
          </h3>
          <div className="grid gap-2">
            {lesson.attachments.map((file) => (
              
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
              >
                <div className="w-9 h-9 bg-brand-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download size={16} className="text-brand-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm font-medium truncate">{file.name}</p>
                  {file.size && (
                    <p className="text-gray-500 text-xs">{formatBytes(file.size)}</p>
                  )}
                </div>
                <LinkIcon size={14} className="text-gray-500 group-hover:text-brand-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Basic markdown renderer (replace with react-markdown in production)
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .trim();
}
