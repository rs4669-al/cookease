import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Search, PencilLine, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFridge, CATEGORIES } from '../context/FridgeContext';
import { Button, Modal, Badge } from '../components/UI';
import ItemForm from '../components/ItemForm';
import './Scanner.css';

// ── Open Food Facts lookup ────────────────────────────────────────────────
async function lookupBarcode(barcode) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await res.json();
    if (data.status !== 1) return null;

    const p = data.product;
    const rawCategory = (p.categories_tags?.[0] || '').toLowerCase();

    // Map OFF categories to our categories
    const catMap = {
      dairy: ['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream'],
      produce: ['fruits', 'vegetables', 'fresh', 'produce'],
      meat: ['meat', 'beef', 'pork', 'chicken', 'poultry'],
      seafood: ['fish', 'seafood', 'tuna', 'salmon'],
      grains: ['grain', 'cereal', 'pasta', 'rice', 'bread', 'wheat', 'oat'],
      snacks: ['snack', 'chip', 'cookie', 'cracker', 'candy', 'chocolate', 'sweet'],
      beverages: ['beverage', 'drink', 'juice', 'water', 'soda', 'coffee', 'tea'],
      condiments: ['sauce', 'condiment', 'dressing', 'vinegar', 'oil', 'seasoning', 'spice'],
      frozen: ['frozen'],
      bakery: ['bakery', 'bread', 'pastry', 'cake'],
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(catMap)) {
      if (keywords.some(kw => rawCategory.includes(kw))) { category = cat; break; }
    }

    return {
      name: p.product_name_en || p.product_name || '',
      brand: p.brands?.split(',')[0]?.trim() || '',
      category,
      barcode,
      calories: p.nutriments?.['energy-kcal_100g']
        ? Math.round(p.nutriments['energy-kcal_100g'])
        : null,
      imageUrl: p.image_front_url || null,
    };
  } catch {
    return null;
  }
}

