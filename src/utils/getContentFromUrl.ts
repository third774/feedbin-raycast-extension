import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { Entry } from "./api";

async function getContentFromURL(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const jsdom = new JSDOM(html);
  const readability = new Readability(jsdom.window.document, {});
  const { content } = readability.parse() ?? {};
  jsdom.window.close();
  return content;
}

export async function getEntryContentWithFallback(entry: Entry) {
  const content = await getContentFromURL(entry.url);
  return NodeHtmlMarkdown.translate(content ?? "", {
    emDelimiter: "*",
    codeFence: "```",
  });
}
