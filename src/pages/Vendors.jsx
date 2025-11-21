import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';

const Vendors = ({ onNavigate }) => {
    const { vendors, addVendor } = usePurchase();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addVendor(formData);
        setFormData({ name: '', email: '', phone: '' });
        setShowForm(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Layout onNavigate={onNavigate} currentPath="vendors">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold">{t.vendors.title}</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? t.vendors.cancel : t.vendors.addVendor}
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg animate-fade-in">
                    <h2 className="text-lg font-bold mb-md">{t.vendors.addNew}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-3 gap-md mb-md">
                            <div className="form-group">
                                <label className="label">{t.vendors.vendorName}</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">{t.vendors.email}</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">{t.vendors.phone}</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="btn btn-primary">{t.common.save}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card p-0">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-slate-50">
                            <th className="p-md text-sm text-muted font-medium">ID</th>
                            <th className="p-md text-sm text-muted font-medium">{t.vendors.name}</th>
                            <th className="p-md text-sm text-muted font-medium">{t.vendors.email}</th>
                            <th className="p-md text-sm text-muted font-medium">{t.vendors.phone}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className="border-b last:border-0">
                                <td className="p-md font-medium">#{vendor.id}</td>
                                <td className="p-md font-bold">{vendor.name}</td>
                                <td className="p-md text-muted">{vendor.email}</td>
                                <td className="p-md text-muted">{vendor.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </Layout>
    );
};

export default Vendors;
