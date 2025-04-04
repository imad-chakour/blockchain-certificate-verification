import logging

logger = logging.getLogger(__name__)

class CertificateAssistant:
    def __init__(self):
        self.responses = {
            "greeting": "Hello! I'm your Blockchain Certificate Assistant. How can I help you today?",
            "verify": "You can verify certificates by visiting /verify/{certificate_id}",
            "upload": "To upload a certificate, POST to /upload with cert_id, name, and course parameters",
            "help": "I can help with: \n- Certificate verification (/verify)\n- Certificate uploads (/upload)",
            "default": "I specialize in certificate verification. You can ask me about verifying or uploading certificates."
        }
    
    def get_response(self, message: str) -> str:
        """Simple rule-based response system"""
        message = message.lower()
        
        if any(word in message for word in ["hello", "hi", "hey"]):
            return self.responses["greeting"]
        elif any(word in message for word in ["verify", "check", "valid"]):
            return self.responses["verify"]
        elif any(word in message for word in ["upload", "add", "create"]):
            return self.responses["upload"]
        elif any(word in message for word in ["help", "support"]):
            return self.responses["help"]
        else:
            return self.responses["default"]