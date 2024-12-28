import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
    content: string;
}

export function Markdown({content}: MarkdownProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose dark:prose-invert max-w-none"
        >
            {content}
        </ReactMarkdown>
    );
}
