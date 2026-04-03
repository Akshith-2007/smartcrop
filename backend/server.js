import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
};

const smtpAvailable = Boolean(smtpConfig.host && smtpConfig.auth);

const transporter = nodemailer.createTransport(smtpConfig);

const sendLoginEmail = async (email) => {
  const subject = 'SmartCrop - Login Notification';
  const text = `Hello,\n\nYou have successfully logged in to SmartCrop with ${email} at ${new Date().toLocaleString()}.\n\nIf this was not you, please secure your account immediately.`;

  if (smtpAvailable) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text
    });
  } else {
    console.log(`[SmartCrop] Login email would be sent to ${email} with subject: ${subject}`);
    console.log(text);
  }
};

console.log(`[SmartCrop] HF_API_TOKEN ${process.env.HF_API_TOKEN ? 'loaded' : 'missing'} (token length: ${process.env.HF_API_TOKEN ? process.env.HF_API_TOKEN.length : 0})`);

// In-Memory DB for simulation
const memoryDB = {
  users: {
    'farmer@example.com': { password: 'password123', name: 'Demo Farmer' },
    'user@example.com': { password: 'demo1234', name: 'Demo User' }
  },
  otps: {}, // email -> otp (deprecated)
  sessions: {} // session_id -> email
};

// ==========================================
// AUTH APIs
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = memoryDB.users[email.toLowerCase()];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    memoryDB.sessions[sessionId] = email.toLowerCase();

    try {
      await sendLoginEmail(email);
    } catch (emailErr) {
      console.error('[SmartCrop] Failed to send login email:', emailErr.message || emailErr);
    }

    res.json({ authenticated: true, session_id: sessionId, email: email.toLowerCase(), name: user.name });
  } catch (err) {
    console.error('[SmartCrop] Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/check-session', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.session_id || '';
  if (sessionId && memoryDB.sessions[sessionId]) {
    return res.json({ authenticated: true, email: memoryDB.sessions[sessionId] });
  }
  return res.json({ authenticated: false });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body?.session_id || '';
  if (sessionId && memoryDB.sessions[sessionId]) {
    delete memoryDB.sessions[sessionId];
  }
  res.json({ success: true });
});

