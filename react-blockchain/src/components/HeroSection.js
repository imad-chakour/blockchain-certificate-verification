import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import '../App.css';
import { Button } from './Button';
import './css/HeroSection.css';
import { chatWithLLM, uploadCertificate, verifyCertificate } from './services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback cyber-card">
          <h2>SYSTEM FAILURE</h2>
          <p>{this.state.error.toString()}</p>
          <button 
            className="cyber-button"
            onClick={() => window.location.reload()}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function HeroSection() {
  const [showChat, setShowChat] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    certId: '',
    name: '',
    course: ''
  });
  const [verificationResult, setVerificationResult] = useState(null);
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        let web3Instance;
        if (window.ethereum) {
          web3Instance = new Web3(window.ethereum);
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
            console.error("User denied account access");
          }
        } else if (window.web3) {
          web3Instance = new Web3(window.web3.currentProvider);
        } else {
          console.log('No injected web3 provider detected. Using Ganache directly.');
          const ganacheProvider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
          web3Instance = new Web3(ganacheProvider);
        }

        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0] || 'No account found');
        
        const id = await web3Instance.eth.net.getId();
        setNetworkId(id);
      } catch (error) {
        console.error('Web3 initialization error:', error);
        setAccount('Error connecting to blockchain');
      }
    };

    initializeWeb3();
  }, []);

  const handleChatToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowChat(!showChat);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setMessage('');
    
    try {
      const response = await chatWithLLM({
        message: message
      });
      setConversation([...updatedConversation, {
        role: 'assistant',
        content: response.reply
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Sorry, I encountered an error. Please try again.';
      setConversation([...updatedConversation, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const tx = await uploadCertificate(formData.certId, formData.name, formData.course);
      alert(`Certificate successfully added to blockchain!\nTransaction hash: ${tx.transactionHash}`);
      setShowUploadModal(false);
      setFormData({ certId: '', name: '', course: '' });
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || error.message || 'Upload failed'}`);
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyCertificate(formData.certId);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ 
        message: error.response?.data?.detail || error.message || 'Verification failed',
        data: null 
      });
      console.error('Verify error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkName = () => {
    switch(networkId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 5777: return 'Ganache Local';
      default: return networkId ? `Network ID: ${networkId}` : 'Disconnected';
    }
  };

  return (
    <div className='hero-container'>
      <video src='/videos/video-2.mp4' autoPlay loop muted />
      
      <div className="cyber-header">
        <h1 className="cyber-title glitch-layers" data-text="CertChain.AI">
          <span>CertChain.AI</span>
        </h1>
        <p className="cyber-subtitle">
          <span className="cyber-word">BLOCKCHAIN</span>
          <span className="cyber-divider">∎</span>
          <span className="cyber-word">VERIFIED</span>
          <span className="cyber-divider">∎</span>
          <span className="cyber-word">CREDENTIALS</span>
        </p>
      </div>
      <div className="tagline-grid">
        <span className="tagline-cell">SMART</span>
        <span className="tagline-cell">SECURE</span>
        <span className="tagline-cell">IMMUTABLE</span>
        <span className="tagline-cell">AI-POWERED</span>
      </div>
      
      <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          onClick={() => setShowUploadModal(true)}
          disabled={!account || account.includes('Error')}
        >
          UPLOAD CERTIFICATE
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
          onClick={() => setShowVerifyModal(true)}
        >
          VERIFY CERTIFICATE <i className='fas fa-search' />
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          onClick={handleChatToggle}
        >
          {showChat ? 'HIDE ASSISTANT' : 'AI ASSISTANT'}
        </Button>
      </div>

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content cyber-card">
            <h2 className="cyber-text">UPLOAD TO BLOCKCHAIN</h2>
            <p className="account-info">
              <i className="fas fa-wallet"></i> {account && account.length > 10 ? 
                `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 
                account}
            </p>
            <form onSubmit={handleUploadSubmit}>
              <input
                name="certId"
                value={formData.certId}
                onChange={handleInputChange}
                placeholder="CERTIFICATE ID"
                className="cyber-input"
                required
              />
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="RECIPIENT NAME"
                className="cyber-input"
                required
              />
              <input
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="COURSE/PROGRAM"
                className="cyber-input"
                required
              />
              <div className="modal-actions">
                <Button 
                  type="submit" 
                  buttonStyle='btn--primary'
                  disabled={isLoading}
                >
                  {isLoading ? 'PROCESSING...' : 'CONFIRM UPLOAD'}
                </Button>
                <Button 
                  buttonStyle='btn--outline' 
                  onClick={() => setShowUploadModal(false)}
                  disabled={isLoading}
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Certificate Modal */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-content cyber-card">
            <h2 className="cyber-text">VERIFY ON BLOCKCHAIN</h2>
            <form onSubmit={handleVerifySubmit}>
              <input
                name="certId"
                value={formData.certId}
                onChange={handleInputChange}
                placeholder="ENTER CERTIFICATE ID"
                className="cyber-input"
                required
              />
              <div className="modal-actions">
                <Button 
                  type="submit" 
                  buttonStyle='btn--primary'
                  disabled={isLoading}
                >
                  {isLoading ? 'SCANNING...' : 'VERIFY'}
                </Button>
                <Button 
                  buttonStyle='btn--outline' 
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerificationResult(null);
                  }}
                  disabled={isLoading}
                >
                  CANCEL
                </Button>
              </div>
            </form>

            {verificationResult && (
              <div className={`verification-result ${verificationResult.data ? 'success' : 'error'}`}>
                <h3 className="cyber-text-small">
                  {verificationResult.data ? '✓ BLOCKCHAIN VERIFIED' : '✗ NOT FOUND'}
                </h3>
                <p>{verificationResult.message}</p>
                {verificationResult.data && (
                  <div className="certificate-details">
                    <p><strong>NAME:</strong> {verificationResult.data.name}</p>
                    <p><strong>COURSE:</strong> {verificationResult.data.course}</p>
                    <p><strong>TIMESTAMP:</strong> {new Date(verificationResult.data.timestamp * 1000).toLocaleString()}</p>
                    <p className="blockchain-confirmation">
                      <i className="fas fa-link"></i> {getNetworkName()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="chat-container cyber-card">
          <div className="chat-messages">
            {conversation.length === 0 && (
              <div className="message assistant welcome-message">
                <strong>ASSISTANT:</strong> Hello! I'm your Blockchain Certificate Assistant. Ask me about:
                <ul>
                  <li>How to verify certificates</li>
                  <li>Uploading new certificates</li>
                  <li>Blockchain security features</li>
                </ul>
              </div>
            )}
            
            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <strong>{msg.role === 'user' ? 'YOU:' : 'ASSISTANT:'}</strong> {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <strong>ASSISTANT:</strong> 
                <span className="typing-indicator">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleChatSubmit} className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="QUERY ABOUT CERTIFICATE VERIFICATION..."
              disabled={isLoading}
              className="cyber-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="cyber-button"
            >
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'TRANSMIT'}
            </button>
          </form>
        </div>
      )}

      {/* Blockchain indicators */}
      <div className='blockchain-indicators'>
        <span><i className='fas fa-link'></i> {getNetworkName()}</span>
        <span><i className='fas fa-lock'></i> {account && !account.includes('Error') ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
}

export default function WrappedHeroSection() {
  return (
    <ErrorBoundary>
      <HeroSection />
    </ErrorBoundary>
  );
}