/**
 * Validate Mermaid diagram syntax
 */

export function validateMermaidSyntax(diagram: string): {
  valid: boolean;
  error?: string;
} {
  if (!diagram || diagram.trim().length === 0) {
    return { valid: false, error: "Diagram is empty" };
  }

  // Check for common mermaid diagram types
  const validDiagramTypes = [
    "graph",
    "flowchart",
    "sequencediagram",
    "classdiagram",
    "statediagram",
    "erdiagram",
    "gantt",
    "pie",
    "gitgraph",
    "%%",  // Mermaid comments
  ];

  const firstLine = diagram.trim().split("\n")[0].toLowerCase();
  const isValidType = validDiagramTypes.some((type) =>
    firstLine.includes(type)
  );

  if (!isValidType) {
    return {
      valid: false,
      error: `Unknown diagram type. Should start with: ${["graph", "flowchart", "sequenceDiagram", "etc."].join(", ")}`,
    };
  }

  // Very basic check: just ensure it has some content and looks like mermaid
  // Don't do strict bracket checking as mermaid syntax is complex
  if (diagram.length < 3) {
    return { valid: false, error: "Diagram is too short" };
  }

  return { valid: true };
}

/**
 * Sanitize mermaid diagram to fix common issues
 */
export function sanitizeMermaidDiagram(diagram: string): string {
  let sanitized = diagram;

  // Remove extra whitespace at start/end
  sanitized = sanitized.trim();

  // Fix common issues:
  // 1. Remove trailing connectors without destination
  sanitized = sanitized.replace(/-->\s*$/gm, "");
  sanitized = sanitized.replace(/-->\s*\n/g, "\n");

  // 2. Fix node IDs with special characters that might break syntax
  // But be careful not to break intentional special chars in labels
  sanitized = sanitized.replace(/\[\s+/g, "["); // Fix spaces after opening bracket
  sanitized = sanitized.replace(/\s+\]/g, "]"); // Fix spaces before closing bracket

  // 3. Ensure proper line endings
  sanitized = sanitized.split("\n").map((line) => line.trim()).join("\n");

  // 4. Remove empty lines at start/end but preserve internal ones for readability
  const lines = sanitized.split("\n");
  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  sanitized = lines.join("\n");

  return sanitized;
}
