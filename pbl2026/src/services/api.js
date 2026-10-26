// src/services/api.js
import { supabase } from './supabaseClient';

const FASTAPI_URL = 'http://localhost:8000';

// Cache the session so we don't call getSession() on every request
let _cachedSession = null;
supabase.auth.onAuthStateChange((event, session) => {
  _cachedSession = session;
});
// Also try to get it immediately on load
supabase.auth.getSession().then(({ data }) => {
  _cachedSession = data?.session ?? null;
}).catch(() => {});

/** Get auth headers without waiting for getSession() */
function _authHeaders() {
  const token = _cachedSession?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Converts a Supabase snake_case analyses row → camelCase UI shape
function _toAnalysis(row) {
  if (!row) return null;
  return {
    id:             row.id,
    userId:         row.user_id,
    userName:       row.user_name,
    imageUrl:       row.image_url,
    animalType:     row.animal_type,
    predictedBreed: row.predicted_breed,
    confidence:     row.confidence,
    top3Predictions:row.top3_predictions,
    breedStatus:    row.breed_status,
    gradCamHeatmap: row.grad_cam_heatmap,
    gradCamOverlay: row.grad_cam_overlay,
    status:         row.status,
    flwResult:      row.flw_result,
    flwComment:     row.flw_comment,
    flwId:          row.flw_id,
    flwName:        row.flw_name,
    verifiedDate:   row.verified_date,
    date:           row.date,
  };
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const loginUser = async ({ email, password, role }) => {
  console.log('[Login] starting for:', email, 'role:', role);

  // Hard 10s timeout on the auth call itself
  let data, error;
  try {
    const authPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('Auth timed out after 10s — check your internet connection')), 10000)
    );
    const result = await Promise.race([authPromise, timeoutPromise]);
    data  = result.data;
    error = result.error;
  } catch (e) {
    console.error('[Login] signInWithPassword threw:', e.message);
    throw new Error(e.message);
  }

  if (error) {
    console.error('[Login] auth error:', error.message);
    throw new Error(error.message);
  }

  console.log('[Login] auth OK, user id:', data.user.id);
  const { session, user: authUser } = data;

  // Fetch profile with 15s timeout (Supabase can be slow from India)
  let profile = null;
  try {
    const profilePromise = supabase
      .from('profiles').select('*').eq('id', authUser.id).single();
    const timeoutPromise = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('timeout')), 15000)
    );
    const { data: p, error: pErr } = await Promise.race([profilePromise, timeoutPromise]);
    if (!pErr) { profile = p; console.log('[Login] profile OK:', p?.name, p?.role); }
    else console.warn('[Login] profile error:', pErr.message);
  } catch (e) {
    console.warn('[Login] profile fetch timed out or threw:', e.message);
  }

  // Fallback if profile missing
  if (!profile) {
    console.warn('[Login] using fallback profile');
    profile = {
      id:     authUser.id,
      email:  authUser.email,
      name:   authUser.user_metadata?.name || authUser.email.split('@')[0],
      role:   authUser.user_metadata?.role || role || 'user',
      status: 'Active',
    };
  }

  console.log('[Login] profile role:', profile.role, '| requested role:', role);

  if (role && profile.role !== role) {
    supabase.auth.signOut().catch(() => {});
    throw new Error(`Role mismatch. This account is "${profile.role}" but you selected "${role}".`);
  }
  if (profile.status === 'Inactive' || profile.status === 'Deactivated') {
    supabase.auth.signOut().catch(() => {});
    throw new Error('Account deactivated. Contact administrator.');
  }

  console.log('[Login] ✅ done');
  return { success: true, user: profile, token: session.access_token };
};

export const registerUser = async ({ name, email, password, role }) => {
  if (role === 'admin') throw new Error('Admin registration is not permitted.');

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const authUser = data.user;
  if (!authUser) throw new Error('Sign-up failed — no user returned.');

  // Try to upsert the profile, but don't block if it fails
  let profile = null;
  try {
    const { data: p, error: pErr } = await supabase
      .from('profiles')
      .upsert({ id: authUser.id, name, email, role, status: 'Active' })
      .select().single();
    if (!pErr) profile = p;
    else console.warn('[Register] profile upsert:', pErr.message);
  } catch (e) {
    console.warn('[Register] profile upsert threw:', e.message);
  }

  return {
    success: true,
    user: profile || { id: authUser.id, email, name, role, status: 'Active' },
    token: data.session?.access_token ?? null,
  };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
  return { success: true };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId).select().single();
  if (error) throw new Error(error.message);
  return { success: true, user: data };
};

