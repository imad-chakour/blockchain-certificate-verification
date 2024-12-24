from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.blockchain import contract_instance, web3
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
templates = Jinja2Templates(directory="templates")

instrumentator = Instrumentator()

# Instrument the app
instrumentator.instrument(app)

# Optional: Start monitoring
instrumentator.expose(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/upload", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})

@app.get("/verify", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("verify.html", {"request": request})

@app.post("/upload")
async def upload_certificate(cert_id: str = Form(...), name: str = Form(...), course: str = Form(...)):
    tx_hash = contract_instance.functions.addCertificate(cert_id, name, course).transact()
    web3.eth.wait_for_transaction_receipt(tx_hash)
    return {"message": f"Certificate {cert_id} successfully added to the blockchain!"}

@app.post("/verify")
async def verify_certificate(cert_id: str = Form(...)):
    try:
        cert = contract_instance.functions.verifyCertificate(cert_id).call()
        return {
            "message": "Certificate found!",
            "data": {"name": cert[0], "course": cert[1], "timestamp": cert[2]},
        }
    except Exception:
        return {"message": "Certificate not found!"}