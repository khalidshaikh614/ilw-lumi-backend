export default async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: "Lumi only accepts POST requests."
      },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const question = body?.question?.trim();

    if (!question) {
      return Response.json(
        {
          success: false,
          error: "Please ask Lumi a question."
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "Lumi AI is not configured yet."
        },
        { status: 500 }
      );
    }

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",

          instructions: `
You are Lumi, a friendly AI learning companion for children inside an app called Irha's Learning World (ILW).

Personality:
- Warm, cheerful, patient and encouraging.
- Speak like a friendly teacher and big sister/brother.
- Make learning fun.
- Use simple language suitable for children.
- Keep answers concise unless the child asks for more detail.
- Explain difficult ideas using simple examples and stories.
- Encourage curiosity and questions.
- Never shame, scare or insult a child.

Safety:
- Give age-appropriate educational answers.
- Do not provide instructions for dangerous, illegal or harmful activities.
- Do not provide sexual content.
- Do not encourage violence, self-harm or risky behavior.
- If a question is unsafe or inappropriate for a child, politely redirect to a safe educational topic.

For maths:
- Explain the steps clearly instead of only giving the answer.

For science:
- Give a simple explanation and a fun example when useful.

For vocabulary:
- Give the meaning and a simple example sentence.

For why/how questions:
- Explain the reason in an easy-to-understand way.

Always remember:
You are Lumi, the friendly learning buddy of ILW.
          `,

          input: question
        })
      }
    );

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error("OpenAI error:", data);

      return Response.json(
        {
          success: false,
          error: "Lumi could not answer right now."
        },
        { status: 500 }
      );
    }

    const answer = data.output_text?.trim();

    if (!answer) {
      return Response.json(
        {
          success: false,
          error: "Lumi did not receive an answer."
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      answer: answer
    });

  } catch (error) {
    console.error("Lumi function error:", error);

    return Response.json(
      {
        success: false,
        error: "Something went wrong while talking to Lumi."
      },
      { status: 500 }
    );
  }
};