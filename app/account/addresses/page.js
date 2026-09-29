'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Check, Star, LoaderCircle } from 'lucide-react';

const emptyForm = {
  label: '',
  address_line: '',
  suburb: 'Eersterust',
  instructions: '',
  is_default: false,
};

export default function SavedAddresses() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAddresses(currentUser) {
    const { data, error: loadError } = await supabase
      .from('customer_addresses')
      .select('id,label,address_line,suburb,instructions,is_default,created_at')
      .eq('customer_id', currentUser.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (loadError) throw loadError;
    setAddresses(data || []);
  }

  useEffect(() => {
    let active = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      try {
        await loadAddresses(data.user);
      } catch (err) {
        if (active) setError(err.message || 'Could not load your saved addresses.');
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => { active = false; };
  }, []);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
  }

  function startEdit(address) {
    setEditingId(address.id);
    setForm({
      label: address.label || '',
      address_line: address.address_line || '',
      suburb: address.suburb || 'Eersterust',
      instructions: address.instructions || '',
      is_default: Boolean(address.is_default),
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function makeDefault(id) {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id);

      if (resetError) throw resetError;

      const { error: setErrorResult } = await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('customer_id', user.id);

      if (setErrorResult) throw setErrorResult;

      await loadAddresses(user);
      setMessage('Default delivery address updated.');
    } catch (err) {
      setError(err.message || 'Could not update the default address.');
    } finally {
      setSaving(false);
    }
  }

  async function removeAddress(id) {
    if (!user) return;
    if (!window.confirm('Delete this saved address?')) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: deleteError } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', id)
        .eq('customer_id', user.id);

      if (deleteError) throw deleteError;

      await loadAddresses(user);
      if (editingId === id) startAdd();
      setMessage('Address deleted.');
    } catch (err) {
      setError(err.message || 'Could not delete the address.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAddress(event) {
    event.preventDefault();
    if (!user) return;

    const label = form.label.trim();
    const addressLine = form.address_line.trim();

    if (!label || !addressLine) {
      setError('Please enter an address label and street address.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (form.is_default) {
        const { error: resetError } = await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', user.id);

        if (resetError) throw resetError;
      }

      const payload = {
        label,
        address_line: addressLine,
        suburb: 'Eersterust',
        instructions: form.instructions.trim() || null,
        is_default: Boolean(form.is_default),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from('customer_addresses')
          .update(payload)
          .eq('id', editingId)
          .eq('customer_id', user.id);

        if (updateError) throw updateError;
        setMessage('Address updated.');
      } else {
        const { error: insertError } = await supabase
          .from('customer_addresses')
          .insert({ ...payload, customer_id: user.id });

        if (insertError) throw insertError;
        setMessage('Address saved.');
      }

      await loadAddresses(user);
      startAdd();
    } catch (err) {
      setError(err.message || 'Could not save the address.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-shell">
          <div className="settings-card"><LoaderCircle className="spin" size={24} /></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-shell">
          <Link href="/account" className="account-back"><ArrowLeft size={17} /> Back to account</Link>
          <section className="settings-card">
            <div className="account-profile-icon"><MapPin size={30} /></div>
            <div className="eyebrow">BG Smart Services</div>
            <h1>Sign in to manage your addresses</h1>
            <p>Save your Eersterust delivery addresses for faster checkout.</p>
            <Link href="/signin" className="btn btn-primary btn-large">Sign in</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-shell">
        <Link href="/account" className="account-back"><ArrowLeft size={17} /> Back to account</Link>

        <section className="settings-hero">
          <div className="settings-hero-icon"><MapPin size={24} /></div>
          <div>
            <div className="eyebrow">Account preferences</div>
            <h1>Saved Addresses</h1>
            <p>Save and manage the addresses you use for BG Smart Services deliveries.</p>
          </div>
        </section>

        {message && <div className="settings-success"><Check size={17} /> {message}</div>}
        {error && <div className="settings-error">{error}</div>}

        <section className="settings-card">
          <div className="settings-card-head">
            <div>
              <span className="eyebrow">{editingId ? 'Edit address' : 'Add an address'}</span>
              <h2>{editingId ? 'Update delivery address' : 'New delivery address'}</h2>
            </div>
            {editingId && <button type="button" className="btn" onClick={startAdd}>Cancel</button>}
          </div>

          <form className="settings-form" onSubmit={saveAddress}>
            <div className="settings-form-grid">
              <label>
                <span>Address name</span>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home" maxLength={50} />
              </label>

              <label>
                <span>Street address</span>
                <input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} placeholder="House number and street name" maxLength={200} />
              </label>

              <label>
                <span>Area</span>
                <input value="Eersterust" readOnly />
              </label>

              <label className="settings-form-full">
                <span>Delivery instructions</span>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Gate, landmark or other instructions (optional)" rows={3} maxLength={300} />
              </label>
            </div>

            <label className="settings-checkbox">
              <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
              <span>Make this my default delivery address</span>
            </label>

            <button className="btn btn-primary btn-large" type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={18} /> : editingId ? <Check size={18} /> : <Plus size={18} />}
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save address'}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <div>
              <span className="eyebrow">Your addresses</span>
              <h2>{addresses.length ? 'Saved delivery addresses' : 'No saved addresses yet'}</h2>
            </div>
            {!editingId && (
              <button type="button" className="btn" onClick={startAdd}><Plus size={17} /> Add address</button>
            )}
          </div>

          {addresses.length ? (
            <div className="settings-address-list">
              {addresses.map((address) => (
                <article className="settings-address-row" key={address.id}>
                  <div className="settings-address-icon"><MapPin size={19} /></div>
                  <div className="settings-address-copy">
                    <div className="settings-address-title">
                      <strong>{address.label || 'Delivery address'}</strong>
                      {address.is_default && <span className="settings-default"><Star size={13} /> Default</span>}
                    </div>
                    <p>{address.address_line}</p>
                    <small>{address.suburb || 'Eersterust'}{address.instructions ? ` · ${address.instructions}` : ''}</small>
                  </div>
                  <div className="settings-address-actions">
                    {!address.is_default && <button type="button" className="icon-button" onClick={() => makeDefault(address.id)} disabled={saving} title="Make default"><Star size={17} /></button>}
                    <button type="button" className="icon-button" onClick={() => startEdit(address)} disabled={saving} title="Edit"><Pencil size={17} /></button>
                    <button type="button" className="icon-button danger" onClick={() => removeAddress(address.id)} disabled={saving} title="Delete"><Trash2 size={17} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="settings-empty">
              <MapPin size={30} />
              <p>Add your Eersterust delivery address so checkout is quicker next time.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