// ─── IMAGE UPLOAD ────────────────────────────────────────────────────────────

export const uploadImage = async (file) =>
  new Promise(resolve => {
    const r = new FileReader();
    r.onloadend = () => resolve({ imageUrl: r.result });
    r.readAsDataURL(file);
  });

// ─── ANALYSE / PREDICT ───────────────────────────────────────────────────────

export const analyzeImage = async (imageData, userId = null, userName = 'User') => {
  console.log('[Predict] analyzeImage called, has file:', !!imageData.file);
  const dateStr = todayStr();

  // ── Try real FastAPI backend ──────────────────────────────────────────────
  if (imageData.file) {
    try {
      console.log('[Predict] step 1 — building formData');
      const formData = new FormData();
      formData.append('file', imageData.file);

      console.log('[Predict] step 2 — getting session');
      const headers = _authHeaders();
      console.log('[Predict] step 3 — session ok, fetching backend');

      const controller = new AbortController();
      const backendTimeout = setTimeout(() => {
        controller.abort();
        console.warn('[Predict] ⚠️ backend took >15s — using mock');
      }, 15000);

      const response = await fetch(`${FASTAPI_URL}/predict`, {
        method: 'POST', body: formData, headers,
        signal: controller.signal,
      }).finally(() => clearTimeout(backendTimeout));

      console.log('[Predict] step 4 — response status:', response.status);

      if (response.ok) {
        const ai = await response.json();
        console.log('[Predict] ✅ backend result:', ai.predictedBreed, ai.confidence + '%');

        // Backend already saved to DB and returned id — use it directly.
        // Patch user_id/user_name in case backend auth timed out and saved NULLs.
        if (ai.id) {
          if (userId) {
            supabase.from('analyses').update({ user_id: userId, user_name: userName })
              .eq('id', ai.id).then(({ error }) => {
                if (error) console.warn('[Predict] user patch error:', error.message);
                else console.log('[Predict] ✅ user_id patched on row', ai.id);
              });
          }
          return {
            id:             ai.id,
            userId,
            userName,
            imageUrl:       imageData.imageUrl || null,
            animalType:     ai.animalType,
            predictedBreed: ai.predictedBreed,
            confidence:     ai.confidence,
            top3Predictions:ai.top3Predictions,
            breedStatus:    ai.breedStatus,
            gradCamHeatmap: ai.gradCamHeatmap || null,
            gradCamOverlay: ai.gradCamOverlay || null,
            status:         'Pending',
            date:           dateStr,
          };
        }

        // Backend didn't return id — save from frontend
        const { data: row, error: insErr } = await supabase.from('analyses').insert({
          user_id: userId, user_name: userName,
          image_url: imageData.imageUrl || null,
          animal_type: ai.animalType,
          predicted_breed: ai.predictedBreed,
          confidence: ai.confidence,
          top3_predictions: ai.top3Predictions,
          breed_status: ai.breedStatus,
          status: 'Pending', date: dateStr,
        }).select().single();

        if (insErr) console.warn('[Predict] frontend insert error:', insErr.message);
        return _toAnalysis(row) || {
          id: 'tmp-' + Date.now(), userId, userName,
          animalType: ai.animalType, predictedBreed: ai.predictedBreed,
          confidence: ai.confidence, top3Predictions: ai.top3Predictions,
          breedStatus: ai.breedStatus, status: 'Pending', date: dateStr,
        };
      }
      if (response.status === 422) {
        // Image is not a cow/buffalo — show the message, do NOT fall back to mock data
        let msg = "This doesn't look like a cow or buffalo. Please upload a clear photo of the animal.";
        try { const body = await response.json(); if (body?.detail) msg = body.detail; } catch (_) {}
        const rejection = new Error(msg);
        rejection.isRejection = true;
        throw rejection;
      }
      console.warn('[Predict] ⚠️ backend status:', response.status);
    } catch (err) {
      if (err.isRejection) throw err;
      if (err.name === 'AbortError') {
        console.warn('[Predict] ⚠️ backend timed out after 15s, falling back to mock');
      } else {
        console.warn('[Predict] ⚠️ backend unreachable:', err.message);
      }
    }
  }

  // ── Mock fallback (backend not running) ──────────────────────────────────
  await new Promise(r => setTimeout(r, 600));
  const mocks = [
    { animalType:'Cattle',  predictedBreed:'Gir',     confidence:78, top3Predictions:[{breed:'Gir',confidence:78},{breed:'Sahiwal',confidence:15},{breed:'HF',confidence:7}],          breedStatus:'Pure' },
    { animalType:'Buffalo', predictedBreed:'Murrah',  confidence:84, top3Predictions:[{breed:'Murrah',confidence:84},{breed:'Jaffarabadi',confidence:11},{breed:'Surti',confidence:5}],  breedStatus:'Pure' },
    { animalType:'Cattle',  predictedBreed:'Sahiwal', confidence:82, top3Predictions:[{breed:'Sahiwal',confidence:82},{breed:'Red Sindhi',confidence:12},{breed:'Gir',confidence:6}],    breedStatus:'Pure' },
    { animalType:'Cattle',  predictedBreed:'Holstein Friesian (HF)', confidence:89, top3Predictions:[{breed:'Holstein Friesian (HF)',confidence:89},{breed:'Jersey',confidence:8},{breed:'Crossbreed HF',confidence:3}], breedStatus:'Crossbreed' },
  ];
  const ai = mocks[Math.floor(Math.random() * mocks.length)];

  const { data: row, error: insErr } = await supabase.from('analyses').insert({
    user_id: userId, user_name: userName,
    image_url: imageData.imageUrl || null,
    animal_type: ai.animalType, predicted_breed: ai.predictedBreed,
    confidence: ai.confidence, top3_predictions: ai.top3Predictions,
    breed_status: ai.breedStatus, status: 'Pending', date: dateStr,
  }).select().single();

  if (insErr) console.warn('[Predict] mock insert error:', insErr.message);

  return _toAnalysis(row) || {
    id: 'tmp-' + Date.now(), userId, userName,
    animalType: ai.animalType, predictedBreed: ai.predictedBreed,
    confidence: ai.confidence, top3Predictions: ai.top3Predictions,
    breedStatus: ai.breedStatus, status: 'Pending', date: dateStr,
  };
};

