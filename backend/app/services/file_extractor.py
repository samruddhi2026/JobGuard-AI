from loguru import logger
import fitz  # PyMuPDF
import docx
import io
from typing import Optional

class FileExtractor:
    @staticmethod
    async def extract_text(file_content: bytes, filename: str) -> Optional[str]:
        """
        Extracts text from a file based on its extension.
        Supports .pdf and .docx
        """
        ext = filename.split('.')[-1].lower()
        
        if ext == 'pdf':
            return FileExtractor._extract_from_pdf(file_content)
        elif ext == 'docx':
            return FileExtractor._extract_from_docx(file_content)
        elif ext in ['txt', 'md']:
            return file_content.decode('utf-8', errors='ignore')
        
        return None

    @staticmethod
    def _extract_from_pdf(file_content: bytes) -> str:
        text = ""
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
        return text

    @staticmethod
    def _extract_from_docx(file_content: bytes) -> str:
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
        return text
