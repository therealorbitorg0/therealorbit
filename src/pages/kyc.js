// ================================
// TRO – KYC Verification Page
// ================================

import { KycAPI } from '../utils/api.js';
import { showToast, getCurrentUser, setButtonLoading } from '../utils/helpers.js';
import { navigate } from '../router.js';

let currentStep = 1;
let cameraStream = null;

function renderKyc() {
  const user = getCurrentUser();
  
  document.getElementById('app').innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-orbs"><div class="orb orb-1"></div></div>
    
    <!-- TOP NAV -->
    <nav style="position:sticky;top:0;z-index:100;background:rgba(6,13,26,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--glass-border);padding:14px 24px;display:flex;align-items:center;justify-content:space-between">
      <div onclick="navigate('dashboard')" style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,var(--gold),var(--accent-cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;cursor:pointer">🪐 TRO</div>
      <div style="display:flex;gap:12px;align-items:center">
        <span style="font-size:0.85rem;color:var(--text-secondary)">KYC Verification</span>
        <button class="btn btn-secondary btn-sm" onclick="navigate('dashboard')">Dashboard</button>
      </div>
    </nav>
    
    <div style="min-height:calc(100vh - 58px);padding:48px 20px;position:relative;z-index:1">
      <div style="max-width:680px;margin:0 auto">
        
        <!-- Header -->
        <div style="text-align:center;margin-bottom:48px">
          <div class="section-tag" style="margin:0 auto 16px">🔐 Identity Verification</div>
          <h1 style="font-family:var(--font-display);font-size:2rem;font-weight:800;margin-bottom:10px">Complete Your KYC</h1>
          <p style="color:var(--text-secondary);font-size:0.95rem">Required before investment. Takes less than 5 minutes.</p>
        </div>
        
        <!-- Step Progress -->
        <div class="kyc-steps" style="margin-bottom:48px">
          <div class="kyc-step active" id="step-ui-1">
            <div class="kyc-step-num">1</div>
            <div class="kyc-step-label">Personal Info</div>
          </div>
          <div class="kyc-connector" id="conn-1"></div>
          <div class="kyc-step" id="step-ui-2">
            <div class="kyc-step-num">2</div>
            <div class="kyc-step-label">Documents</div>
          </div>
          <div class="kyc-connector" id="conn-2"></div>
          <div class="kyc-step" id="step-ui-3">
            <div class="kyc-step-num">3</div>
            <div class="kyc-step-label">Live Selfie</div>
          </div>
          <div class="kyc-connector" id="conn-3"></div>
          <div class="kyc-step" id="step-ui-4">
            <div class="kyc-step-num">4</div>
            <div class="kyc-step-label">Review</div>
          </div>
        </div>
        
        <!-- Step Cards -->
        
        <!-- STEP 1: Personal Info -->
        <div id="kyc-step-1" class="card" style="padding:36px">
          <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:24px">Personal Information</h3>
          
          <div class="grid-2" style="gap:16px">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" id="kyc-name" class="form-input" value="${user?.name || ''}" placeholder="As on government ID">
              <span class="form-error" id="kyc-name-error"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Date of Birth <span class="required">*</span></label>
              <input type="date" id="kyc-dob" class="form-input" max="${new Date(Date.now() - 567648000000).toISOString().split('T')[0]}">
              <span class="form-error" id="kyc-dob-error"></span>
            </div>
          </div>
          
          <div class="grid-2" style="gap:16px">
            <div class="form-group">
              <label class="form-label">Aadhaar Card Number <span class="required">*</span></label>
              <input type="text" id="kyc-aadhaar" class="form-input" placeholder="1234 5678 9012" maxlength="14">
              <span class="form-hint">12-digit Aadhaar number</span>
              <span class="form-error" id="kyc-aadhaar-error"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label">PAN Card Number <span class="required">*</span></label>
              <input type="text" id="kyc-pan" class="form-input" placeholder="ABCDE1234F" maxlength="10" style="text-transform:uppercase">
              <span class="form-hint">10-character PAN number</span>
              <span class="form-error" id="kyc-pan-error"></span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Full Address <span class="required">*</span></label>
            <textarea id="kyc-address" class="form-input" placeholder="Complete residential address" rows="3" style="resize:vertical"></textarea>
            <span class="form-error" id="kyc-address-error"></span>
          </div>
          
          <button class="btn btn-primary btn-full btn-lg" onclick="kycStep1Next()">
            Continue → Documents
          </button>
        </div>
        
        <!-- STEP 2: Documents -->
        <div id="kyc-step-2" class="card" style="padding:36px;display:none">
          <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:8px">Upload Documents</h3>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:28px">Upload clear photos of your government-issued ID documents</p>
          
          <!-- Aadhaar Front -->
          <div class="form-group">
            <label class="form-label">Aadhaar Card – Front <span class="required">*</span></label>
            <div class="upload-zone" id="aadhaar-front-zone" onclick="triggerFileUpload('aadhaar-front')">
              <div class="upload-icon">🪪</div>
              <p style="font-weight:600;margin-bottom:4px">Click to upload or drag & drop</p>
              <p style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG – Max 5MB</p>
            </div>
            <input type="file" id="aadhaar-front" accept="image/*" style="display:none" onchange="previewUpload(this,'aadhaar-front-zone')">
            <span class="form-error" id="aadhaar-front-error"></span>
          </div>
          
          <!-- Aadhaar Back -->
          <div class="form-group">
            <label class="form-label">Aadhaar Card – Back <span class="required">*</span></label>
            <div class="upload-zone" id="aadhaar-back-zone" onclick="triggerFileUpload('aadhaar-back')">
              <div class="upload-icon">🪪</div>
              <p style="font-weight:600;margin-bottom:4px">Click to upload or drag & drop</p>
              <p style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG – Max 5MB</p>
            </div>
            <input type="file" id="aadhaar-back" accept="image/*" style="display:none" onchange="previewUpload(this,'aadhaar-back-zone')">
            <span class="form-error" id="aadhaar-back-error"></span>
          </div>
          
          <!-- PAN Card -->
          <div class="form-group">
            <label class="form-label">PAN Card <span class="required">*</span></label>
            <div class="upload-zone" id="pan-zone" onclick="triggerFileUpload('pan-card')">
              <div class="upload-icon">📋</div>
              <p style="font-weight:600;margin-bottom:4px">Click to upload or drag & drop</p>
              <p style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG – Max 5MB</p>
            </div>
            <input type="file" id="pan-card" accept="image/*" style="display:none" onchange="previewUpload(this,'pan-zone')">
            <span class="form-error" id="pan-zone-error"></span>
          </div>
          
          <div style="display:flex;gap:12px;margin-top:8px">
            <button class="btn btn-secondary btn-lg" onclick="kycGoStep(1)" style="flex:1">← Back</button>
            <button class="btn btn-primary btn-lg" onclick="kycStep2Next()" style="flex:2">Continue → Selfie</button>
          </div>
        </div>
        
        <!-- STEP 3: Live Selfie -->
        <div id="kyc-step-3" class="card" style="padding:36px;display:none">
          <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:8px">Live Selfie Verification</h3>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:24px">Take a live photo for identity verification. Make sure your face is clearly visible.</p>
          
          <div id="camera-section">
            <div class="camera-box" id="camera-box">
              <video id="camera-feed" autoplay playsinline muted style="display:none;width:100%;height:100%;object-fit:cover"></video>
              <canvas id="camera-canvas" style="display:none;width:100%;height:100%;object-fit:cover"></canvas>
              <div id="camera-placeholder" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
                <div style="font-size:3rem">📷</div>
                <p style="color:var(--text-secondary);font-size:0.9rem">Camera not started</p>
              </div>
              <div class="camera-overlay" id="cam-overlay" style="display:none">
                <div class="camera-frame"></div>
              </div>
            </div>
            
            <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
              <button id="start-cam-btn" class="btn btn-outline-gold" onclick="startCamera()" style="flex:1">
                📷 Start Camera
              </button>
              <button id="capture-btn" class="btn btn-primary" onclick="capturePhoto()" style="flex:1;display:none">
                📸 Capture Photo
              </button>
              <button id="retake-btn" class="btn btn-secondary" onclick="retakePhoto()" style="flex:1;display:none">
                🔄 Retake
              </button>
            </div>
            
            <div id="selfie-preview" style="display:none;margin-top:16px;text-align:center">
              <img id="selfie-img" style="max-width:200px;border-radius:var(--radius-sm);border:2px solid var(--accent-green)">
              <p style="color:var(--accent-green);margin-top:8px;font-size:0.85rem">✅ Photo captured! Looks good.</p>
            </div>
          </div>
          
          <!-- Tips -->
          <div style="margin-top:20px;padding:16px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);border-radius:var(--radius-sm)">
            <p style="font-weight:600;font-size:0.85rem;color:var(--accent-cyan);margin-bottom:8px">💡 Tips for a good photo:</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:4px">
              ${['Good lighting — face the light source', 'Remove sunglasses, hat, or face covering', 'Look directly at camera', 'Plain background preferred'].map(t => `<li style="font-size:0.82rem;color:var(--text-secondary)">• ${t}</li>`).join('')}
            </ul>
          </div>
          
          <div style="display:flex;gap:12px;margin-top:20px">
            <button class="btn btn-secondary btn-lg" onclick="kycGoStep(2);stopCamera()" style="flex:1">← Back</button>
            <button id="selfie-next-btn" class="btn btn-primary btn-lg" onclick="kycStep3Next()" style="flex:2" disabled>Continue → Review</button>
          </div>
        </div>
        
        <!-- STEP 4: Review & Submit -->
        <div id="kyc-step-4" class="card" style="padding:36px;display:none">
          <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin-bottom:24px">Review & Submit</h3>
          
          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm)">
              <span style="color:var(--text-secondary);font-size:0.85rem">Full Name</span>
              <span id="review-name" style="font-weight:600;font-size:0.9rem"></span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm)">
              <span style="color:var(--text-secondary);font-size:0.85rem">Date of Birth</span>
              <span id="review-dob" style="font-weight:600;font-size:0.9rem"></span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm)">
              <span style="color:var(--text-secondary);font-size:0.85rem">Aadhaar Number</span>
              <span id="review-aadhaar" style="font-weight:600;font-size:0.9rem"></span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm)">
              <span style="color:var(--text-secondary);font-size:0.85rem">PAN Number</span>
              <span id="review-pan" style="font-weight:600;font-size:0.9rem"></span>
            </div>
            <div style="padding:14px;background:rgba(6,214,160,0.06);border:1px solid rgba(6,214,160,0.2);border-radius:var(--radius-sm)">
              <p style="font-size:0.85rem;color:var(--accent-green)">✅ Documents uploaded</p>
            </div>
            <div style="padding:14px;background:rgba(6,214,160,0.06);border:1px solid rgba(6,214,160,0.2);border-radius:var(--radius-sm)">
              <p style="font-size:0.85rem;color:var(--accent-green)">✅ Live selfie captured</p>
            </div>
          </div>
          
          <div style="padding:16px;background:rgba(255,209,102,0.06);border:1px solid rgba(255,209,102,0.2);border-radius:var(--radius-sm);margin-bottom:24px">
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6">
              ⚠️ By submitting, you confirm all information is accurate and matches your government-issued ID. False information may result in account suspension.
            </p>
          </div>
          
          <div style="display:flex;gap:12px">
            <button class="btn btn-secondary btn-lg" onclick="kycGoStep(3)" style="flex:1">← Back</button>
            <button id="kyc-submit-btn" class="btn btn-primary btn-lg" onclick="submitKyc()" style="flex:2">
              🔐 Submit KYC
            </button>
          </div>
        </div>
        
        <!-- Already Pending/Approved -->
        <div id="kyc-status-view" style="display:none">
          <div class="card" style="padding:48px;text-align:center">
            <div id="kyc-status-icon" style="font-size:4rem;margin-bottom:20px">⏳</div>
            <h2 id="kyc-status-title" style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;margin-bottom:12px">KYC Pending</h2>
            <p id="kyc-status-msg" style="color:var(--text-secondary);margin-bottom:28px"></p>
            <button class="btn btn-primary" onclick="navigate('dashboard')">Go to Dashboard</button>
          </div>
        </div>
        
      </div>
    </div>
  `;
  
  // Check existing KYC status
  checkExistingKyc();
  
  // Setup drag and drop
  setupDragDrop();
  
  // PAN uppercase
  document.getElementById('kyc-pan').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
  });
  
  // Aadhaar format
  document.getElementById('kyc-aadhaar').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '').slice(0, 12);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.value = val;
  });
}

async function checkExistingKyc() {
  const res = await KycAPI.getStatus();
  if (res.success && res.data.status) {
    const status = res.data.status;
    if (status === 'pending' || status === 'approved') {
      // Show status view
      document.querySelectorAll('[id^="kyc-step-"]').forEach(el => el.style.display = 'none');
      const statusView = document.getElementById('kyc-status-view');
      statusView.style.display = 'block';
      
      const icons = { pending: '⏳', approved: '✅', rejected: '❌' };
      const titles = { pending: 'KYC Under Review', approved: 'KYC Approved!', rejected: 'KYC Rejected' };
      const msgs = {
        pending: 'Your documents are under review. This usually takes 24-48 hours.',
        approved: 'Your identity has been verified. You can now proceed to invest.',
        rejected: `Your KYC was rejected. Reason: ${res.data.rejection_reason || 'Documents unclear'}. Please resubmit.`
      };
      
      document.getElementById('kyc-status-icon').textContent = icons[status] || '⏳';
      document.getElementById('kyc-status-title').textContent = titles[status] || 'KYC Status';
      document.getElementById('kyc-status-msg').textContent = msgs[status] || '';
      
      if (status === 'rejected') {
        statusView.querySelector('.card').innerHTML += `<button class="btn btn-outline-gold" onclick="document.getElementById('kyc-status-view').style.display='none';document.getElementById('kyc-step-1').style.display='block'" style="margin-top:12px">Resubmit KYC</button>`;
      }
    }
  }
}

window.kycGoStep = (step) => {
  currentStep = step;
  
  // Hide all
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`kyc-step-${i}`);
    if (el) el.style.display = 'none';
    
    const stepUi = document.getElementById(`step-ui-${i}`);
    if (stepUi) {
      stepUi.classList.remove('active', 'done');
      if (i < step) stepUi.classList.add('done');
      else if (i === step) stepUi.classList.add('active');
    }
    
    const conn = document.getElementById(`conn-${i}`);
    if (conn) {
      conn.classList.toggle('done', i < step);
    }
  }
  
  const stepEl = document.getElementById(`kyc-step-${step}`);
  if (stepEl) stepEl.style.display = 'block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.kycStep1Next = () => {
  const name = document.getElementById('kyc-name').value.trim();
  const dob = document.getElementById('kyc-dob').value;
  const aadhaar = document.getElementById('kyc-aadhaar').value.replace(/\s/g, '');
  const pan = document.getElementById('kyc-pan').value.trim().toUpperCase();
  const address = document.getElementById('kyc-address').value.trim();
  
  let valid = true;
  
  if (!name || name.length < 3) {
    document.getElementById('kyc-name').classList.add('error');
    document.getElementById('kyc-name-error').textContent = 'Enter your full name';
    valid = false;
  }
  
  if (!dob) {
    document.getElementById('kyc-dob').classList.add('error');
    document.getElementById('kyc-dob-error').textContent = 'Enter date of birth';
    valid = false;
  }
  
  if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
    document.getElementById('kyc-aadhaar').classList.add('error');
    document.getElementById('kyc-aadhaar-error').textContent = 'Enter valid 12-digit Aadhaar number';
    valid = false;
  }
  
  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    document.getElementById('kyc-pan').classList.add('error');
    document.getElementById('kyc-pan-error').textContent = 'Enter valid PAN (e.g. ABCDE1234F)';
    valid = false;
  }
  
  if (!address || address.length < 10) {
    document.getElementById('kyc-address').classList.add('error');
    document.getElementById('kyc-address-error').textContent = 'Enter complete address';
    valid = false;
  }
  
  if (valid) kycGoStep(2);
};

window.kycStep2Next = () => {
  const aadhaarFront = document.getElementById('aadhaar-front').files[0];
  const aadhaarBack = document.getElementById('aadhaar-back').files[0];
  const panCard = document.getElementById('pan-card').files[0];
  
  if (!aadhaarFront) {
    document.getElementById('aadhaar-front-error').textContent = 'Upload Aadhaar front';
    return;
  }
  if (!aadhaarBack) {
    document.getElementById('aadhaar-back-error').textContent = 'Upload Aadhaar back';
    return;
  }
  if (!panCard) {
    document.getElementById('pan-zone-error').textContent = 'Upload PAN card';
    return;
  }
  
  kycGoStep(3);
};

window.kycStep3Next = () => {
  const canvas = document.getElementById('camera-canvas');
  if (canvas.style.display === 'none') {
    showToast('Please capture a live selfie', 'warning');
    return;
  }
  
  // Fill review
  document.getElementById('review-name').textContent = document.getElementById('kyc-name').value;
  document.getElementById('review-dob').textContent = document.getElementById('kyc-dob').value;
  document.getElementById('review-aadhaar').textContent = document.getElementById('kyc-aadhaar').value.replace(/\d{8}/, '****••••');
  document.getElementById('review-pan').textContent = document.getElementById('kyc-pan').value;
  
  stopCamera();
  kycGoStep(4);
};

window.startCamera = async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    
    const video = document.getElementById('camera-feed');
    video.srcObject = cameraStream;
    video.style.display = 'block';
    
    document.getElementById('camera-placeholder').style.display = 'none';
    document.getElementById('cam-overlay').style.display = 'flex';
    document.getElementById('start-cam-btn').style.display = 'none';
    document.getElementById('capture-btn').style.display = 'block';
    
  } catch (err) {
    showToast('Camera access denied. Please allow camera access and try again.', 'error');
    console.error('Camera error:', err);
  }
};

window.capturePhoto = () => {
  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('camera-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  // Show captured
  canvas.style.display = 'block';
  video.style.display = 'none';
  document.getElementById('cam-overlay').style.display = 'none';
  
  // Preview
  const selfiePreview = document.getElementById('selfie-preview');
  const selfieImg = document.getElementById('selfie-img');
  selfieImg.src = canvas.toDataURL('image/jpeg', 0.8);
  selfiePreview.style.display = 'block';
  
  document.getElementById('capture-btn').style.display = 'none';
  document.getElementById('retake-btn').style.display = 'block';
  document.getElementById('selfie-next-btn').disabled = false;
  
  // Stop stream
  stopCamera();
};

window.retakePhoto = () => {
  const canvas = document.getElementById('camera-canvas');
  const video = document.getElementById('camera-feed');
  
  canvas.style.display = 'none';
  document.getElementById('selfie-preview').style.display = 'none';
  document.getElementById('selfie-next-btn').disabled = true;
  document.getElementById('retake-btn').style.display = 'none';
  document.getElementById('start-cam-btn').style.display = 'block';
};

window.stopCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
};

window.triggerFileUpload = (id) => {
  document.getElementById(id).click();
};

window.previewUpload = (input, zoneId) => {
  const file = input.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large. Max 5MB allowed.', 'error');
    input.value = '';
    return;
  }
  
  const zone = document.getElementById(zoneId);
  const reader = new FileReader();
  reader.onload = (e) => {
    zone.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;padding:8px">
        <img src="${e.target.result}" style="width:80px;height:60px;object-fit:cover;border-radius:8px">
        <div>
          <p style="font-weight:600;font-size:0.9rem;color:var(--accent-green)">✅ ${file.name}</p>
          <p style="font-size:0.75rem;color:var(--text-muted)">${(file.size/1024).toFixed(0)} KB</p>
        </div>
      </div>
    `;
    zone.style.padding = '8px';
  };
  reader.readAsDataURL(file);
};