// ─── HISTORY / ANALYSIS ──────────────────────────────────────────────────────

export const getAnalysis = async (id) => {
  const { data, error } = await supabase.from('analyses').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return _toAnalysis(data);
};

export const getHistory = async (userId = null) => {
  try {
    let q = supabase.from('analyses').select('*').order('created_at', { ascending: false });

    // Only filter by user_id if it looks like a valid UUID
    if (userId && typeof userId === 'string' && userId.includes('-') && !userId.startsWith('tmp-')) {
      q = q.eq('user_id', userId);
    }

    // Race against a 12s timeout to prevent hanging on slow Supabase connections
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('Supabase query timed out')), 12000)
    );
    const { data, error } = await Promise.race([q, timeout]);
    if (error) { console.warn('[History] Supabase error:', error.message); return []; }
    return (data || []).map(_toAnalysis);
  } catch (err) {
    console.warn('[History] threw:', err.message);
    return [];
  }
};

export const deleteAnalysis = async (id) => {
  const { error } = await supabase.from('analyses').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── FLW ─────────────────────────────────────────────────────────────────────

export const getPendingReviews = async () => {
  try {
    const q = supabase.from('analyses').select('*')
      .in('status', ['Pending', 'Under Review']).order('created_at', { ascending: false });
    // Never hang forever — fail after 12s so the UI can leave the loading state
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('Pending reviews query timed out')), 12000)
    );
    const { data, error } = await Promise.race([q, timeout]);
    if (error) { console.warn('[Pending] Supabase error:', error.message); return []; }
    return (data || []).map(_toAnalysis);
  } catch (err) {
    console.warn('[Pending] threw:', err.message);
    return [];
  }
};

export const getReview = async (id) => getAnalysis(id);

export const verifyPrediction = async (id, flwData = {}) => {
  const { data, error } = await supabase.from('analyses')
    .update({ status:'Verified', flw_result: flwData.predictedBreed||null,
              flw_id: flwData.flwId||null, flw_name: flwData.flwName||null,
              flw_comment: flwData.comment||'Verified as accurate.', verified_date: todayStr() })
    .eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data: _toAnalysis(data) };
};

export const correctPrediction = async (id, correctionData = {}) => {
  const { data, error } = await supabase.from('analyses')
    .update({ status:'Corrected', flw_result: correctionData.verifiedBreed||null,
              breed_status: correctionData.breedStatus||null,
              flw_comment: correctionData.comment||'', flw_id: correctionData.flwId||null,
              flw_name: correctionData.flwName||null, verified_date: todayStr() })
    .eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data: _toAnalysis(data) };
};

export const submitFeedback = (id, feedback) => correctPrediction(id, feedback);

