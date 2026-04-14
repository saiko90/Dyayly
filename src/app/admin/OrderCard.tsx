'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Truck, Ban, CheckCircle2, Clock } from 'lucide-react';

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  paid:      { label: '✅ Payé — À expédier !', bg: 'bg-green-100',  text: 'text-green-800',  icon: <CheckCircle2 className="w-4 h-4" /> },
  shipped:   { label: '📦 Expédié',             bg: 'bg-blue-100',   text: 'text-blue-800',   icon: <Truck className="w-4 h-4" /> },
  cancelled: { label: '❌ Annulé',              bg: 'bg-red-100',    text: 'text-red-800',    icon: <Ban className="w-4 h-4" /> },
  pending:   { label: '⏳ En attente',           bg: 'bg-stone-100',  text: 'text-stone-500',  icon: <Clock className="w-4 h-4" /> },
};

interface OrderCardProps {
  order: any;
  onStatusChange: (id: string, status: string) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [busy, setBusy] = useState(false);

  const cfg     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
  const ref     = String(order.id).slice(0, 6).toUpperCase();
  const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const items: any[] = order.items ?? [];

  const handleAction = async (status: string, successMsg: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: order.id, status }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(order.id, status);
      toast.success(successMsg);
    } catch {
      toast.error('Erreur lors de la mise à jour. Réessayez.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-stone-100">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg">
            #{ref}
          </span>
          <span className="text-sm text-stone-500">{dateStr}</span>
        </div>
        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Corps */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Client */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Client</p>
          <p className="font-medium text-stone-800 text-sm truncate">{order.full_name || '—'}</p>
          <p className="text-stone-500 text-xs truncate">{order.user_email}</p>
          {order.city && (
            <p className="text-stone-400 text-xs">{order.city}{order.country ? ` · ${order.country}` : ''}</p>
          )}
        </div>

        {/* Articles */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Articles</p>
          <ul className="space-y-0.5">
            {items.slice(0, 3).map((item: any, i: number) => (
              <li key={i} className="text-xs text-stone-600">
                {item.quantity}× {item.title}
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                  <span className="text-stone-400 ml-1">
                    ({Object.values(item.selectedVariants).join(', ')})
                  </span>
                )}
              </li>
            ))}
            {items.length > 3 && (
              <li className="text-xs text-stone-400">+ {items.length - 3} autre(s)…</li>
            )}
          </ul>
        </div>

        {/* Totaux */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Total</p>
          <p className="text-xl font-serif text-stone-900">{Number(order.total_price).toFixed(2)} CHF</p>
          {order.promo_code && (
            <p className="text-xs text-amber-700 mt-0.5">
              🎟️ Code : <span className="font-mono font-semibold">{order.promo_code}</span>
              {order.discount_amount > 0 && ` (−${Number(order.discount_amount).toFixed(2)} CHF)`}
            </p>
          )}
          {Number(order.shipping_cost) === 0 && (
            <p className="text-xs text-green-600 mt-0.5">✓ Livraison gratuite</p>
          )}
        </div>
      </div>

      {/* Note client */}
      {order.customer_note && (
        <div className="px-6 pb-3">
          <p className="text-xs text-stone-500 italic bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            💬 &ldquo;{order.customer_note}&rdquo;
          </p>
        </div>
      )}

      {/* Actions — uniquement pour les commandes payées */}
      {order.status === 'paid' && (
        <div className="px-4 sm:px-6 py-4 bg-green-50 border-t border-green-100 flex flex-col sm:flex-row flex-wrap gap-3">
          <p className="w-full text-xs text-green-700 font-medium mb-1">
            ✅ Paiement confirmé — que faire de cette commande ?
          </p>
          <button
            onClick={() => handleAction('shipped', `📦 Commande #${ref} marquée comme expédiée !`)}
            disabled={busy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Truck className="w-4 h-4" />
            {busy ? 'En cours…' : 'Marquer comme Expédié 📦'}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Annuler la commande #${ref} ? Cette action est définitive.`)) {
                handleAction('cancelled', `Commande #${ref} annulée.`);
              }
            }}
            disabled={busy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban className="w-4 h-4" />
            Annuler la commande
          </button>
        </div>
      )}
    </div>
  );
}