// Note: OTP endpoints are deprecated and kept for compatibility (not used by frontend anymore).
app.post('/api/auth/send-otp', (req, res) => {
  res.status(410).json({ error: 'OTP authentication is deprecated. Use email + password login.' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  res.status(410).json({ error: 'OTP authentication is deprecated. Use email + password login.' });
});

// ==========================================
// SOIL & CROP APIs
// ==========================================
app.post('/api/soil/analyze', (req, res) => {
  const { nitrogen, phosphorus, potassium, ph, moisture } = req.body;
  const n = parseFloat(nitrogen);
  const p = parseFloat(phosphorus);
  const k = parseFloat(potassium);
  const phVal = parseFloat(ph);

  res.json({
    soil_analysis: {
      ph: {
        value: phVal || 6.5,
        status: phVal >= 5.5 && phVal <= 7.5 ? "Optimal" : "Needs Adjusting",
        recommendation: phVal >= 5.5 && phVal <= 7.5 ? "Maintain current pH" : "Apply soil conditioners."
      },
      nutrients: {
        nitrogen: n < 50 ? "Deficient" : "Optimal",
        phosphorus: p < 30 ? "Deficient" : "Optimal",
        potassium: k < 20 ? "Deficient" : "Optimal",
        moisture: moisture || "Adequate"
      }
    },
    overall_health: "Good",
    fertilizer_recommendation: {
      fertilizer_type: "NPK 20-20-20 (Custom Blend)",
      confidence: 0.88
    }
  });
});

app.post('/api/crops/recommend', (req, res) => {
  const { soil_ph } = req.body;
  const phVal = parseFloat(soil_ph);
  const potentialCrops = [];

  if (phVal >= 5.5 && phVal <= 7.5) {
    potentialCrops.push({ crop: 'Wheat', water_need: 'Moderate', ph_range: '6.0-7.0', season: 'Rabi', region: 'North/Central India' });
  }
  if (phVal >= 5.0 && phVal <= 7.0) {
    potentialCrops.push({ crop: 'Rice', water_need: 'High', ph_range: '5.0-6.5', season: 'Kharif', region: 'All India' });
  }
  if (phVal >= 5.8 && phVal <= 8.0) {
    potentialCrops.push({ crop: 'Cotton', water_need: 'Moderate', ph_range: '5.8-8.0', season: 'Kharif', region: 'Central/South India' });
  }
  if (potentialCrops.length === 0) {
    potentialCrops.push({ crop: 'Millets', water_need: 'Low', ph_range: '5.5-8.0', season: 'Kharif', region: 'Arid regions' });
  }

  res.json({ recommendations: potentialCrops });
});

const deriveNutrientStatus = (value, lowThreshold, highThreshold) => {
  if (value < lowThreshold) return 'low';
  if (value > highThreshold) return 'high';
  return 'optimal';
};

const buildFertilizerPlan = ({ cropName, nitrogen, phosphorus, potassium, moisture, weather }) => {
  const nStatus = deriveNutrientStatus(nitrogen, 50, 120);
  const pStatus = deriveNutrientStatus(phosphorus, 30, 80);
  const kStatus = deriveNutrientStatus(potassium, 20, 70);
  const moistureStatus = deriveNutrientStatus(moisture, 30, 70);

  const tomorrowRain = weather?.tomorrowRainMm ?? 0;
  const highHeat = (weather?.temperatureC ?? 30) >= 35;
  const highHumidity = (weather?.humidity ?? 50) >= 80;
  const unsafeForApplication = tomorrowRain >= 12;
  const preferredTime = highHeat ? 'Early morning (6-9 AM) or late evening (5-7 PM)' : 'Morning (7-10 AM)';

  const weatherAlert = unsafeForApplication
    ? 'Heavy rainfall expected in the next 24 hours. Delay application to avoid nutrient runoff.'
    : highHeat
      ? 'High daytime temperature forecasted. Apply fertilizer in the early morning or late evening.'
      : highHumidity
        ? 'Humidity is high. Ensure good drainage before application.'
        : 'Weather is suitable for fertilizer application in the next 24-48 hours.';

  const baseBlend = [];
  if (nStatus === 'low') baseBlend.push('Urea or DAP (Nitrogen support)');
  if (pStatus === 'low') baseBlend.push('Single Super Phosphate');
  if (kStatus === 'low') baseBlend.push('Muriate of Potash');
  if (baseBlend.length === 0) baseBlend.push('Balanced NPK 19-19-19');

  const firstActionWindow = unsafeForApplication ? 'Wait 2-3 days' : 'Within 24-48 hours';
  const followUpWindow = unsafeForApplication ? '5-7 days after rainfall' : '12-15 days after first dose';

  return {
    soil_summary: {
      nitrogen: nStatus,
      phosphorus: pStatus,
      potassium: kStatus,
      moisture: moistureStatus
    },
    weather_summary: {
      temperature_c: weather?.temperatureC ?? 30,
      humidity: weather?.humidity ?? 50,
      rainfall_next_day_mm: tomorrowRain
    },
    alerts: [weatherAlert],
    recommendations: [
      {
        id: 1,
        phase: 'Immediate application window',
        timing: firstActionWindow,
        best_time: preferredTime,
        fertilizer: baseBlend.join(' + '),
        reason: `Primary correction for ${cropName} based on current soil nutrient deficits.`,
        weather_note: weatherAlert
      },
      {
        id: 2,
        phase: 'Top dressing follow-up',
        timing: followUpWindow,
        best_time: preferredTime,
        fertilizer: nStatus === 'low' ? 'Split Nitrogen dose (Urea)' : 'Balanced NPK maintenance dose',
        reason: 'Supports vegetative growth and reduces nutrient stress during early crop development.',
        weather_note: unsafeForApplication
          ? 'Apply after field surface drains and no heavy rain is forecast.'
          : 'Proceed if no heavy rain (>10mm) is expected.'
      }
    ]
  };
};

app.post('/api/fertilizer/recommend', async (req, res) => {
  try {
    const { crop, nitrogen, phosphorus, potassium, moisture, latitude, longitude } = req.body;
    const n = Number(nitrogen) || 0;
    const p = Number(phosphorus) || 0;
    const k = Number(potassium) || 0;
    const m = Number(moisture) || 40;
    const lat = Number(latitude) || 18.52;
    const lon = Number(longitude) || 73.85;

    let weather = { temperatureC: 30, humidity: 50, tomorrowRainMm: 0 };

    try {
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=auto`
      );

      weather = {
        temperatureC: weatherResponse.data?.current?.temperature_2m ?? 30,
        humidity: weatherResponse.data?.current?.relative_humidity_2m ?? 50,
        tomorrowRainMm: weatherResponse.data?.daily?.precipitation_sum?.[1] ?? 0
      };
    } catch (weatherError) {
      console.log('Weather API unavailable. Using fallback conditions.');
    }

    const response = buildFertilizerPlan({
      cropName: crop || 'your crop',
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      moisture: m,
      weather
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate fertilizer recommendation' });
  }
});

// ==========================================
// WEATHER APIs (REAL-TIME VIA OPEN-METEO)
// ==========================================
app.get('/api/weather', async (req, res) => {
  res.json({ success: true });
});

app.get('/api/weather/advisory', async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 18.52;
    const lon = Number(req.query.lon) || 73.85;
    const timezone = req.query.timezone || 'auto';
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=${encodeURIComponent(timezone)}`);
    
    const current = response.data.current;
    const precipitationSum = response.data.daily.precipitation_sum[1] || 0; // Tomorrow
    const alerts = [];
    
    if (precipitationSum > 10) {
      alerts.push({ priority: 'high', message: 'Heavy rain expected tomorrow. Delay top dressing fertilizer.' });
    } else {
      alerts.push({ priority: 'low', message: 'Clear weather ahead. Optimal for harvesting or planting.' });
    }
    
    res.json({
      weather: {
        rainfall_mm: current.precipitation || 0,
        temperature: current.temperature_2m || 30,
        humidity: current.relative_humidity_2m || 50
      },
      location: { latitude: lat, longitude: lon, timezone },
      updated_at: new Date().toISOString(),
      alerts
    });
  } catch (err) {
    res.json({
      weather: { rainfall_mm: 0, temperature: 28, humidity: 60 },
      location: { latitude: 18.52, longitude: 73.85, timezone: 'auto' },
      updated_at: new Date().toISOString(),
      alerts: [{ priority: 'medium', message: 'Live weather unavailable. Showing fallback advisory.' }]
    });
  }
});

// ==========================================
// MARKET APIs
// ==========================================
app.get('/api/market/prices', async (req, res) => {
  try {
    const commodity = (req.query.crop || '').trim();
    const liveResponse = await axios.get('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', {
      params: {
        'api-key': process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd00000100000000000000000000000000000000',
        format: 'json',
        limit: 25,
        ...(commodity ? { 'filters[commodity]': commodity } : {}),
      },
      timeout: 8000
    });

    const records = liveResponse.data?.records || [];
    const prices = records.map((item) => ({
      crop: item.commodity,
      market: `${item.market || 'Unknown Market'}, ${item.district || ''}`.replace(/,\s*$/, ''),
      price_per_quintal: Number(item.modal_price) || Number(item.max_price) || 0,
      unit: 'INR/quintal',
      source_date: item.arrival_date || 'N/A',
      trend: 'flat'
    })).filter((p) => p.price_per_quintal > 0);

    res.json({
      prices,
      source: 'Agmarknet (data.gov.in)',
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      prices: [
        { crop: 'Wheat', market: 'Visakhapatnam Mandi', price_per_quintal: 2230, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'up' },
        { crop: 'Rice', market: 'Guntur Mandi', price_per_quintal: 4080, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'flat' },
        { crop: 'Cotton', market: 'Warangal Mandi', price_per_quintal: 7140, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'down' },
        { crop: 'Maize', market: 'Akola Mandi', price_per_quintal: 2100, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'up' },
        { crop: 'Soybean', market: 'Indore Mandi', price_per_quintal: 4500, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'flat' },
        { crop: 'Sugarcane', market: 'Nagpur Mandi', price_per_quintal: 3250, unit: 'INR/quintal', source_date: new Date().toISOString().slice(0, 10), trend: 'down' }
      ],
      source: 'Fallback dataset covering multiple crops',
      updated_at: new Date().toISOString()
    });
  }
});

app.get('/api/market/price/:cropName', (req, res) => {
  res.json({ price: 2500, trend: '+1%' });
});

// ==========================================
// PEST APIs
// ==========================================
const formatRawModelLabel = (rawLabel) => {
  if (!rawLabel) return 'Unclassified';
  const raw = String(rawLabel).trim();
  const parts = raw.split('___');
  if (parts.length === 2) {
    const crop = parts[0].replace(/_/g, ' ').trim();
    const cond = parts[1].replace(/_/g, ' ').trim();
    return `${cond} (${crop})`;
  }
  return raw.replace(/_/g, ' ');
};

const genericMeasuresForLabel = (labelLower) => {
  if (labelLower.includes('healthy')) {
    return ['Continue regular monitoring', 'Maintain balanced irrigation and nutrition'];
  }
  return [
    'Isolate or flag affected plants if symptoms spread',
    'Confirm with a local agriculture officer if unsure',
    'Follow label directions for any spray and safety interval'
  ];
};

const classifyLabel = (rawLabel) => {
  const label = (rawLabel || '').toLowerCase();
  const mapping = [
    { keywords: ['healthy'], type: 'disease', name: 'Healthy leaf (No major disease detected)', measures: ['Continue regular monitoring', 'Maintain balanced irrigation and nutrition'] },
    { keywords: ['blight', 'late blight', 'early blight'], type: 'disease', name: 'Leaf blight', measures: ['Remove infected leaves', 'Use copper-based fungicide', 'Avoid leaf wetness at night'] },
    { keywords: ['rust'], type: 'disease', name: 'Rust disease', measures: ['Spray sulfur or triazole fungicide', 'Increase field ventilation'] },
    { keywords: ['powdery mildew', 'mildew'], type: 'disease', name: 'Powdery mildew', measures: ['Apply sulfur spray', 'Reduce overcrowding and humidity'] },
    { keywords: ['spot', 'leaf spot', 'scab', 'mosaic', 'curl', 'canker', 'rot', 'mold', 'anthracnose'], type: 'disease', name: null, measures: null },
    { keywords: ['wilt', 'bacterial'], type: 'disease', name: 'Bacterial wilt', measures: ['Rogue infected plants', 'Disinfect tools', 'Use resistant varieties next cycle'] },
    { keywords: ['aphid', 'whitefly', 'thrips', 'beetle', 'mite'], type: 'pest', name: 'Sap-sucking or chewing pest infestation', measures: ['Use yellow sticky traps', 'Spray neem oil', 'Promote biological control agents'] },
    { keywords: ['armyworm', 'worm', 'caterpillar'], type: 'pest', name: 'Caterpillar / Armyworm infestation', measures: ['Use pheromone traps', 'Spray Bt formulation', 'Handpick larvae in early stage'] }
  ];

  const found = mapping.find((item) => item.keywords.some((key) => label.includes(key)));
  if (found) {
    if (found.name && found.measures) return found;
    return {
      type: found.type || 'disease',
      name: formatRawModelLabel(rawLabel),
      measures: genericMeasuresForLabel(label)
    };
  }

  return null;
};

const resolveDetectionFromModelLabel = (rawLabel) => {
  const parsed = classifyLabel(rawLabel);
  if (parsed) return parsed;
  const label = (rawLabel || '').toLowerCase();
  const pestHints = ['aphid', 'whitefly', 'thrips', 'beetle', 'mite', 'worm', 'caterpillar', 'armyworm', 'weevil', 'hopper'];
  const isPest = pestHints.some((k) => label.includes(k));
  return {
    type: isPest ? 'pest' : 'disease',
    name: formatRawModelLabel(rawLabel),
    measures: genericMeasuresForLabel(label)
  };
};

const fallbackFromFilename = (fileName) => classifyLabel(fileName);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PEST_MODEL_CANDIDATES = (
  process.env.PEST_MODEL_IDS ||
  'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification,Diginsa/Plant-Disease-Detection-Project'
)
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const runLivePestModel = async ({ imageBuffer, mimeType }) => {
  const token = process.env.HF_API_TOKEN;
  const headers = {
    'Content-Type': mimeType || 'application/octet-stream',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  let lastError = null;

  for (const modelId of PEST_MODEL_CANDIDATES) {
    const modelUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const hfResponse = await axios.post(modelUrl, imageBuffer, {
          headers,
          timeout: 25000,
      validateStatus: () => true
        });

        if (hfResponse.status === 503 || hfResponse.status === 429) {
          await sleep(1200 * attempt);
          continue;
        }

        if (hfResponse.status === 401 || hfResponse.status === 403) {
          const errMsg = hfResponse.data?.error || hfResponse.data?.message || 'Unauthorized';
          throw new Error(`HF auth failed (${hfResponse.status}): ${errMsg}`);
        }

        const predictions = Array.isArray(hfResponse.data) ? hfResponse.data : [];
        const best = predictions[0];

        if (!best?.label) {
          const maybeError = hfResponse.data?.error || hfResponse.data?.message;
          if (maybeError) {
            throw new Error(`HF model response missing prediction (${hfResponse.status}): ${maybeError}`);
          }
          throw new Error(`HF model returned no predictions (${hfResponse.status}).`);
        }

        return { best, provider: 'HuggingFace Inference API', modelId };
      } catch (error) {
        lastError = error;
        console.error('[SmartCrop] Live pest model call failed', {
          modelId,
          attempt,
          status: error?.response?.status,
          message: error?.message
        });
        await sleep(900 * attempt);
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error('No live model prediction returned');
};

app.post('/api/pest/detect', upload.single('image'), async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const live = await runLivePestModel({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype
    });

    const best = live.best;
    if (!best?.label) {
      return res.json({
        disease_detected: 'Unknown / Uncertain',
        detection_type: 'unknown',
        confidence: 0.55,
        confidence_percentage: '55.0',
        is_reliable: false,
        warning: 'No prediction returned from the model. Try again with a clear photo of the leaf or pest.',
        control_measures_available: false,
        control_measures: []
      });
    }

    const parsed = resolveDetectionFromModelLabel(best.label);
    const confidence = Number(best.score || 0);
    const photo_tip =
      confidence > 0 && confidence < 0.4
        ? 'Tip: Use a steady close-up in daylight so symptoms are easier to see.'
        : null;

    return res.json({
      disease_detected: parsed.name,
      detection_type: parsed.type,
      model_label: best.label,
      model_provider: live.provider,
      model_id: live.modelId,
      confidence,
      confidence_percentage: (confidence * 100).toFixed(1),
      is_reliable: confidence >= 0.5,
      control_measures_available: true,
      control_measures: parsed.measures,
      ...(photo_tip ? { photo_tip } : {})
    });
  } catch (error) {
    const fallback = fallbackFromFilename((req.file.originalname || '').toLowerCase());
    if (fallback) {
      return res.json({
        disease_detected: fallback.name,
        detection_type: fallback.type,
        model_provider: 'Fallback logic',
        model_id: 'filename-keyword-fallback',
        confidence: 0.7,
        confidence_percentage: '70.0',
        is_reliable: false,
        warning: 'Live model is currently unavailable. This is a fallback estimate.',
        control_measures_available: true,
        control_measures: fallback.measures
      });
    }

    return res.json({
      disease_detected: 'Unknown / Uncertain',
      detection_type: 'unknown',
      model_provider: 'Unavailable',
      model_id: 'none',
      confidence: 0.5,
      confidence_percentage: '50.0',
      is_reliable: false,
      warning: 'Live model is currently unavailable. Please try again in a moment.',
      control_measures_available: false,
      control_measures: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`SmartCrop Backend running on http://localhost:${PORT}`);
});