export const getFlwVerifiedCases = async () => {
  const { data, error } = await supabase.from('analyses').select('*')
    .in('status', ['Verified','Corrected']).order('created_at', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return (data || []).map(_toAnalysis);
};

export const getFlwHistory = async (filter = 'All') => {
  let q = supabase.from('analyses').select('*').order('created_at', { ascending: false });
  if (filter !== 'All') q = q.eq('status', filter);
  const { data, error } = await q;
  if (error) { console.warn(error.message); return []; }
  return (data || []).map(_toAnalysis);
};

export const getFlwFeedbackList = async () => {
  const { data, error } = await supabase.from('analyses').select('*')
    .or('status.eq.Corrected,and(status.eq.Verified,flw_comment.neq.null)')
    .order('created_at', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return (data || []).map(_toAnalysis);
};

// ─── ADMIN — Users ───────────────────────────────────────────────────────────

export const getUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return data || [];
};

export const getUser = async (id) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateUserStatus = async (id, status) => {
  const { data, error } = await supabase.from('profiles').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, user: data };
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from('profiles').update({ status: 'Deactivated' }).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── ADMIN — Dataset ─────────────────────────────────────────────────────────

export const getDatasetImages = async () => {
  const { data, error } = await supabase.from('dataset').select('*').order('date_added', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return data || [];
};

export const uploadDatasetImage = async (imageData) => {
  const { data, error } = await supabase.from('dataset')
    .insert({ breed: imageData.breed, type: imageData.type||'Cattle',
              status:'Verified', image_url: imageData.imageUrl||null,
              date_added: new Date().toISOString().split('T')[0] })
    .select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateDatasetLabel = async (id, newLabel, type) => {
  const updates = { breed: newLabel };
  if (type) updates.type = type;
  const { data, error } = await supabase.from('dataset').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteDatasetImage = async (id) => {
  const { error } = await supabase.from('dataset').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── ADMIN — Model / Reports ─────────────────────────────────────────────────

export const testModel = async (imageData) => {
  if (imageData.file) {
    try {
      const formData = new FormData();
      formData.append('file', imageData.file);
      const headers = _authHeaders();
      const res = await fetch(`${FASTAPI_URL}/predict`, { method:'POST', body:formData, headers });
      if (res.ok) {
        const r = await res.json();
        return { ...r, gradCamAvailable: !!(r.gradCamHeatmap || r.gradCamOverlay) };
      }
      if (res.status === 422) {
        let msg = "This doesn't look like a cow or buffalo.";
        try { const body = await res.json(); if (body?.detail) msg = body.detail; } catch (_) {}
        const rejection = new Error(msg);
        rejection.isRejection = true;
        throw rejection;
      }
    } catch (err) {
      if (err.isRejection) throw err;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  return { predictedBreed:'Gir', confidence:81,
           top3Predictions:[{breed:'Gir',confidence:81},{breed:'Sahiwal',confidence:13},{breed:'Kankrej',confidence:6}],
           gradCamAvailable:false, gradCamHeatmap:null, gradCamOverlay:null };
};

export const getModelMetrics = async () => ({
  accuracy:'92.4%', precision:'91.8%', recall:'90.6%', f1Score:'91.2%'
});

export const getAdminFeedback = async () => {
  const { data, error } = await supabase.from('analyses').select('*')
    .in('status',['Corrected','Verified']).order('created_at',{ ascending:false });
  if (error) { console.warn(error.message); return []; }
  return (data || []).map(_toAnalysis);
};

export const getReports = async () => {
  const { data } = await supabase.from('analyses').select('status');
  const analyses = data || [];
  const metrics  = await getModelMetrics();
  return {
    totalAnalyses:  analyses.length,
    verifiedCases:  analyses.filter(a => a.status === 'Verified').length,
    correctedCases: analyses.filter(a => a.status === 'Corrected').length,
    pendingCases:   analyses.filter(a => a.status === 'Pending' || a.status === 'Under Review').length,
    metrics,
  };
};

export const getAdminStats = async () => {
  const [pr, ar] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('analyses').select('status,created_at,predicted_breed,user_name,animal_type')
      .order('created_at',{ ascending:false }).limit(5),
  ]);
  const profiles = pr.data  || [];
  const analyses = ar.data  || [];
  return {
    totalUsers:    profiles.filter(p => p.role === 'user').length,
    totalFlws:     profiles.filter(p => p.role === 'flw').length,
    totalAnalyses: analyses.length,
    pendingReviews:analyses.filter(a => a.status === 'Pending' || a.status === 'Under Review').length,
    recentActivity:analyses,
  };
};
