'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Users, BarChart3, Mail, 
  Settings, Plus, Trash2, Edit3, Image as ImageIcon, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', price: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) setProducts(data);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from('subscribers').select('*');
    if (!error && data) setClients(data);
  };

  const handleDeleteProduct = async (id: string) => {
    const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer ce bijou ?");
    if (!confirm) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error("Erreur : Impossible de supprimer.");
    } else {
      toast.success("Bijou supprimé avec succès !");
      fetchProducts();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = formData.image_url;

    if (imageFile) {
      setUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images') // Assurez-vous d'avoir un bucket "images" PUBLIC dans Supabase
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error('Erreur lors du téléchargement de l\'image.');
        setUploadingImage(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const productPayload = {
      title: formData.title,
      price: parseFloat(formData.price),
      image_url: finalImageUrl
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
      if (error) toast.error('Erreur lors de la modification');
      else toast.success('Bijou modifié !');
    } else {
      const { error } = await supabase.from('products').insert([productPayload]);
      if (error) toast.error("Erreur lors de l'ajout (Vérifiez les permissions Supabase)");
      else toast.success('Nouveau bijou ajouté !');
    }
    
    setUploadingImage(false);
    setIsProductModalOpen(false);
    setImageFile(null);
    fetchProducts();
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({ title: product.title, price: product.price.toString(), image_url: product.image_url || '' });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ title: '', price: '', image_url: '' });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Veuillez vous connecter pour accéder à l\'administration.');
        router.push('/login');
      } else {
        setMounted(true);
        // Ne charge les données que si le mot de passe est validé
      }
    };
    checkAuth();
  }, [router]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Dyayly2026') {
      setIsAdminAuthenticated(true);
      toast.success('Accès Administrateur autorisé', { icon: '🔓' });
      fetchProducts();
      fetchClients();
    } else {
      toast.error('Mot de passe incorrect', { icon: '❌' });
    }
  };

  if (!mounted) return null;

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl max-w-sm w-full text-center"
        >
          <h2 className="text-3xl font-serif italic text-amber-200 mb-6">Zone Sécurisée</h2>
          <p className="text-stone-300 font-light text-sm mb-8">Veuillez entrer le mot de passe maître pour déverrouiller l'accès au tableau de bord.</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Mot de passe administrateur"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-600 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-amber-200 text-stone-900 font-medium tracking-widest uppercase text-sm rounded-xl hover:bg-amber-300 transition"
            >
              Déverrouiller
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { id: 'produits', icon: Package, label: 'Produits' },
    { id: 'clients', icon: Users, label: 'Clients & Emails' },
    { id: 'stats', icon: BarChart3, label: 'Statistiques' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800">
      
      {/* Sidebar Latérale (Style Shopify) */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-serif italic text-2xl text-stone-900">Dyayly <span className="text-xs uppercase tracking-widest text-amber-500 font-sans not-italic ml-2">Admin</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-stone-900 text-amber-100 shadow-md' 
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

      {/* Contenu Principal */}
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* ONGLET PRODUITS */}
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

              {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
                  <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
                    <h3 className="text-2xl font-serif italic mb-6 text-stone-800">{editingProduct ? 'Modifier' : 'Ajouter'} un bijou</h3>
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      <input required type="text" placeholder="Nom du bijou" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50" />
                      <input required type="number" step="0.05" placeholder="Prix (CHF)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50" />
                      
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-widest text-stone-500">Image du produit</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                            }
                          }} 
                          className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer" 
                        />
                        {formData.image_url && !imageFile && (
                          <p className="text-xs text-stone-400 truncate">Image actuelle : {formData.image_url}</p>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 text-stone-500 hover:bg-stone-100 rounded-xl transition">Annuler</button>
                        <button type="submit" disabled={uploadingImage} className="flex-1 py-3 bg-amber-200 text-stone-900 rounded-xl font-medium hover:bg-amber-300 transition disabled:opacity-50">
                          {uploadingImage ? 'Envoi...' : 'Sauvegarder'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

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
                      <tr><td colSpan={4} className="p-4 text-center text-stone-500">Aucun produit trouvé</td></tr>
                    ) : (
                      products.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-4 pl-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 overflow-hidden">
                              {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5" />}
                            </div>
                            <span className="font-medium text-stone-800">{item.title}</span>
                          </td>
                          <td className="p-4 text-stone-600">{item.price} CHF</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">En ligne</span>
                          </td>
                          <td className="p-4 pr-6 flex justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 text-stone-400 hover:text-amber-600 bg-white rounded-lg border border-stone-200 shadow-sm transition"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteProduct(item.id)} className="p-2 text-stone-400 hover:text-red-500 bg-white rounded-lg border border-stone-200 shadow-sm transition"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ONGLET NEWSLETTER */}
          {activeTab === 'newsletter' && (
            <motion.div 
              key="newsletter"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-4xl"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Campagne Email</h2>
                <p className="text-stone-500 font-light">Rédigez un mail magnifique pour tous vos clients inscrits.</p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const subject = target.subject.value;
                  const message = target.message.value;
                  
                  const toastId = toast.loading('Envoi en cours...');
                  try {
                    const res = await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subject,
                        message,
                        emails: clients.map(c => c.email)
                      })
                    });
                    
                    if (res.ok) {
                      toast.success(`Mail envoyé à ${clients.length} clients !`, { id: toastId, icon: '🚀' });
                      target.reset();
                    } else {
                      const data = await res.json();
                      throw new Error(data.error?.message || 'Erreur inconnue');
                    }
                  } catch(err: any) {
                    toast.error(err.message, { id: toastId });
                  }
                }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6"
              >
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Objet du mail</label>
                  <input name="subject" required type="text" placeholder="✨ Nouvelles créations d'Automne" className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Contenu</label>
                  <textarea name="message" required rows={8} placeholder="Rédigez votre message ici..." className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-300"></textarea>
                </div>

                <div className="flex items-center gap-4 p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 justify-center cursor-pointer hover:bg-stone-100 transition">
                  <ImageIcon className="w-6 h-6 text-stone-400" />
                  <span className="text-stone-500 font-light">Ajouter une image (bientôt dispo)</span>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-amber-200 text-stone-900 font-bold px-8 py-4 rounded-full hover:bg-amber-300 transition shadow-lg text-sm uppercase tracking-wider"
                  >
                    <Send className="w-4 h-4" /> Envoyer la campagne
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ONGLET STATISTIQUES */}
          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Statistiques</h2>
                <p className="text-stone-500 font-light">Analysez les visites et les ventes de votre boutique.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                  <h4 className="text-stone-500 text-sm uppercase tracking-widest mb-4">Total Produits</h4>
                  <p className="text-5xl font-serif text-stone-900">{products.length}</p>
                  <p className="text-green-500 text-sm mt-2 flex items-center gap-1">En boutique actuellement</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                  <h4 className="text-stone-500 text-sm uppercase tracking-widest mb-4">Membres inscrits</h4>
                  <p className="text-5xl font-serif text-amber-600">{clients.length}</p>
                  <p className="text-stone-400 text-sm mt-2 flex items-center gap-1">Prêts pour la newsletter</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                  <h4 className="text-stone-500 text-sm uppercase tracking-widest mb-4">Chiffre d'Affaires (Est.)</h4>
                  <p className="text-5xl font-serif text-stone-900">1,450 <span className="text-2xl text-stone-400">CHF</span></p>
                  <p className="text-stone-400 text-sm mt-2 flex items-center gap-1">Données à lier avec Stripe</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ONGLET CLIENTS */}
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
                      <tr><td colSpan={3} className="p-4 text-center text-stone-500">Aucun client trouvé</td></tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-4 pl-6 font-medium text-stone-800">{client.email}</td>
                          <td className="p-4 text-stone-600">{new Date(client.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                              Inscrit
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ONGLET DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-200 to-purple-300 rounded-full blur-xl mb-4" />
              <h2 className="text-4xl font-serif italic text-stone-900">Bienvenue dans votre espace, Stéfanie.</h2>
              <p className="text-stone-500 font-light max-w-lg">
                C'est ici que vous pouvez gérer toute la magie de Dyayly. Sélectionnez une catégorie dans le menu de gauche pour commencer.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}