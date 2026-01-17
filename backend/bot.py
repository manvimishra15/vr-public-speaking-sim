from dotenv import load_dotenv
import os
from openai import OpenAI

# Load the .env file so Python can read your API key
load_dotenv()

# Create the OpenAI client using your key from .env
client = OpenAI(api_key=os.getenv("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"))

