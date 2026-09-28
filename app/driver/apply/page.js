'use client';

import './driver-apply.css';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, FileText, Loader2, ShieldCheck, Truck, Upload, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const REQUIREMENTS = [
  ['id_document', 'South African ID document'],
  ['drivers_license_document', "Valid driver's licence"],
  ['vehicle_registration_document', 'Vehicle registration / licence document'],
  ['proof_of_address_document', 'Proof of address'],
];

export default function DriverApplyPage() {
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', idNumber: '', address: '', vehicleType: '', vehicleRegistration: '', driversLicenseNumber: '' });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return; }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) { window.location.href = '/signin?next=/driver/apply'; return; }
      setUser(auth.user);

      const { data: profile } = await supabase.from('profiles').select('full_name, phone, role').eq('id', auth.user.id).maybeSingle();
      if (profile) setForm((current) => ({ ...current, fullName: profile.full_name || '', phone: profile.phone || '' }));

      const { data: existing, error: existingError } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', auth.user.id)
        .maybeSingle();

      if (existingError) setError(existingError.message);
      setApplication(existing || null);
      setLoading(false);
    }
    load();
  }, []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseFile(key, file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Each document must be 8 MB or smaller.');
      return;
    }
    setFiles((current) => ({ ...current, [key]: file }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!supabase || !user) return;
    setBusy(true); setError(''); setMessage('');

    const required = REQUIREMENTS.filter(([key]) => !files[key]);
    if (required.length) {
      setError('Please upload all four required documents.');
      setBusy(false);
      return;
    }

    const safe = (value) => value.trim();
    const values = {
      full_name: safe(form.fullName),
      phone: safe(form.phone),
      id_number: safe(form.idNumber),
      address: safe(form.address),
      vehicle_type: safe(form.vehicleType),
      vehicle_registration: safe(form.vehicleRegistration),
      drivers_license_number: safe(form.driversLicenseNumber),
    };

    if (Object.values(values).some((value) => !value)) {
      setError('Please complete every required field.');
      setBusy(false);
      return;
    }

    const paths = {};
    for (const [key] of REQUIREMENTS) {
      const file = files[key];
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'bin';
      const path = user.id + '/' + key + '-' + Date.now() + '.' + extension;
      const { error: uploadError } = await supabase.storage.from('driver-documents').upload(path, file, { upsert: false });
      if (uploadError) {
        setError('Document upload failed: ' + uploadError.message);
        setBusy(false);
        return;
      }
      paths[key + '_path'] = path;
    }

    const { data: created, error: insertError } = await supabase
      .from('driver_applications')
      .insert({
        user_id: user.id,
        ...values,
        ...paths,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    setApplication(created);
    setMessage('Your driver application has been submitted for review.');
    setBusy(false);
  }

  if (loading) return <main className="driver-apply-shell"><div className="driver-apply-card">Loading driver application…</div></main>;

  if (application) {
    const pending = application.status === 'pending';
    const approved = application.status === 'approved';
    return (
      <main className="driver-apply-shell">
        <div className="driver-apply-card">
          <Link href="/home" className="driver-apply-back"><ArrowLeft size={17} /> Back to BG Smart Services</Link>
          <div className="driver-apply-icon"><Truck size={25} /></div>
          <p className="driver-apply-eyebrow">Driver application</p>
          <h1>{approved ? 'You are approved as a driver' : pending ? 'Application under review' : 'Application declined'}</h1>
          <p className="driver-apply-lead">
            {approved ? 'Your driver account has been activated. You can now use the driver dashboard.' : pending ? 'Your documents and details have been submitted. An administrator must accept or decline your application before you can deliver.' : 'Your application was not approved. Review the administrator note below before contacting BG Smart Services.'}
          </p>
          <div className="driver-apply-status"><span>{approved ? <CheckCircle2 size={18} /> : pending ? <Clock3 size={18} /> : <XCircle size={18} />}</span><strong>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</strong></div>
          {application.admin_notes && <div className="driver-apply-note"><strong>Administrator note</strong><p>{application.admin_notes}</p></div>}
          {approved && <Link className="driver-apply-primary" href="/driver">Open driver dashboard</Link>}
          <Link className="driver-apply-secondary" href="/account">My account</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="driver-apply-shell">
      <div className="driver-apply-card driver-apply-wide">
        <Link href="/home" className="driver-apply-back"><ArrowLeft size={17} /> Back to BG Smart Services</Link>
        <div className="driver-apply-icon"><ShieldCheck size={25} /></div>
        <p className="driver-apply-eyebrow">Become a BG Smart Services driver</p>
        <h1>Driver application</h1>
        <p className="driver-apply-lead">Complete the application and upload the required documents. Your account will remain a customer account until an administrator approves you.</p>

        {error && <div className="driver-apply-alert"><XCircle size={17} /> {error}</div>}
        {message && <div className="driver-apply-success"><CheckCircle2 size={17} /> {message}</div>}

        <form onSubmit={submit}>
          <section className="driver-apply-section">
            <h2>Personal details</h2>
            <div className="driver-apply-grid">
              <Field label="Full name" value={form.fullName} onChange={(v) => setField('fullName', v)} />
              <Field label="Cellphone" value={form.phone} onChange={(v) => setField('phone', v)} />
              <Field label="ID number" value={form.idNumber} onChange={(v) => setField('idNumber', v)} />
              <Field label="Residential address" value={form.address} onChange={(v) => setField('address', v)} wide />
            </div>
          </section>

          <section className="driver-apply-section">
            <h2>Driving details</h2>
            <div className="driver-apply-grid">
              <Field label="Vehicle type" placeholder="Tuk-tuk, car, motorcycle, etc." value={form.vehicleType} onChange={(v) => setField('vehicleType', v)} />
              <Field label="Vehicle registration" value={form.vehicleRegistration} onChange={(v) => setField('vehicleRegistration', v)} />
              <Field label="Driver's licence number" value={form.driversLicenseNumber} onChange={(v) => setField('driversLicenseNumber', v)} />
            </div>
          </section>

          <section className="driver-apply-section">
            <h2>Required documents</h2>
            <p className="driver-apply-help">Upload clear, readable documents. Maximum 8 MB per file. Documents are kept private and are only accessible to you and authorised administrators.</p>
            <div className="driver-apply-docs">
              {REQUIREMENTS.map(([key, label]) => (
                <label className="driver-doc" key={key}>
                  <FileText size={19} />
                  <span><strong>{label}</strong><small>{files[key]?.name || 'Choose document'}</small></span>
                  <input type="file" accept=".pdf,image/jpeg,image/png" onChange={(e) => chooseFile(key, e.target.files?.[0])} />
                  <span className="driver-doc-button"><Upload size={16} /> Upload</span>
                </label>
              ))}
            </div>
          </section>

          <div className="driver-apply-submit-row">
            <p>Submitting an application does not automatically make you a driver. BG Smart Services must review and approve it first.</p>
            <button className="driver-apply-primary" type="submit" disabled={busy}>{busy ? <><Loader2 size={17} className="driver-apply-spin" /> Submitting</> : 'Submit application'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, wide }) {
  return (
    <label className={wide ? 'driver-field wide' : 'driver-field'}>
      <span>{label}</span>
      <input required value={value} placeholder={placeholder || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
