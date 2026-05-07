from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from litellm import completion

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SUPPORTED_DOCS = """
- Mutual-NDA: Mutual Non-Disclosure Agreement
- CSA: Cloud Service Agreement
- Pilot-Agreement: Pilot Agreement
- psa: Professional Services Agreement
- design-partner-agreement: Design Partner Agreement
- sla: Service Level Agreement
- Software-License-Agreement: Software License Agreement
- DPA: Data Processing Agreement
- BAA: Business Associate Agreement
- AI-Addendum: AI Addendum
- Partnership-Agreement: Partnership Agreement
"""

SYSTEM_PROMPT = f"""You are a friendly legal assistant helping users create legal agreements.

## Supported document types (use exact key as document_type value)
{SUPPORTED_DOCS}

## Instructions

1. First, identify which document type the user wants. Ask if unclear.
   - If they request a document we don't support, explain politely and suggest the closest supported type.
   - Once determined, set document_type to the exact key above (e.g. "Mutual-NDA", "CSA").

2. Then collect the required fields for that document type, 1-2 questions at a time.

3. Always carry forward previously established values — never set confirmed fields back to null.

4. When all fields are gathered, confirm and tell the user the document is ready to download.

## Fields by document type

Mutual-NDA: party1_name, party1_title, party1_company, party1_email, party2_name, party2_title, party2_company, party2_email, purpose, effective_date (YYYY-MM-DD), mnda_term_years (number), governing_law (US state), jurisdiction (city, state)

CSA: customer_name, provider_name, effective_date, subscription_period (e.g. "1 year"), governing_law, jurisdiction

Pilot-Agreement: customer_name, provider_name, effective_date, pilot_period (e.g. "30 days"), general_cap_amount (e.g. "$10,000"), governing_law, jurisdiction

psa: customer_name, provider_name, effective_date, services_description, payment_terms (e.g. "Net 30"), governing_law, jurisdiction

design-partner-agreement: customer_name, provider_name, effective_date, governing_law, jurisdiction

sla: customer_name, provider_name, effective_date, uptime_target (e.g. "99.9%"), governing_law, jurisdiction

Software-License-Agreement: customer_name, provider_name, effective_date, governing_law, jurisdiction

DPA: customer_name (data controller), provider_name (data processor), effective_date, governing_law

BAA: customer_name (covered entity), provider_name (business associate), effective_date, governing_law

AI-Addendum: customer_name, provider_name, effective_date, governing_law

Partnership-Agreement: customer_name (partner 1), provider_name (partner 2), effective_date, governing_law, jurisdiction

Only populate fields relevant to the detected document type. Set all irrelevant fields to null.
Always include your conversational reply in the `reply` field."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class DocumentResponse(BaseModel):
    reply: str
    document_type: Optional[str] = None
    # NDA party fields
    party1_name: Optional[str] = None
    party1_title: Optional[str] = None
    party1_company: Optional[str] = None
    party1_email: Optional[str] = None
    party2_name: Optional[str] = None
    party2_title: Optional[str] = None
    party2_company: Optional[str] = None
    party2_email: Optional[str] = None
    # Common fields
    customer_name: Optional[str] = None
    provider_name: Optional[str] = None
    effective_date: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None
    # NDA-specific
    purpose: Optional[str] = None
    mnda_term_years: Optional[str] = None
    # CSA
    subscription_period: Optional[str] = None
    # Pilot
    pilot_period: Optional[str] = None
    general_cap_amount: Optional[str] = None
    # PSA
    services_description: Optional[str] = None
    payment_terms: Optional[str] = None
    # SLA
    uptime_target: Optional[str] = None


router = APIRouter()


@router.get("/greeting")
def greeting():
    return {"reply": "Hi! I'm here to help you create a legal agreement. What type of document would you like to create? For example: Mutual NDA, Cloud Service Agreement, Pilot Agreement, Professional Services Agreement, and more."}


@router.post("/message")
def message(req: ChatRequest) -> DocumentResponse:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=DocumentResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    return DocumentResponse.model_validate_json(response.choices[0].message.content)
