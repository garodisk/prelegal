from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import list_documents, save_document
from routers.auth import get_current_user

router = APIRouter()


class SaveDocumentRequest(BaseModel):
    title: str
    document_type: str
    content: str


@router.post("")
def save(req: SaveDocumentRequest, current_user: dict = Depends(get_current_user)):
    doc_id = save_document(current_user["id"], req.title, req.document_type, req.content)
    return {"id": doc_id}


@router.get("")
def list_docs(current_user: dict = Depends(get_current_user)):
    return list_documents(current_user["id"])
