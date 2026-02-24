interface Props {
  source: string;
}

export default function TextViewer({ source }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <pre className="font-mono text-sm text-zinc-200 whitespace-pre-wrap break-words">
        {source}
      </pre>
    </div>
  );
}
