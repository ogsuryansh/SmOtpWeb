import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Globe, Loader, ShoppingBag, ShieldCheck, Search, ChevronDown, X } from 'lucide-react';
import { COUNTRY_NAME_TO_INFO } from '../../utils/countryMap';

// ── Convert any flag value to emoji ──────────────────────────────────────────
// Handles: 2-letter ISO string ("RU" → 🇷🇺), existing emoji, dial code fallback
const toFlagEmoji = (val) => {
  if (!val) return '🌐';
  const s = String(val).trim();
  // Already an emoji (non-ASCII, longer than 2 chars in codepoints)
  if ([...s].length > 2) return s;
  // 2-letter ISO code → Unicode regional indicators
  if (/^[A-Za-z]{2}$/.test(s)) {
    return s.toUpperCase().split('').map(c =>
      String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
  }
  return '🌐';
};

// ── SMS-Activate Country ID to Dial Code & Correct Flag Emoji Fallback ────────
const SMS_ACTIVATE_FALLBACKS = {
  '22': { dialCode: '91', flag: '🇮🇳' },
  '187': { dialCode: '1', flag: '🇺🇸' },
  '16': { dialCode: '44', flag: '🇬🇧' },
  '0': { dialCode: '7', flag: '🇷🇺' },
  '6': { dialCode: '62', flag: '🇮🇩' },
  '91': { dialCode: '670', flag: '🇹🇱' }
};

// ── Searchable Dropdown ───────────────────────────────────────────────────────
const SearchableDropdown = ({ id, options, value, onChange, placeholder, icon: Icon, renderLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const triggerStyle = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.65rem 1rem',
    background: 'var(--bg-secondary)',
    border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border-color)'}`,
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer', userSelect: 'none', minHeight: '44px',
    transition: 'border-color 0.2s',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div id={id} onClick={() => { setIsOpen(o => !o); setSearch(''); setTimeout(() => inputRef.current?.focus(), 60); }} style={triggerStyle}>
        {Icon && <Icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
          {selected ? (renderLabel ? renderLabel(selected) : selected.label)
            : <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
          background: 'var(--bg-secondary)', border: '1px solid var(--primary)',
          borderRadius: 'var(--border-radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          overflow: 'hidden', animation: 'ddFade 0.15s ease',
        }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }} />
            {search && <X size={13} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
          </div>

          {/* Options */}
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results</div>
              : filtered.map(opt => {
                const active = opt.value === value;
                return (
                  <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.9rem',
                      cursor: 'pointer', fontSize: '0.875rem',
                      background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-primary)',
                      borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {opt.icon && <span style={{ fontSize: '1.15rem', lineHeight: 1, flexShrink: 0 }}>{opt.icon}</span>}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</div>
                      {opt.subLabel && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{opt.subLabel}</div>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const BuyOtp = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [rawServices, setRawServices] = useState({});
  const [selectedService, setSelectedService] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('22');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [multiSms, setMultiSms] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await api.otp.getServices();
        if (res.success) {
          setRawServices(res.services || {});
          setIsMock(res.isMock || false);
          const keys = Object.keys(res.services || {});
          if (keys.length > 0) setSelectedService(keys[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Fetch countries and prices for selected service dynamically
  useEffect(() => {
    if (!selectedService || isMock) return;

    let isMounted = true;
    (async () => {
      try {
        setCountriesLoading(true);
        const res = await api.otp.getServices(selectedService);
        if (res.success && res.services[selectedService] && isMounted) {
          setRawServices(prev => ({
            ...prev,
            [selectedService]: res.services[selectedService]
          }));
        }
      } catch (err) {
        console.error('Failed to load country prices for service:', selectedService, err);
      } finally {
        if (isMounted) {
          setCountriesLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedService, isMock]);

  // ── Build service options ─────────────────────────────────────────────────
  const serviceOptions = Object.entries(rawServices).map(([code, srv]) => ({
    value: code,
    label: typeof srv === 'object' ? (srv.name || code) : code,
    subLabel: code.toUpperCase(),
  }));

  // ── Build country options FROM selected service's countries array ──────────
  // This ensures country_code values match what the buy API / price lookup needs
  const serviceCountries = rawServices[selectedService]?.countries || [];
  const countryOptions = serviceCountries.map(c => {
    const code = String(c.country_code || c.code || '');
    const name = c.country_name || c.name || c.eng || code;
    
    // 1. Try name-based mapping
    const cleanName = name.trim().toLowerCase();
    const mappedByName = COUNTRY_NAME_TO_INFO[cleanName];

    // 2. Try ID-based fallback mapping
    const mappedById = SMS_ACTIVATE_FALLBACKS[code];

    const dialCode = mappedByName ? mappedByName.dialCode : (mappedById ? mappedById.dialCode : code);
    const flag = mappedByName ? mappedByName.flag : (mappedById ? mappedById.flag : (toFlagEmoji(c.flag) || '🌐'));

    return {
      value: code,
      label: name,
      subLabel: `+${dialCode}`,
      icon: flag,
      qty: c.qty ?? null,
      price: c.price ?? null,
    };
  });

  // Auto-select first available country when service or countries change
  useEffect(() => {
    if (countryOptions.length === 0) return;
    const isValid = countryOptions.some(o => o.value === selectedCountry);
    if (isValid) return;
    const hasIndia = countryOptions.find(o => o.value === '22' || o.label.toLowerCase() === 'india');
    setSelectedCountry(hasIndia ? hasIndia.value : countryOptions[0].value);
  }, [selectedService, countryOptions, selectedCountry]);

  // ── Price / availability lookup ───────────────────────────────────────────
  const details = useCallback(() => {
    if (!selectedService || !rawServices[selectedService]) return null;
    const srv = rawServices[selectedService];
    const c = (srv.countries || []).find(c => String(c.country_code || c.code) === String(selectedCountry));
    if (!c) return null;
    return {
      price: c.price ?? null,
      qty: c.qty ?? 0,
      available: (c.qty ?? 0) > 0,
    };
  }, [selectedService, selectedCountry, rawServices])();

  const handlePurchase = async () => {
    setError('');
    if (!selectedService) { setError('Please select a service.'); return; }
    if (!details?.price) { setError('Service not available in this country.'); return; }
    if (!details.available) { setError('Out of stock. Try another country.'); return; }
    if (user.balance < details.price) { setError('Insufficient balance. Please deposit funds.'); return; }
    try {
      setIsPurchasing(true);
      const res = await api.otp.buyNumber(selectedService, selectedCountry, multiSms);
      if (res.success) { refreshUser(); navigate('/dashboard'); }
    } catch (err) {
      setError(err.message || 'Purchase failed. Try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes ddFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .fav-card:hover { transform: translateY(-2px); border-color: var(--primary) !important; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25) !important; }
      `}</style>

      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Purchase Virtual Number</h1>
        <p className="text-secondary">Choose your target application and country to reserve a verification number</p>
      </div>

      {isMock && (
        <div className="badge badge-primary w-full m-b-2" style={{ padding: '0.75rem 1.25rem', textTransform: 'none', borderRadius: 'var(--border-radius-sm)', display: 'block', fontSize: '0.85rem' }}>
          💡 <b>Simulation Mode:</b> Running on mock data — numbers & OTPs are auto-generated for testing.
        </div>
      )}

      {/* ── Quick Purchase Process Guidelines ──────────────────────────────────── */}
      <div className="card m-b-2" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} className="text-primary" />
          <span>Quick Purchase Process</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { step: '1', title: 'Select a Service', desc: 'Choose the application you need verification for (e.g. WhatsApp, Telegram).' },
            { step: '2', title: 'Pick a Country', desc: 'Select your target country. India is selected by default for quick access.' },
            { step: '3', title: 'Reserve & Receive', desc: 'Click Buy. The number is reserved instantly and starts waiting for SMS.' },
            { step: '4', title: 'Copy & Verify', desc: 'Copy the phone number, paste it in the app, and wait for your OTP code.' }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: 'var(--bg-primary)', 
              padding: '1.25rem 1rem 1rem 1rem', 
              borderRadius: 'var(--border-radius-sm)', 
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <span style={{ 
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--primary)', color: 'white', fontWeight: 800,
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}>{item.step}</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem', marginBottom: '0.3rem', textAlign: 'center' }}>{item.title}</h4>
              <p className="text-secondary" style={{ fontSize: '0.78rem', lineHeight: 1.4, textAlign: 'center' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}><Loader className="spinner" /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Purchase Card */}
            <div className="card" style={{ overflow: 'visible' }}>
              <h2 className="card-title">Select Service &amp; Country</h2>

              {error && (
                <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>{error}</div>
              )}

              <div className="form-group">
                <label className="form-label">1. Target Application</label>
                <SearchableDropdown
                  id="service-dd" options={serviceOptions} value={selectedService} onChange={setSelectedService}
                  placeholder="Select a service..." icon={Smartphone}
                  renderLabel={opt => (
                    <span><b>{opt.label}</b><span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.8rem' }}>({opt.subLabel})</span></span>
                  )}
                />
              </div>

              <div className="form-group">
                <label className="form-label">2. Target Country</label>
                {countriesLoading ? (
                  <div className="flex align-center gap-2 text-secondary" style={{ fontSize: '0.9rem', minHeight: '44px' }}>
                    <Loader size={16} className="spinner" />
                    <span>Loading countries &amp; prices...</span>
                  </div>
                ) : countryOptions.length === 0 ? (
                  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No countries available for this service.</p>
                ) : (
                  <SearchableDropdown
                    id="country-dd" options={countryOptions} value={selectedCountry} onChange={setSelectedCountry}
                    placeholder="Select a country..." icon={Globe}
                    renderLabel={opt => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>{opt.icon}</span>
                        <b>{opt.label}</b>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({opt.subLabel})</span>
                      </span>
                    )}
                  />
                )}
              </div>
 
              <div className="form-group">
                <label className="form-label">3. Verification OTP Mode</label>
                <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.15rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  Multi-OTP allows receiving multiple SMS verification codes on the same number.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                  <button 
                    type="button"
                    className={`btn ${!multiSms ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer' }}
                    onClick={() => setMultiSms(false)}
                  >
                    Single OTP Only
                  </button>
                  <button 
                    type="button"
                    className={`btn ${multiSms ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer' }}
                    onClick={() => setMultiSms(true)}
                  >
                    Multi OTP (Re-use)
                  </button>
                </div>
              </div>

              {details && (
                <div className="flex flex-column gap-2 m-t-2" style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between align-center">
                    <span className="text-secondary" style={{ fontWeight: 500 }}>Price</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                      {details.price != null ? `₹${details.price.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between align-center">
                    <span className="text-secondary" style={{ fontWeight: 500 }}>Availability</span>
                    <span className={`badge ${details.available ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>
                      {details.qty} numbers left
                    </span>
                  </div>
                </div>
              )}

              {details && user && user.balance < details.price && (
                <div className="badge badge-warning w-full m-t-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none', lineHeight: 1.4 }}>
                  ⚠️ Balance ₹{user.balance.toFixed(2)} is insufficient for this purchase.
                </div>
              )}

              <button onClick={handlePurchase} className="btn btn-primary w-full m-t-2"
                disabled={isPurchasing || !details || !details.available || (user && user.balance < details?.price)}>
                {isPurchasing
                  ? <><Loader size={18} className="spinner-sm" /><span>Reserving...</span></>
                  : <><ShoppingBag size={18} /><span>Buy Number</span></>}
              </button>
            </div>

            {/* Protection Card */}
            <div className="card flex flex-column gap-2" style={{ justifyContent: 'center' }}>
              <h2 className="card-title">Purchase Protection</h2>
              <div className="flex gap-2">
                <div className="stat-icon success" style={{ minWidth: 40, width: 40, height: 40 }}><ShieldCheck size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>100% Automatic Refund</h4>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    If no SMS arrives within 20 minutes, the number is auto-cancelled and funds are returned to your wallet.
                  </p>
                </div>
              </div>
              <div className="flex gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div className="stat-icon primary" style={{ minWidth: 40, width: 40, height: 40 }}><Smartphone size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Manual Cancellation</h4>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Hit Cancel on your dashboard anytime to instantly release the number and reclaim your balance.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ── Customer Favorites Quick Grid ────────────────────────────────────── */}
          <div className="card m-t-2" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} className="text-primary" />
              <span>Customer Favorites</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {[
                { service: 'wa', name: 'WhatsApp', countryCode: '22', countryName: 'India', flag: '🇮🇳', dial: '+91' },
                { service: 'tg', name: 'Telegram', countryCode: '22', countryName: 'India', flag: '🇮🇳', dial: '+91' },
                { service: 'go', name: 'Google / Gmail', countryCode: '22', countryName: 'India', flag: '🇮🇳', dial: '+91' },
                { service: 'tg', name: 'Telegram', countryCode: '187', countryName: 'USA', flag: '🇺🇸', dial: '+1' }
              ].map((fav, idx) => {
                const isSelected = selectedService === fav.service && selectedCountry === fav.countryCode;
                return (
                  <div 
                    key={idx} 
                    className="fav-card"
                    onClick={() => {
                      setSelectedService(fav.service);
                      setSelectedCountry(fav.countryCode);
                    }}
                    style={{ 
                      background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)', 
                      padding: '1.25rem', 
                      borderRadius: 'var(--border-radius-md)', 
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {fav.name}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>{fav.flag}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fav.countryName}</span>
                      <span className="text-secondary" style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>Dial Code: {fav.dial}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isSelected ? 600 : 400 }}>
                        {isSelected ? '✓ Selected' : 'Quick Buy'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyOtp;
