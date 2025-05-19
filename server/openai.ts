import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Legal document analysis
export async function analyzeDocument(
  text: string,
  documentType: "contract" | "petition" | "power_of_attorney" | "general"
): Promise<{
  summary: string;
  findings: Array<{
    type: "issue" | "recommendation" | "missing" | "strength";
    description: string;
    severity?: "high" | "medium" | "low";
    location?: string;
  }>;
  status: "complete" | "issues_found" | "incomplete";
}> {
  try {
    const prompt = `
      Analyze the following legal document (${documentType}):
      
      ${text}
      
      Provide a comprehensive legal analysis with:
      1. A concise summary of the document
      2. Identify any issues, recommendations, missing elements, or strengths
      3. Rate the document status as complete, issues_found, or incomplete
      
      Return the result as JSON with the following structure:
      {
        "summary": "Brief description of the document",
        "findings": [
          {
            "type": "issue/recommendation/missing/strength",
            "description": "Detailed description",
            "severity": "high/medium/low" (for issues),
            "location": "Section/paragraph reference"
          }
        ],
        "status": "complete/issues_found/incomplete"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document");
  }
}

// Legal search
export async function legalSearch(
  query: string,
  sources: {
    jurisprudence: boolean;
    doctrine: boolean;
    legislation: boolean;
  }
): Promise<{
  results: Array<{
    title: string;
    summary: string;
    source: "jurisprudence" | "doctrine" | "legislation";
    reference: string;
    relevance: number;
  }>;
}> {
  try {
    const sourceTypes = Object.entries(sources)
      .filter(([_, included]) => included)
      .map(([type]) => type)
      .join(", ");

    const prompt = `
      Perform a legal search for the following query in Brazilian law:
      
      Query: ${query}
      
      Search in the following sources: ${sourceTypes}
      
      Return the most relevant results as JSON with the following structure:
      {
        "results": [
          {
            "title": "Title of the result",
            "summary": "Brief summary of the content",
            "source": "jurisprudence/doctrine/legislation",
            "reference": "Case number, article reference, or citation",
            "relevance": number between 0 and 1
          }
        ]
      }
      
      Provide up to 5 most relevant results.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error performing legal search:", error);
    throw new Error("Failed to perform legal search");
  }
}

// Document recommendation
export async function recommendDocuments(
  context: string,
  documentType?: string
): Promise<{
  recommendations: Array<{
    title: string;
    description: string;
    type: string;
    relevance: number;
  }>;
}> {
  try {
    const documentTypePrompt = documentType ? `specifically for ${documentType}` : "";
    
    const prompt = `
      Based on the following legal context, recommend relevant legal documents ${documentTypePrompt}:
      
      Context: ${context}
      
      Return the recommendations as JSON with the following structure:
      {
        "recommendations": [
          {
            "title": "Title of the recommended document",
            "description": "Brief description of why this document is relevant",
            "type": "petition/contract/power_of_attorney/etc",
            "relevance": number between 0 and 1
          }
        ]
      }
      
      Provide up to 3 most relevant document recommendations.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error recommending documents:", error);
    throw new Error("Failed to recommend documents");
  }
}
