import React from "react";

interface HighlightedTextProps {
  text: string;
  keyword: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  keyword,
  className = "",
}) => {
  if (!keyword) return <span>{text}</span>;
  const regex = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightedText;
