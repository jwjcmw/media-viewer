import ReactMarkdown from "react-markdown";

interface Props {
  source: string;
}

export default function MarkdownViewer({ source }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{source}</ReactMarkdown>
      </div>
    </div>
  );
}
