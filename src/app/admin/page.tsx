'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, BarChart3, Mail,
  Settings, Plus, Trash2, Edit3, Image as ImageIcon, Send, X, Upload, Tag, ShoppingBag, Menu, FileText,
} from 'lucide-react';
import OrderCard from './OrderCard';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Variant = { label: string; value: string; price_adjustment: number };

export default function AdminDashboard() {
  // ── Global ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // ── Formulaire produit ─────────────────────────────────────
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // ── Promotions ─────────────────────────────────────────────
  const [promoCodes, setPromoCodes]       = useState<any[]>([]);
  const [promoFormCode, setPromoFormCode] = useState('');
  const [promoFormPct, setPromoFormPct]   = useState('');
  const [savingPromo, setSavingPromo]     = useState(false);

  // ── Newsletter ─────────────────────────────────────────────
  const [nlSubject, setNlSubject] = useState('');
  const [nlMessage, setNlMessage] = useState('');
  const [nlImageUrl, setNlImageUrl] = useState('');
  const [uploadingNlImage, setUploadingNlImage] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // ── Contenu du site ────────────────────────────────────────
  const [contentTitle,     setContentTitle]     = useState('');
  const [contentIntro,     setContentIntro]     = useState('');
  const [contentCard,      setContentCard]      = useState('');
  const [loadingContent,   setLoadingContent]   = useState(false);
  const [savingContent,    setSavingContent]    = useState(false);

  // ── Commandes ──────────────────────────────────────────────
  const [orders,        setOrders]        = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res  = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch {
      toast.error('Impossible de charger les commandes.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // ── Data fetching ──────────────────────────────────────────
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)');
    if (!error && data) setProducts(data);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from('subscribers').select('*');
    if (!error && data) setClients(data);
  };

  const fetchAnalytics = async () => {
    const { data, error } = await supabase.from('analytics').select('*');
    if (!error && data) setAnalytics(data);
  };

  // ── Contenu — chargement et sauvegarde ────────────────────
  const fetchContent = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setContentTitle(data.title ?? '');
        setContentIntro(data.intro_text ?? '');
        setContentCard(data.card_text ?? '');
      }
    } catch {
      toast.error('Impossible de charger le contenu.');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSaveContent = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: contentTitle, intro_text: contentIntro, card_text: contentCard }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Contenu mis à jour ! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingContent(false);
    }
  };

  // ── Commandes — chargement à l'activation de l'onglet ─────
  useEffect(() => {
    if (activeTab === 'commandes') fetchOrders();
    if (activeTab === 'contenu')   fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Auth ───────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter pour accéder à l'administration.");
        router.push('/login');
      } else {
        setMounted(true);
      }
    };
    checkAuth();
  }, [router]);

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminPassword === 'Dyayly2026') {
      setIsAdminAuthenticated(true);
      toast.success('Accès Administrateur autorisé', { icon: '🔓' });
      fetchProducts();
      fetchClients();
      fetchAnalytics();
      fetchPromoCodes();
    } else {
      toast.error('Mot de passe incorrect', { icon: '❌' });
    }
  };

  // ── Produits CRUD ──────────────────────────────────────────
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bijou ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Erreur : Impossible de supprimer.');
    else { toast.success('Bijou supprimé !'); fetchProducts(); }
  };

  const resetProductForm = () => {
    setFormTitle(''); setFormPrice(''); setFormDescription('');
    setExistingImages([]); setNewImageFiles([]); setNewImagePreviews([]);
    setVariants([]); setHasVariants(false);
    setEditingProduct(null);
  };

  const openAddModal = () => { resetProductForm(); setIsProductModalOpen(true); };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormTitle(product.title || '');
    setFormPrice(product.price?.toString() || '');
    setFormDescription(product.description || '');
    const imgs =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image_url ? [product.image_url] : [];
    setExistingImages(imgs);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    if (product.product_variants?.length > 0) {
      setHasVariants(true);
      setVariants(product.product_variants.map((v: any) => ({
        label: v.label,
        value: v.value,
        price_adjustment: v.price_adjustment || 0,
      })));
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    setIsProductModalOpen(true);
  };

  const handleNewImagesChange = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewImageFiles(prev => [...prev, ...arr]);
    setNewImagePreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (idx: number) =>
    setExistingImages(prev => prev.filter((_, i) => i !== idx));

  const removeNewImage = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      // 1. Upload des nouvelles images
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const ext = file.name.split('.').pop();
        const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('images').upload(path, file);
        if (upErr) { toast.error(`Erreur upload : ${file.name}`); continue; }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }

      // 2. Tableau d'images final
      const finalImages = [...existingImages, ...uploadedUrls];
      const primaryUrl = finalImages[0] || '';

      // 3. Sauvegarde produit
      const payload = {
        title: formTitle,
        price: parseFloat(formPrice),
        description: formDescription || null,
        images: finalImages,
        image_url: primaryUrl, // compatibilité boutique
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Bijou modifié !');
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;
        productId = data.id;
        toast.success('Nouveau bijou ajouté !');
      }

      // 4. Variantes (remplacement complet)
      if (productId) {
        await supabase.from('product_variants').delete().eq('product_id', productId);
        if (hasVariants && variants.length > 0) {
          await supabase.from('product_variants').insert(
            variants.map(v => ({ product_id: productId, ...v }))
          );
        }
      }

      setIsProductModalOpen(false);
      resetProductForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingProduct(false);
    }
  };

  // ── Variantes helpers ──────────────────────────────────────
  const addVariant = () =>
    setVariants(prev => [...prev, { label: '', value: '', price_adjustment: 0 }]);
  const removeVariant = (idx: number) =>
    setVariants(prev => prev.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: keyof Variant, val: string | number) =>
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: val } : v));

  // ── Promotions ─────────────────────────────────────────────
  const fetchPromoCodes = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPromoCodes(data);
  };

  const handleAddPromo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = promoFormCode.toUpperCase().trim();
    const pct  = parseInt(promoFormPct);
    if (!code || isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error('Code invalide ou pourcentage hors limites (1–100).');
      return;
    }
    setSavingPromo(true);
    const { error } = await supabase.from('promo_codes').insert([{ code, percentage: pct }]);
    if (error) toast.error(error.message);
    else {
      toast.success(`Code "${code}" créé !`);
      setPromoFormCode('');
      setPromoFormPct('');
      fetchPromoCodes();
    }
    setSavingPromo(false);
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (!window.confirm(`Supprimer le code "${code}" ?`)) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    toast.success('Code supprimé.');
    fetchPromoCodes();
  };

  const handleTogglePromo = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id);
    fetchPromoCodes();
  };

  // ── Newsletter ─────────────────────────────────────────────
  const handleNlImageUpload = async (file: File) => {
    setUploadingNlImage(true);
    const ext = file.name.split('.').pop();
    const path = `newsletter/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true });
    if (error) { toast.error("Erreur d'upload image"); setUploadingNlImage(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
    setNlImageUrl(publicUrl);
    toast.success('Image prête !');
    setUploadingNlImage(false);
  };

  const handleSendNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendingNewsletter(true);
    const toastId = toast.loading('Envoi en cours…');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: nlSubject,
          message: nlMessage,
          imageUrl: nlImageUrl || null,
          emails: clients.map(c => c.email),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Erreur inconnue');
      }
      toast.success(`Mail envoyé à ${clients.length} clients !`, { id: toastId, icon: '🚀' });
      setNlSubject(''); setNlMessage(''); setNlImageUrl('');
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (!mounted) return null;

  // ── Écran mot de passe admin ───────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl max-w-sm w-full text-center"
        >
          <h2 className="text-3xl font-serif italic text-amber-200 mb-6">Zone Sécurisée</h2>
          <p className="text-stone-300 font-light text-sm mb-8">
            Veuillez entrer le mot de passe maître pour déverrouiller le tableau de bord.
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe administrateur"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-600 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="w-full py-4 bg-purple-200 text-stone-900 font-medium tracking-widest uppercase text-sm rounded-xl hover:bg-purple-300 transition"
            >
              Déverrouiller
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard',   icon: LayoutDashboard, label: "Vue d'ensemble" },
    { id: 'commandes',   icon: ShoppingBag,     label: 'Commandes' },
    { id: 'produits',    icon: Package,         label: 'Produits' },
    { id: 'clients',     icon: Users,           label: 'Clients & Emails' },
    { id: 'stats',       icon: BarChart3,       label: 'Statistiques' },
    { id: 'newsletter',  icon: Mail,            label: 'Newsletter' },
    { id: 'promos',      icon: Tag,             label: 'Promotions' },
    { id: 'contenu',     icon: FileText,        label: 'Contenu du site' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800">

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h1 className="font-serif italic text-2xl text-stone-900">
            Dyayly{' '}
            <span className="text-xs uppercase tracking-widest text-purple-500 font-sans not-italic ml-2">
              Admin
            </span>
          </h1>
          <button
            className="md:hidden p-1 text-stone-400 hover:text-stone-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-stone-900 text-purple-200 shadow-md'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-stone-100">
          <button className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors w-full">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Paramètres</span>
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {/* Bouton hamburger mobile */}
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white rounded-xl border border-stone-200 shadow-sm text-stone-600 hover:text-stone-900 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif italic text-stone-800 text-lg">Dyayly Admin</span>
        </div>
        <AnimatePresence mode="wait">

          {/* ── COMMANDES ── */}
          {activeTab === 'commandes' && (
            <motion.div
              key="commandes"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900 mb-1">Commandes</h2>
                  <p className="text-stone-500 font-light">{orders.length} commande(s) au total</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition"
                >
                  ↻ Actualiser
                </button>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 text-stone-400 font-light">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-4 opacity-30" />
                  Aucune commande pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-200 to-purple-300 rounded-full blur-xl mb-4" />
              <h2 className="text-4xl font-serif italic text-stone-900">Bienvenue dans votre espace, Stefanie.</h2>
              <p className="text-stone-500 font-light max-w-lg">
                C'est ici que vous pouvez gérer toute la magie de Dyayly. Sélectionnez une catégorie dans le menu de gauche pour commencer.
              </p>
            </motion.div>
          )}

          {/* ── PRODUITS ── */}
          {activeTab === 'produits' && (
            <motion.div
              key="produits"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Gestion des Créations</h2>
                  <p className="text-stone-500 font-light">Ajoutez, modifiez ou retirez vos bijoux de la boutique.</p>
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-stone-900 text-amber-100 px-6 py-3 rounded-full hover:bg-stone-800 transition shadow-lg text-sm uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" /> Nouveau Produit
                </button>
              </div>

              {/* ── Modal produit ── */}
              <AnimatePresence>
                {isProductModalOpen && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                      className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
                        <h3 className="text-2xl font-serif italic text-stone-800">
                          {editingProduct ? 'Modifier' : 'Ajouter'} un bijou
                        </h3>
                        <button
                          onClick={() => setIsProductModalOpen(false)}
                          className="p-2 rounded-full hover:bg-stone-100 transition"
                        >
                          <X className="w-5 h-5 text-stone-400" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="p-6 space-y-6">

                        {/* Infos de base */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Nom du bijou *</label>
                            <input
                              required type="text"
                              value={formTitle} onChange={e => setFormTitle(e.target.value)}
                              className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Prix (CHF) *</label>
                            <input
                              required type="number" step="0.05" min="0"
                              value={formPrice} onChange={e => setFormPrice(e.target.value)}
                              className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Description</label>
                          <textarea
                            rows={3}
                            value={formDescription} onChange={e => setFormDescription(e.target.value)}
                            placeholder="Décrivez le bijou, ses matériaux, son intention…"
                            className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm"
                          />
                        </div>

                        {/* ── Photos multiples ── */}
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                            Photos du produit
                          </label>

                          {/* Images existantes */}
                          {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-3">
                              {existingImages.map((url, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(idx)}
                                    className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                  {idx === 0 && (
                                    <span className="absolute bottom-0 left-0 right-0 bg-amber-400/90 text-[9px] text-center text-stone-900 font-bold py-0.5">
                                      Principale
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Nouvelles images (aperçu local) */}
                          {newImagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-3">
                              {newImagePreviews.map((url, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-300 group">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                  <span className="absolute bottom-0 left-0 right-0 bg-amber-300/90 text-[9px] text-center text-stone-900 font-bold py-0.5">
                                    Nouvelle
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Zone d'upload */}
                          <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition">
                            <Upload className="w-6 h-6 text-stone-400" />
                            <span className="text-sm text-stone-500 font-light">Cliquer pour ajouter des photos</span>
                            <span className="text-xs text-stone-400">JPG, PNG, WEBP — sélection multiple autorisée</span>
                            <input
                              type="file" accept="image/*" multiple className="hidden"
                              onChange={e => handleNewImagesChange(e.target.files)}
                            />
                          </label>
                        </div>

                        {/* ── Variantes ── */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-xs uppercase tracking-widest text-stone-500">
                              Variantes (Couleurs, Tailles…)
                            </label>
                            {/* Toggle switch */}
                            <button
                              type="button"
                              onClick={() => setHasVariants(v => !v)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${hasVariants ? 'bg-amber-400' : 'bg-stone-300'}`}
                            >
                              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${hasVariants ? 'left-6' : 'left-1'}`} />
                            </button>
                          </div>

                          {hasVariants && (
                            <div className="space-y-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                              {variants.length === 0 && (
                                <p className="text-xs text-stone-400 text-center py-2">Aucune variante. Cliquez sur "+ Ajouter".</p>
                              )}
                              {variants.map((v, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    placeholder="Type (ex : Couleur)"
                                    value={v.label}
                                    onChange={e => updateVariant(idx, 'label', e.target.value)}
                                    className="flex-1 p-2.5 border border-stone-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                  />
                                  <input
                                    placeholder="Valeur (ex : Turquoise)"
                                    value={v.value}
                                    onChange={e => updateVariant(idx, 'value', e.target.value)}
                                    className="flex-1 p-2.5 border border-stone-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                  />
                                  <input
                                    type="number" placeholder="+CHF"
                                    value={v.price_adjustment}
                                    onChange={e => updateVariant(idx, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                    className="w-20 p-2.5 border border-stone-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                  />
                                  <button type="button" onClick={() => removeVariant(idx)}
                                    className="p-2 text-stone-400 hover:text-red-500 transition shrink-0">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button" onClick={addVariant}
                                className="text-xs text-purple-500 hover:text-amber-700 flex items-center gap-1 font-medium pt-1"
                              >
                                <Plus className="w-3 h-3" /> Ajouter une variante
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsProductModalOpen(false)}
                            className="flex-1 py-3 text-stone-500 hover:bg-stone-100 rounded-xl transition"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit" disabled={savingProduct}
                            className="flex-1 py-3 bg-purple-200 text-stone-900 rounded-xl font-medium hover:bg-purple-300 transition disabled:opacity-50"
                          >
                            {savingProduct ? 'Sauvegarde…' : 'Sauvegarder'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Table des produits */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6 font-medium">Produit</th>
                      <th className="p-4 font-medium">Prix (CHF)</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 text-right pr-6 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-stone-500">Aucun produit trouvé</td>
                      </tr>
                    ) : products.map(item => {
                      const thumb =
                        (Array.isArray(item.images) && item.images[0]) || item.image_url || null;
                      return (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden flex items-center justify-center text-stone-400 shrink-0">
                                {thumb
                                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                  : <ImageIcon className="w-5 h-5" />
                                }
                              </div>
                              <div>
                                <span className="font-medium text-stone-800 block">{item.title}</span>
                                {item.product_variants?.length > 0 && (
                                  <span className="text-xs text-purple-500">
                                    {item.product_variants.length} variante(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-stone-600">{item.price} CHF</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">En ligne</span>
                          </td>
                          <td className="p-4 pr-6">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEditModal(item)}
                                className="p-2 text-stone-400 hover:text-purple-500 bg-white rounded-lg border border-stone-200 shadow-sm transition">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(item.id)}
                                className="p-2 text-stone-400 hover:text-red-500 bg-white rounded-lg border border-stone-200 shadow-sm transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── NEWSLETTER ── */}
          {activeTab === 'newsletter' && (
            <motion.div
              key="newsletter"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-4xl"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Campagne Email</h2>
                <p className="text-stone-500 font-light">
                  Rédigez un mail pour vos {clients.length} clients inscrits.
                </p>
              </div>

              <form onSubmit={handleSendNewsletter} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Objet du mail</label>
                  <input
                    required type="text"
                    value={nlSubject} onChange={e => setNlSubject(e.target.value)}
                    placeholder="✨ Nouvelles créations d'Automne"
                    className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Contenu du message</label>
                  <textarea
                    required rows={8}
                    value={nlMessage} onChange={e => setNlMessage(e.target.value)}
                    placeholder="Rédigez votre message ici…"
                    className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                {/* ── Upload image newsletter ── */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                    Image dans l'email (optionnel)
                  </label>

                  {nlImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <img
                          src={nlImageUrl} alt="Aperçu newsletter"
                          className="max-h-48 rounded-2xl border border-stone-200 object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setNlImageUrl('')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-green-600 font-medium">✓ Image prête — sera intégrée dans le mail</p>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition ${uploadingNlImage ? 'opacity-60 cursor-wait' : ''}`}>
                      {uploadingNlImage ? (
                        <>
                          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-stone-500">Téléchargement…</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-stone-400" />
                          <span className="text-stone-500 font-light">Cliquer pour uploader une image</span>
                          <span className="text-xs text-stone-400">Elle sera stockée sur Supabase et intégrée dans le mail</span>
                        </>
                      )}
                      <input
                        type="file" accept="image/*" className="hidden"
                        disabled={uploadingNlImage}
                        onChange={e => { if (e.target.files?.[0]) handleNlImageUpload(e.target.files[0]); }}
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-stone-400">
                    Envoi à <strong className="text-stone-600">{clients.length} destinataire(s)</strong>
                  </p>
                  <button
                    type="submit" disabled={sendingNewsletter}
                    className="flex items-center gap-2 bg-purple-200 text-stone-900 font-bold px-8 py-4 rounded-full hover:bg-purple-300 transition shadow-lg text-sm uppercase tracking-wider disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {sendingNewsletter ? 'Envoi…' : 'Envoyer la campagne'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── STATISTIQUES ── */}
          {activeTab === 'stats' && (() => {
            const analyticsByDate = analytics.reduce((acc: any, event) => {
              const date = new Date(event.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
              if (!acc[date]) acc[date] = { name: date, Visites: 0, Paniers: 0, Commandes: 0 };
              if (event.event_type === 'visit')     acc[date].Visites   += 1;
              if (event.event_type === 'cart_add')  acc[date].Paniers   += 1;
              if (event.event_type === 'order')     acc[date].Commandes += 1;
              return acc;
            }, {});

            const chartData = Object.values(analyticsByDate)
              .sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name))
              .slice(-10);

            const totalVisits  = analytics.filter(e => e.event_type === 'visit').length;
            const totalCarts   = analytics.filter(e => e.event_type === 'cart_add').length;
            const totalOrders  = analytics.filter(e => e.event_type === 'order').length;
            const estimatedCA  = totalOrders * 75;

            return (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Statistiques de Trafic</h2>
                  <p className="text-stone-500 font-light">Analyse des visites et comportements d'achat.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Visiteurs Totaux',   value: totalVisits,  color: 'text-stone-900' },
                    { label: 'Mises au panier',     value: totalCarts,   color: 'text-purple-600' },
                    { label: 'Commandes',           value: totalOrders,  color: 'text-green-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                      <h4 className="text-stone-500 text-xs uppercase tracking-widest mb-4">{label}</h4>
                      <p className={`text-4xl font-serif ${color}`}>{value}</p>
                    </div>
                  ))}
                  <div className="bg-amber-50 p-8 rounded-3xl shadow-sm border border-amber-200">
                    <h4 className="text-amber-800 text-xs uppercase tracking-widest mb-4">Chiffre d'Affaires</h4>
                    <p className="text-4xl font-serif text-purple-500">{estimatedCA} <span className="text-xl">CHF</span></p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                  <h4 className="text-stone-800 text-lg font-serif italic mb-6">Trafic et Conversions (10 derniers jours)</h4>
                  <div className="h-72 w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d8b4fe" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#d8b4fe" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPaniers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" name="Visiteurs"    dataKey="Visites" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorVisites)" />
                          <Area type="monotone" name="Ajouts Panier" dataKey="Paniers" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorPaniers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col h-full items-center justify-center text-stone-400 font-light gap-2">
                        <BarChart3 className="w-8 h-8 opacity-50" />
                        Exécutez update_supabase.sql pour générer la table analytics
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── CLIENTS ── */}
          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Liste des Clients</h2>
                  <p className="text-stone-500 font-light">Base de données des inscrits (Ateliers et Commandes).</p>
                </div>
                <button className="text-stone-500 hover:text-stone-900 underline text-sm transition">
                  Exporter en CSV
                </button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6 font-medium">Email</th>
                      <th className="p-4 font-medium">Inscription</th>
                      <th className="p-4 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-stone-500">Aucun client trouvé</td>
                      </tr>
                    ) : clients.map(client => (
                      <tr key={client.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6 font-medium text-stone-800">{client.email}</td>
                        <td className="p-4 text-stone-600">{new Date(client.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700">Inscrit</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── PROMOTIONS ── */}
          {activeTab === 'promos' && (
            <motion.div
              key="promos"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-3xl"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Codes Promotionnels</h2>
                <p className="text-stone-500 font-light">Créez et gérez vos codes de réduction.</p>
              </div>

              {/* Formulaire ajout */}
              <form
                onSubmit={handleAddPromo}
                className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200"
              >
                <h3 className="text-lg font-serif italic text-stone-800 mb-4">Nouveau code promo</h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Code</label>
                    <input
                      required
                      type="text"
                      placeholder="ex : ETE2026"
                      value={promoFormCode}
                      onChange={e => setPromoFormCode(e.target.value.toUpperCase())}
                      className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono uppercase"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Réduction %</label>
                    <input
                      required
                      type="number"
                      min="1" max="100"
                      placeholder="15"
                      value={promoFormPct}
                      onChange={e => setPromoFormPct(e.target.value)}
                      className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPromo}
                    className="flex items-center gap-2 bg-stone-900 text-amber-100 px-5 py-3 rounded-xl hover:bg-stone-800 transition text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Créer
                  </button>
                </div>
              </form>

              {/* Liste des codes */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6 font-medium">Code</th>
                      <th className="p-4 font-medium">Réduction</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 font-medium">Créé le</th>
                      <th className="p-4 text-right pr-6 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-stone-400 font-light">
                          Aucun code promo créé
                        </td>
                      </tr>
                    ) : promoCodes.map(promo => (
                      <tr key={promo.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6">
                          <span className="font-mono font-bold text-stone-800 bg-amber-50 px-3 py-1 rounded-lg text-sm border border-amber-200">
                            {promo.code}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-lg font-serif text-amber-700">−{promo.percentage}%</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                              promo.is_active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {promo.is_active ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="p-4 text-stone-500 text-sm">
                          {new Date(promo.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleDeletePromo(promo.id, promo.code)}
                            className="p-2 text-stone-400 hover:text-red-500 bg-white rounded-lg border border-stone-200 shadow-sm transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── CONTENU DU SITE ── */}
          {activeTab === 'contenu' && (
            <motion.div
              key="contenu"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-3xl"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Contenu du site</h2>
                <p className="text-stone-500 font-light">Modifiez les textes de la page "Histoire" visibles par vos visiteurs.</p>
              </div>

              {loadingContent ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSaveContent} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                      Titre principal
                    </label>
                    <input
                      type="text"
                      required
                      value={contentTitle}
                      onChange={e => setContentTitle(e.target.value)}
                      placeholder="De l'ombre à la lumière"
                      className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300 font-serif italic text-stone-800"
                    />
                    <p className="text-xs text-stone-400 mt-1.5">Le grand titre affiché en haut de la page.</p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                      Texte d'introduction
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contentIntro}
                      onChange={e => setContentIntro(e.target.value)}
                      placeholder="DYAYLY est né d'un moment de vie…"
                      className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm"
                    />
                    <p className="text-xs text-stone-400 mt-1.5">Apparaît entre guillemets sous le titre.</p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                      Texte de la carte centrale
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={contentCard}
                      onChange={e => setContentCard(e.target.value)}
                      placeholder="L'amour tissé à travers les initiales de mes trois enfants…"
                      className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm"
                    />
                    <p className="text-xs text-stone-400 mt-1.5">Le texte principal de la carte en verre. Vous pouvez sauter des lignes pour créer des paragraphes.</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingContent}
                      className="flex items-center gap-2 bg-purple-200 text-stone-900 font-bold px-8 py-4 rounded-full hover:bg-purple-300 transition shadow-lg text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      {savingContent ? 'Sauvegarde…' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
