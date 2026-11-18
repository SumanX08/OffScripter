
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const topicsDir = path.resolve(currentDir, "../data/topics");
const outputPath = path.resolve(currentDir, "../data/taxonomy.json");

const categoryNames: Record<string, string> = {
  "ai-ml": "AI / ML",
  "app-development": "App Development",
  cloud: "Cloud",
  "computer-fundamentals": "Computer Fundamentals",
  cybersecurity: "Cybersecurity",
  databases: "Databases",
  devops: "DevOps",
  dsa: "DSA",
  "generative-ai": "Generative AI",
  languages: "Languages",
  "system-design": "System Design",
  testing: "Testing",
  "web-development": "Web Development",
};

const specialNames: Record<string, string> = {
  ai: "AI",
  api: "API",
  apis: "APIs",
  dsa: "DSA",
  llm: "LLM",
  llms: "LLMs",
  mcp: "MCP",
  nodejs: "Node.js",
  rag: "RAG",
  sql: "SQL",
  css: "CSS",
  html: "HTML",
  js: "JavaScript",
};

function formatName(id: string): string {
  if (specialNames[id.toLowerCase()]) {
    return specialNames[id.toLowerCase()];
  }

  return id
    .split("-")
    .map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

type Topic = {
  category: string;
  subcategory: string;
};

function main() {
  const files = fs
    .readdirSync(topicsDir)
    .filter((file) => file.endsWith(".json"));

  const categoryMap = new Map<string, Set<string>>();

  for (const file of files) {
    const filePath = path.join(topicsDir, file);
    const topics = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    ) as Topic[];

    for (const topic of topics) {
      if (!topic.category || !topic.subcategory) {
        throw new Error(
          `Missing category/subcategory in ${file}`
        );
      }

      if (!categoryMap.has(topic.category)) {
        categoryMap.set(topic.category, new Set());
      }

      categoryMap.get(topic.category)!.add(topic.subcategory);
    }
  }

  const categories = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, subcategories]) => ({
      id,
      name: categoryNames[id] ?? formatName(id),
      subcategories: Array.from(subcategories)
        .sort()
        .map((subcategoryId) => ({
          id: subcategoryId,
          name: formatName(subcategoryId),
        })),
    }));

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ categories }, null, 2) + "\n"
  );

  console.log(`Generated taxonomy with ${categories.length} categories.`);
}

main();
