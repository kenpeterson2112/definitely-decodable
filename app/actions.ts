"use server";

import Anthropic from "@anthropic-ai/sdk";
import type {
  ComprehensionQuestion,
  GeneratePassageInput,
  GeneratePassageResult,
  Passage,
  QuestionType,
  VocabItem,
} from "@/lib/types";
import { SKILL_BY_ID } from "@/lib/scope";

const BAND_LEVEL: Record<string, number> = { "3–5": 4, "6–8": 6, "9–12": 8 };

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function genId(): string {
  return `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function skillSummaries(skillIds: string[]): string {
  return skillIds
    .map((id) => SKILL_BY_ID[id])
    .filter(Boolean)
    .map((s) => `- ${s.name} (${s.focus} e.g. ${s.examples.slice(0, 4).join(", ")})`)
    .join("\n");
}

// Shape Claude must return. Structured Outputs guarantees valid JSON for this schema.
const PASSAGE_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    blurb: { type: "string" },
    text: { type: "string" },
    targetWords: { type: "array", items: { type: "string" } },
    vocabulary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          word: { type: "string" },
          definition: { type: "string" },
        },
        required: ["word", "definition"],
      },
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          prompt: { type: "string" },
          type: { type: "string", enum: ["literal", "inferential", "vocabulary"] },
          answer: { type: "string" },
        },
        required: ["prompt", "type", "answer"],
      },
    },
  },
  required: ["title", "blurb", "text", "targetWords", "vocabulary", "questions"],
};

interface ModelPassage {
  title: string;
  blurb: string;
  text: string;
  targetWords: string[];
  vocabulary: VocabItem[];
  questions: Array<{ prompt: string; type: QuestionType; answer: string }>;
}

async function generateWithClaude(input: GeneratePassageInput): Promise<Passage> {
  const client = new Anthropic();
  const words = input.approxWords ?? 150;

  const system = [
    "You write decodable practice passages for a structured-literacy program serving",
    "intermediate and older struggling readers (grades 3 and up).",
    "Your passages must feel mature and respectful — never babyish — and lean nonfiction,",
    "with genuinely interesting, age-appropriate content.",
    "Decodability matters: weave in many words that exercise the target phonics/morphology",
    "skills so a student can practice them in connected text, while keeping the writing natural.",
  ].join(" ");

  const prompt = [
    `Write a passage of about ${words} words for grade band ${input.gradeBand}.`,
    `Topic: ${input.topic}.`,
    "",
    "Target the following scope-and-sequence skills as much as is natural:",
    skillSummaries(input.skillIds),
    "",
    "Also provide:",
    "- targetWords: 5–8 words drawn from your passage that best exemplify the target skills",
    "- vocabulary: 2–3 useful words with short, student-friendly definitions",
    "- questions: 2–3 comprehension questions (mix literal, inferential, vocabulary) each with a concise answer",
    "Use \\n\\n between paragraphs in the text.",
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: PASSAGE_SCHEMA },
    },
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content returned");
  }
  const parsed = JSON.parse(textBlock.text) as ModelPassage;

  const questions: ComprehensionQuestion[] = parsed.questions.map((q, i) => ({
    id: `q${i + 1}`,
    prompt: q.prompt,
    type: q.type,
    answer: q.answer,
  }));

  return {
    id: genId(),
    title: parsed.title,
    topic: input.topic,
    blurb: parsed.blurb,
    gradeBand: input.gradeBand,
    level: BAND_LEVEL[input.gradeBand] ?? 5,
    skillTargets: input.skillIds,
    text: parsed.text,
    targetWords: parsed.targetWords,
    vocabulary: parsed.vocabulary,
    questions,
    wordCount: countWords(parsed.text),
    source: "ai",
    createdAt: Date.now(),
  };
}

/** Deterministic offline fallback so the feature still works without an API key. */
function draftPassage(input: GeneratePassageInput): Passage {
  const skills = input.skillIds.map((id) => SKILL_BY_ID[id]).filter(Boolean);
  const names = skills.map((s) => s.shortName.toLowerCase());
  const examples = Array.from(new Set(skills.flatMap((s) => s.examples)));
  const topic = input.topic.trim() || "this topic";
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  const ex = (n: number) => examples.slice(n, n + 2).join(" and ");
  const text = [
    `${cap} is more interesting than it first appears. The closer scientists and explorers look, the more questions they uncover — and the more there is to read and discuss. Words such as ${ex(0)} turn up again and again when we study it.`,
    `As you read, slow down on the longer words. Break a word like ${examples[2] ?? examples[0]} into syllables and the meaning follows. With steady practice, ${names.join(" and ")} stop feeling tricky and start feeling automatic.`,
  ].join("\n\n");

  const vocabulary: VocabItem[] = examples.slice(0, 2).map((word) => ({
    word,
    definition: `A multisyllabic word for practicing ${names[0] ?? "decoding"}.`,
  }));

  const questions: ComprehensionQuestion[] = [
    {
      id: "q1",
      prompt: `What is one thing the passage says about ${topic}?`,
      type: "literal",
      answer: "Answers will vary — look for a detail stated in the text.",
    },
    {
      id: "q2",
      prompt: `Find two words that use the ${names[0] ?? "target"} pattern and read them aloud.`,
      type: "vocabulary",
      answer: examples.slice(0, 2).join(", "),
    },
  ];

  return {
    id: genId(),
    title: `${cap}: A Closer Look`,
    topic,
    blurb: `Offline draft targeting ${names.join(" & ")}.`,
    gradeBand: input.gradeBand,
    level: BAND_LEVEL[input.gradeBand] ?? 5,
    skillTargets: input.skillIds,
    text,
    targetWords: examples.slice(0, 6),
    vocabulary,
    questions,
    wordCount: countWords(text),
    source: "draft",
    createdAt: Date.now(),
  };
}

/**
 * Generate a fresh passage. Uses Claude when ANTHROPIC_API_KEY is configured and
 * reachable; otherwise returns a clearly-labeled offline draft so the loop still works.
 */
export async function generatePassage(
  input: GeneratePassageInput,
): Promise<GeneratePassageResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      passage: draftPassage(input),
      source: "draft",
      note: "Offline draft. Set ANTHROPIC_API_KEY to generate fresh passages with Claude.",
    };
  }
  try {
    const passage = await generateWithClaude(input);
    return { passage, source: "ai", note: "Generated with Claude (Opus 4.8)." };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    return {
      passage: draftPassage(input),
      source: "draft",
      note: `AI generation unavailable (${reason}). Showing an offline draft instead.`,
    };
  }
}
