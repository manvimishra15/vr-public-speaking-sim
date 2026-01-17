from pydantic import BaseModel
from typing import Optional

class LoginInput(BaseModel):
    email: str
    password: str

class PracticeStart(BaseModel):
    email: str
    phobia: str
    difficulty: Optional[str] = "Medium"
    mode: Optional[str] = None

class PracticeUpdate(BaseModel):
    email: str
    stress: int

class PracticeEnd(BaseModel):
    email: str

class ChatInput(BaseModel):
    message: str
    phobia: str
    anxiety: str


class AnxietyPayload(BaseModel):
    anxiety: int
    mode: Optional[str] = "darkness"   # "darkness" or "claustro"



class StartUltravoxCall(BaseModel):
    firstMessage: str = "Hi, I need help calming down."