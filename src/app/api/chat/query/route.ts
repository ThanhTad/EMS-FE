// src/app/api/chat/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

// ===================================================================
// INTERFACES & TYPES (Định nghĩa kiểu để thay thế any)
// ===================================================================

/**
 * Một interface tối giản mô tả cấu trúc của request mà hàm log cần,
 * để tránh phải dùng `any`.
 */
interface LoggableDialogflowRequest {
  session: string;
  queryInput: {
    text?: {
      // Dùng `?` để cho phép các kiểu query khác (như event)
      text: string;
    };
  };
}

// ===================================================================
// CẤU HÌNH XÁC THỰC
// ===================================================================

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const SESSION_LANGUAGE_CODE = "vi";

const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const sessionClient = new SessionsClient({
  projectId: PROJECT_ID,
  credentials,
});

// ===================================================================
// ROUTE HANDLER CHO PHƯƠNG THỨC POST
// ===================================================================

export async function POST(request: NextRequest) {
  if (!PROJECT_ID || !credentials.client_email || !credentials.private_key) {
    console.error("Google Cloud credentials are not configured in .env.local");
    return NextResponse.json(
      { error: "Application is not configured correctly." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, sessionId = uuidv4() } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const sessionPath = sessionClient.projectAgentSessionPath(
      PROJECT_ID,
      sessionId
    );

    const dialogflowRequest = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: SESSION_LANGUAGE_CODE,
        },
      },
    };

    logRequest(dialogflowRequest); // Bây giờ đã an toàn về kiểu
    const [response] = await sessionClient.detectIntent(dialogflowRequest);

    const result = response.queryResult;
    if (result && result.fulfillmentText) {
      logResponse(result.fulfillmentText);
      return NextResponse.json({ fulfillmentText: result.fulfillmentText });
    } else {
      logResponse("No fulfillment text found.");
      return NextResponse.json({
        fulfillmentText: "Xin lỗi, tôi chưa thể xử lý yêu cầu này.",
      });
    }
  } catch (error) {
    console.error("BFF Error - Failed to call Dialogflow:", error);
    return NextResponse.json(
      { error: "Failed to communicate with the chatbot service." },
      { status: 500 }
    );
  }
}

// ===================================================================
// HELPER FUNCTIONS FOR LOGGING (ĐÃ CẬP NHẬT KIỂU DỮ LIỆU)
// ===================================================================

/**
 * Ghi log request gửi đến Dialogflow một cách an toàn về kiểu.
 * @param request Đối tượng request có cấu trúc khớp với LoggableDialogflowRequest.
 */
function logRequest(request: LoggableDialogflowRequest): void {
  console.log("===================================");
  console.log("🚀 Sending request to Dialogflow...");
  console.log("Session:", request.session);
  // Kiểm tra sự tồn tại của text query trước khi truy cập
  if (request.queryInput.text) {
    console.log("Query:", request.queryInput.text.text);
  }
  console.log("===================================");
}

/**
 * Ghi log response nhận về từ Dialogflow.
 * @param responseText Chuỗi văn bản trả lời.
 */
function logResponse(responseText: string): void {
  console.log("===================================");
  console.log("🤖 Received response from Dialogflow:");
  console.log(responseText);
  console.log("===================================");
}
