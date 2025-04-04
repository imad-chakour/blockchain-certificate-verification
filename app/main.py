from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from app.blockchain import contract_instance, web3
from app.chat import CertificateAssistant
from app.metrics import setup_metrics, REQUEST_COUNT, REQUEST_DURATION

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize simple assistant
assistant = CertificateAssistant()

# Setup metrics
metrics = setup_metrics(app)
REQUEST_COUNT = metrics["request_count"]
REQUEST_DURATION = metrics["request_duration"]

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    REQUEST_COUNT.labels(method="POST", endpoint="/api/chat").inc()
    with REQUEST_DURATION.labels(method="POST", endpoint="/api/chat").time():
        try:
            response = assistant.get_response(request.message)
            return {"reply": response}
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Existing blockchain endpoints remain unchanged
@app.post("/upload")
async def upload_certificate(cert_id: str, name: str, course: str):
    REQUEST_COUNT.labels(method="POST", endpoint="/upload").inc()
    with REQUEST_DURATION.labels(method="POST", endpoint="/upload").time():
        try:
            tx_hash = contract_instance.functions.addCertificate(cert_id, name, course).transact({"from": web3.eth.accounts[0]})
            web3.eth.wait_for_transaction_receipt(tx_hash)
            return {"message": f"Certificate {cert_id} added successfully!"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    REQUEST_COUNT.labels(method="GET", endpoint="/verify").inc()
    with REQUEST_DURATION.labels(method="GET", endpoint="/verify").time():
        try:
            cert = contract_instance.functions.verifyCertificate(cert_id).call()
            return {
                "message": "Certificate found!",
                "data": {"name": cert[0], "course": cert[1], "timestamp": cert[2]},
            }
        except Exception:
            raise HTTPException(status_code=404, detail="Certificate not found")

@app.get("/health")
async def health_check():
    return {"status": "ready", "service": "blockchain-certificate-system"}

@app.get("/")
async def root():
    REQUEST_COUNT.labels(method="GET", endpoint="/").inc()
    with REQUEST_DURATION.labels(method="GET", endpoint="/").time():
        return {"message": "Blockchain Certificate Verification System"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)