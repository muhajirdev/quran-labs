import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Props = {
    content: string
}

export default function RenderMarkdown({ content }: Props) {
    return (
        <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="border-collapse border border-white/10 w-full" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-white/5" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                        <tr className="border-b border-white/10" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="py-2 px-3 text-left text-xs font-medium text-white/70" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="py-2 px-3 text-sm border-white/5" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className="text-accent hover:underline" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                        <h1 className="text-lg font-semibold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-base font-semibold mt-3 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-sm font-semibold mt-3 mb-1" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 mb-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 mb-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                    ),
                    code: ({ className, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match
                        return isInline
                            ? <code className="bg-white/10 px-1 py-0.5 rounded text-xs" {...props} />
                            : <code className="block bg-white/5 p-2 rounded-md text-xs overflow-x-auto my-2" {...props} />
                    },
                    pre: ({ node, ...props }) => (
                        <pre className="bg-transparent p-0 m-0" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-2 border-accent/50 pl-3 italic text-white/70 my-2" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className="border-white/10 my-3" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
