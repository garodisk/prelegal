from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from litellm import completion

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal assistant helping users fill out a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a natural, conversational chat to gather the following information. Ask for one or two things at a time — do not dump all questions at once.

Fields you need to collect:
- party1_name: Full name of the first party (the user)
- party1_title: Title/designation of the first party
- party1_company: Company name of the first party
- party1_email: Email of the first party
- party2_name: Full name of the second party (counterparty)
- party2_title: Title/designation of the second party
- party2_company: Company name of the second party
- party2_email: Email of the second party
- purpose: The business purpose of the NDA (e.g. "Evaluating a potential business relationship")
- effective_date: Date the agreement becomes effective (format: YYYY-MM-DD)
- mnda_term_years: How many years the NDA lasts (a number like "1" or "2")
- governing_law: The US state whose laws govern the agreement (e.g. "California")
- jurisdiction: The city and state for dispute resolution (e.g. "San Francisco, CA")

In your structured response:
- Include your conversational reply in the `reply` field
- For each field, include the value if it has been established from the conversation, or null if not yet known
- Always carry forward previously established values — do not set them back to null
- When all fields are gathered, confirm with the user and let them know the document is ready to download"""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class NDAResponse(BaseModel):
    reply: str
    party1_name: Optional[str] = None
    party1_title: Optional[str] = None
    party1_company: Optional[str] = None
    party1_email: Optional[str] = None
    party2_name: Optional[str] = None
    party2_title: Optional[str] = None
    party2_company: Optional[str] = None
    party2_email: Optional[str] = None
    purpose: Optional[str] = None
    effective_date: Optional[str] = None
    mnda_term_years: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None


router = APIRouter()


@router.get("/greeting")
def greeting():
    return {"reply": "Hi! I'm here to help you create a Mutual NDA. Let's start with your details — what's your full name and the company you represent?"}


@router.post("/message")
def message(req: ChatRequest) -> NDAResponse:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=NDAResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    return NDAResponse.model_validate_json(response.choices[0].message.content)