export default function Scanner() {
  const { addItem } = useFridge();
  const navigate = useNavigate();

  const [mode, setMode] = useState('options'); // options | camera | manual-barcode | manual-form
  const [scanning, setScanning] = useState(false);
  const [lookupState, setLookupState] = useState('idle'); // idle | loading | found | not-found | error
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [prefill, setPrefill] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [added, setAdded] = useState(null);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const Quagga    = useRef(null);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (Quagga.current) {
      try { Quagga.current.stop(); } catch {}
      Quagga.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Start camera barcode scanner
  const startCamera = async () => {
    setMode('camera');
    setLookupState('idle');
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Dynamically import Quagga
      const Q = (await import('quagga')).default;
      Quagga.current = Q;

      Q.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: { facingMode: 'environment' },
        },
        decoder: {
          readers: [
            'ean_reader', 'ean_8_reader', 'upc_reader',
            'upc_e_reader', 'code_128_reader', 'code_39_reader',
          ],
        },
        locate: true,
      }, (err) => {
        if (err) { toast.error('Could not start scanner'); stopCamera(); return; }
        Q.start();
      });

      Q.onDetected(async (result) => {
        const code = result.codeResult.code;
        if (!code) return;
        Q.stop();
        stopCamera();
        await handleBarcodeFound(code);
      });
    } catch (err) {
      toast.error('Camera access denied. Try entering the barcode manually.');
      setMode('manual-barcode');
      setScanning(false);
    }
  };

  const handleBarcodeFound = async (code) => {
    setScannedBarcode(code);
    setLookupState('loading');
    setMode('result');

    const product = await lookupBarcode(code);

    if (product && product.name) {
      setLookupState('found');
      setPrefill(product);
    } else {
      setLookupState('not-found');
      setPrefill({ barcode: code });
    }
  };

  const handleManualBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    await handleBarcodeFound(manualBarcode.trim());
  };

  const handleFormSubmit = (data) => {
    const item = addItem(data);
    setAdded(item);
    setShowForm(false);
    toast.success(`"${item.name}" added to your fridge! 🎉`);
    setMode('success');
  };

  const resetAll = () => {
    setMode('options');
    setLookupState('idle');
    setScannedBarcode('');
    setManualBarcode('');
    setPrefill({});
    setShowForm(false);
    setAdded(null);
  };

  return (
    <div className="scanner">

      {/* Options */}
      {mode === 'options' && (
        <div className="scanner__options">
          <div className="scanner__hero">
            <div className="scanner__hero-icon">📷</div>
            <h2 className="scanner__hero-title">Add to your fridge</h2>
            <p className="scanner__hero-sub">Scan a product barcode or enter details manually.</p>
          </div>

          <div className="scanner__option-cards">
            <button className="scanner__option-card scanner__option-card--primary" onClick={startCamera}>
              <ScanLine size={32} />
              <strong>Scan barcode</strong>
              <span>Point your camera at a product barcode</span>
            </button>
            <button className="scanner__option-card" onClick={() => setMode('manual-barcode')}>
              <Search size={32} />
              <strong>Enter barcode</strong>
              <span>Type a barcode number to look up the product</span>
            </button>
            <button className="scanner__option-card" onClick={() => { setPrefill({}); setShowForm(true); setMode('form'); }}>
              <PencilLine size={32} />
              <strong>Add manually</strong>
              <span>Enter all product details by hand</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera scanner */}
      {mode === 'camera' && (
        <div className="scanner__camera-view">
          <div className="scanner__video-wrap">
            <video ref={videoRef} autoPlay muted playsInline className="scanner__video" />
            <div className="scanner__viewfinder">
              <div className="scanner__corner scanner__corner--tl" />
              <div className="scanner__corner scanner__corner--tr" />
              <div className="scanner__corner scanner__corner--bl" />
              <div className="scanner__corner scanner__corner--br" />
              <div className="scanner__scan-line" />
            </div>
          </div>
          <p className="scanner__camera-hint">Center the barcode within the frame</p>
          <Button variant="ghost" onClick={() => { stopCamera(); setMode('options'); }}>
            Cancel
          </Button>
        </div>
      )}

      {/* Manual barcode entry */}
      {mode === 'manual-barcode' && (
        <div className="scanner__manual">
          <div className="scanner__manual-icon">🔢</div>
          <h2 className="scanner__manual-title">Enter barcode</h2>
          <p className="scanner__manual-sub">Type the barcode number from the product packaging.</p>
          <form className="scanner__manual-form" onSubmit={handleManualBarcodeSubmit}>
            <input
              className="scanner__manual-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 0123456789012"
              value={manualBarcode}
              onChange={e => setManualBarcode(e.target.value)}
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={!manualBarcode.trim()}>
              Look up product
            </Button>
          </form>
          <button className="scanner__back" onClick={() => setMode('options')}>← Back</button>
        </div>
      )}

      {/* Lookup result */}
      {mode === 'result' && (
        <div className="scanner__result">
          {lookupState === 'loading' && (
            <div className="scanner__result-loading">
              <Loader size={36} className="scanner__spinner" />
              <p>Looking up barcode <strong>{scannedBarcode}</strong>…</p>
            </div>
          )}

          {lookupState === 'found' && (
            <div className="scanner__result-found">
              <CheckCircle size={48} className="scanner__result-icon scanner__result-icon--green" />
              <h2 className="scanner__result-title">Product found!</h2>

              <div className="scanner__product-card">
                {prefill.imageUrl && (
                  <img src={prefill.imageUrl} alt={prefill.name} className="scanner__product-img" />
                )}
                <div className="scanner__product-info">
                  <p className="scanner__product-name">{prefill.name}</p>
                  {prefill.brand && <p className="scanner__product-brand">{prefill.brand}</p>}
                  <div className="scanner__product-meta">
                    {prefill.category && (
                      <Badge variant="cookie">
                        {CATEGORIES.find(c => c.id === prefill.category)?.emoji}{' '}
                        {CATEGORIES.find(c => c.id === prefill.category)?.label}
                      </Badge>
                    )}
                    {prefill.calories && (
                      <Badge variant="default">{prefill.calories} kcal/100g</Badge>
                    )}
                    <Badge variant="default">#{scannedBarcode}</Badge>
                  </div>
                </div>
              </div>

              <p className="scanner__result-hint">Review and confirm the details below, then save to your fridge.</p>
              <Button variant="primary" size="lg" onClick={() => { setShowForm(true); setMode('form'); }}>
                Review & add to fridge →
              </Button>
              <button className="scanner__back" onClick={resetAll}>Scan another item</button>
            </div>
          )}

          {lookupState === 'not-found' && (
            <div className="scanner__result-notfound">
              <AlertCircle size={48} className="scanner__result-icon scanner__result-icon--yellow" />
              <h2 className="scanner__result-title">Product not found</h2>
              <p className="scanner__result-sub">
                Barcode <strong>{scannedBarcode}</strong> wasn't found in the database.
                You can still add it manually.
              </p>
              <div className="scanner__result-actions">
                <Button variant="primary" onClick={() => { setShowForm(true); setMode('form'); }}>
                  Add manually
                </Button>
                <Button variant="ghost" onClick={resetAll}>Try again</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual form */}
      {mode === 'form' && (
        <div className="scanner__form-page">
          <h2 className="scanner__form-title">
            {lookupState === 'found' ? '✅ Confirm product details' : '✏️ Add item manually'}
          </h2>
          {lookupState === 'found' && (
            <p className="scanner__form-hint">
              We pre-filled what we found. Review and add any missing details like expiry date.
            </p>
          )}
          <div className="scanner__form-wrap">
            <ItemForm
              initial={prefill}
              onSubmit={handleFormSubmit}
              onCancel={resetAll}
              submitLabel="Add to fridge"
            />
          </div>
        </div>
      )}

      {/* Success */}
      {mode === 'success' && added && (
        <div className="scanner__success">
          <div className="scanner__success-icon">🎉</div>
          <h2 className="scanner__success-title">Added!</h2>
          <p className="scanner__success-sub">
            <strong>{added.name}</strong> has been added to your {added.location}.
          </p>
          <div className="scanner__success-actions">
            <Button variant="primary" size="lg" onClick={resetAll}>
              Add another item
            </Button>
            <Button variant="secondary" onClick={() => navigate('/fridge')}>
              View my fridge
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
