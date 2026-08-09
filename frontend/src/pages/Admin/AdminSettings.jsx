import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Settings, Save, Loader, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    otpApiKey: '',
    otpProviderUrl: 'https://api.247otp.com/stubs/handler_api.php',
    sastaOtpApiKey: '',
    markupPercentage: '',
    minDeposit: '',
    paymentUpiId: '',
    paymentQrCode: '',
    maintenanceMode: 'false',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.admin.getSettings();
        if (res.success) {
          setSettings(prev => ({
            ...prev,
            ...res.settings
          }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (isNaN(parseFloat(settings.markupPercentage)) || parseFloat(settings.markupPercentage) < 0) {
      setError('Markup percentage must be a valid positive number');
      return;
    }

    if (isNaN(parseFloat(settings.minDeposit)) || parseFloat(settings.minDeposit) < 0) {
      setError('Minimum deposit must be a valid positive number');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.admin.updateSettings(settings);
      if (res.success) {
        setSuccess('System settings updated successfully.');
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          System Settings
        </h1>
        <p className="text-secondary">Configure markup margins, virtual number providers, UPI payment details, and maintenance mode</p>
      </div>

      {error && (
        <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="badge badge-success w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}>
          <Loader className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Settings Form */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h2 className="card-title m-b-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Core Configuration
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="siteName">Platform Display Name</label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    className="form-control"
                    value={settings.siteName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="markupPercentage">Service Sales Markup (%)</label>
                  <input
                    type="number"
                    id="markupPercentage"
                    name="markupPercentage"
                    className="form-control"
                    placeholder="e.g. 20"
                    value={settings.markupPercentage}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="minDeposit">Minimum Deposit Limit (₹)</label>
                  <input
                    type="number"
                    id="minDeposit"
                    name="minDeposit"
                    className="form-control"
                    placeholder="e.g. 10"
                    value={settings.minDeposit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maintenanceMode">System Status Mode</label>
                  <select
                    id="maintenanceMode"
                    name="maintenanceMode"
                    className="form-control"
                    value={settings.maintenanceMode}
                    onChange={handleChange}
                  >
                    <option value="false">Live (Active Operations)</option>
                    <option value="true">Maintenance Mode (Deactivated Purchases)</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="otpApiKey">OTP Service Provider API Key (247OTP / SastaOTP)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      id="otpApiKey"
                      name="otpApiKey"
                      className="form-control"
                      style={{ paddingRight: '2.5rem' }}
                      value={settings.otpApiKey || settings.sastaOtpApiKey || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings(prev => ({ ...prev, otpApiKey: val, sastaOtpApiKey: val }));
                      }}
                      placeholder="Enter 247OTP.com API Token Key (or type 'mock' for test mode)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="otpProviderUrl">OTP Provider Endpoint URL</label>
                  <input
                    type="text"
                    id="otpProviderUrl"
                    name="otpProviderUrl"
                    className="form-control"
                    placeholder="https://api.247otp.com/stubs/handler_api.php"
                    value={settings.otpProviderUrl || 'https://api.247otp.com/stubs/handler_api.php'}
                    onChange={handleChange}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSettings(prev => ({ ...prev, otpProviderUrl: 'https://api.247otp.com/stubs/handler_api.php' }))}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      ⚡ Use 247OTP.com Endpoint
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSettings(prev => ({ ...prev, otpProviderUrl: 'https://sastaotp.com/stubs/handler_api.php' }))}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      Use SastaOTP.com Endpoint
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="paymentUpiId">Gateway Deposit UPI ID</label>
                  <input
                    type="text"
                    id="paymentUpiId"
                    name="paymentUpiId"
                    className="form-control"
                    placeholder="e.g. merchant@ybl"
                    value={settings.paymentUpiId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="paymentQrCodeFile">Gateway QR Code Image</label>
                  <div className="flex gap-2 align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <input
                        type="file"
                        id="paymentQrCodeFile"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSettings(prev => ({ ...prev, paymentQrCode: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <input
                        type="text"
                        name="paymentQrCode"
                        className="form-control m-t-1"
                        placeholder="Or enter image URL / Base64 string directly..."
                        value={settings.paymentQrCode}
                        onChange={handleChange}
                      />
                    </div>
                    {settings.paymentQrCode && (
                      <div style={{ 
                        border: '1px solid var(--border-color)', 
                        padding: '0.25rem', 
                        borderRadius: 'var(--border-radius-sm)',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100px',
                        height: '100px'
                      }}>
                        <img 
                          src={settings.paymentQrCode} 
                          alt="QR Code Preview" 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader size={18} className="spinner-sm" />
                    <span>Saving configurations...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save System Config</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Config Tips */}
          <div className="card flex flex-column gap-2" style={{ justifyContent: 'center' }}>
            <h2 className="card-title flex align-center gap-1">
              <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
              <span>Admin Tips</span>
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              <b>SastaOTP Key:</b> Use <code>mock</code> as API token to simulate virtual activations, polling responses, and text messaging locally without incurring charges.
            </p>
            <p className="text-secondary" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', lineHeight: '1.4' }}>
              <b>Markup Margin:</b> Markup values dynamically modify final prices on the buying screen. (e.g. A markup of 20% increases a ₹10 original wholesale country price to a ₹12 purchase cost).
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminSettings;
