import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface Props {
  source: string;
}

export default function PdfViewer({ source }: Props) {
  const [numPages, setNumPages] = useState<number>(0);

  // Convert file path to file:// URL if needed
  const fileSrc = source.startsWith("/") ? `file://${source}` : source;

  return (
    <div className="h-full overflow-y-auto p-4">
      <Document
        file={fileSrc}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        className="flex flex-col items-center gap-4"
        loading={
          <div className="text-zinc-500 text-sm">Loading PDF...</div>
        }
        error={
          <div className="text-red-400 text-sm">Failed to load PDF</div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={880}
            className="shadow-lg"
          />
        ))}
      </Document>
      {numPages > 0 && (
        <div className="text-center text-zinc-500 text-xs mt-4 pb-2">
          {numPages} page{numPages !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