function setupDragDrop() {
  ['aadhaar-front-zone', 'aadhaar-back-zone', 'pan-zone'].forEach((zoneId, idx) => {
    const zone = document.getElementById(zoneId);
    const inputIds = ['aadhaar-front', 'aadhaar-back', 'pan-card'];
    
    if (!zone) return;
    
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const input = document.getElementById(inputIds[idx]);
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        previewUpload(input, zoneId);
      }
    });
  });
}

window.submitKyc = async () => {
  const btn = document.getElementById('kyc-submit-btn');
  setButtonLoading(btn, true, 'Submitting KYC…');
  
  const formData = new FormData();
  formData.append('full_name', document.getElementById('kyc-name').value.trim());
  formData.append('dob', document.getElementById('kyc-dob').value);
  formData.append('aadhaar_number', document.getElementById('kyc-aadhaar').value.replace(/\s/g, ''));
  formData.append('pan_number', document.getElementById('kyc-pan').value.trim().toUpperCase());
  formData.append('address', document.getElementById('kyc-address').value.trim());
  
  const aadhaarFront = document.getElementById('aadhaar-front').files[0];
  const aadhaarBack = document.getElementById('aadhaar-back').files[0];
  const panCard = document.getElementById('pan-card').files[0];
  
  if (aadhaarFront) formData.append('aadhaar_front', aadhaarFront);
  if (aadhaarBack) formData.append('aadhaar_back', aadhaarBack);
  if (panCard) formData.append('pan_card', panCard);
  
  // Selfie from canvas
  const canvas = document.getElementById('camera-canvas');
  canvas.toBlob(async (blob) => {
    if (blob) formData.append('selfie', blob, 'selfie.jpg');
    
    const res = await KycAPI.submitStep1(formData);
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('KYC submitted successfully! Under review.', 'success', 'KYC Submitted');
      setTimeout(() => navigate('dashboard'), 1500);
    } else {
      showToast(res.error || 'Submission failed. Try again.', 'error');
    }
  }, 'image/jpeg', 0.8);
};

export { renderKyc };
