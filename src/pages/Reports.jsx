import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = ({ onNavigate }) => {
    const { requests, vendors, users } = usePurchase();

    // Filters State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');

    // Filtered Requests
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            // Date Filter
            if (startDate) {
                const reqDate = new Date(req.createdAt);
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (reqDate < start) return false;
            }
            if (endDate) {
                const reqDate = new Date(req.createdAt);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (reqDate > end) return false;
            }

            // User Filter
            if (selectedUser !== 'all' && req.userId !== selectedUser) {
                return false;
            }

            return true;
        });
    }, [requests, startDate, endDate, selectedUser]);

    // --- KPI Calculations ---
    const kpis = useMemo(() => {
        const purchasedRequests = filteredRequests.filter(r => r.status === 'purchased');
        const totalSpent = purchasedRequests.reduce((sum, r) => sum + r.amount, 0);

        const approvedCount = filteredRequests.filter(r => r.status === 'approved' || r.status === 'purchased').length;
        const rejectedCount = filteredRequests.filter(r => r.status === 'rejected').length;
        const totalDecided = approvedCount + rejectedCount;
        const approvalRate = totalDecided > 0 ? (approvedCount / totalDecided) * 100 : 0;

        const avgApprovalTime = "2.5 dias"; // Placeholder

        return {
            totalSpent,
            approvalRate: approvalRate.toFixed(1),
            avgApprovalTime,
            totalRequests: filteredRequests.length
        };
    }, [filteredRequests]);

    // --- Chart Data Preparation ---

    // 1. Spend by Department
    const departmentData = useMemo(() => {
        const deptMap = {};
        filteredRequests.forEach(r => {
            if (r.status === 'purchased' || r.status === 'approved') {
                const dept = r.department || 'Outros';
                deptMap[dept] = (deptMap[dept] || 0) + r.amount;
            }
        });
        return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
    }, [filteredRequests]);

    // 2. Request Status Distribution
    const statusData = useMemo(() => {
        const statusMap = {
            open: 0,
            pending: 0,
            approved: 0,
            purchased: 0,
            rejected: 0
        };
        filteredRequests.forEach(r => {
            if (statusMap[r.status] !== undefined) {
                statusMap[r.status]++;
            }
        });
        return Object.entries(statusMap).map(([name, value]) => ({
            name: t.status[name] || name,
            value,
            key: name
        }));
    }, [filteredRequests]);

    // 3. Monthly Spend Trend
    const trendData = useMemo(() => {
        const months = {};
        const today = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            months[key] = 0;
        }

        filteredRequests.forEach(r => {
            if (r.status === 'purchased') {
                const d = new Date(r.createdAt);
                const key = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
                if (months[key] !== undefined) {
                    months[key] += r.amount;
                }
            }
        });

        return Object.entries(months).map(([name, amount]) => ({ name, amount }));
    }, [filteredRequests]);

    // 4. Top Vendors
    const topVendorsData = useMemo(() => {
        const vendorMap = {};
        filteredRequests.forEach(r => {
            if (r.status === 'purchased' && r.items) {
                r.items.forEach(item => {
                    if (item.vendor) {
                        const vendorName = vendors.find(v => v.id === item.vendor)?.name || item.vendor;
                        vendorMap[vendorName] = (vendorMap[vendorName] || 0) + item.total;
                    }
                });
            }
        });
        return Object.entries(vendorMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredRequests, vendors]);

    const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <Layout onNavigate={onNavigate} currentPath="reports">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-lg">
                    <h1 className="text-2xl font-bold">Relatórios Gerenciais</h1>
                </div>

                {/* Filters */}
                <div className="card p-md mb-lg bg-white">
                    <div className="flex flex-wrap gap-md items-end">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-xs">Data Início</label>
                            <input
                                type="date"
                                className="input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-xs">Data Fim</label>
                            <input
                                type="date"
                                className="input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-xs">Usuário</label>
                            <select
                                className="input"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="all">Todos os Usuários</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        {(startDate || endDate || selectedUser !== 'all') && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setSelectedUser('all');
                                }}
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid-4 gap-md mb-xl">
                    <div className="card p-lg bg-white border-l-4 border-primary">
                        <div className="text-muted text-sm font-medium mb-xs">Total Gasto (Aprovado)</div>
                        <div className="text-2xl font-bold text-dark">{formatCurrency(kpis.totalSpent)}</div>
                    </div>
                    <div className="card p-lg bg-white border-l-4 border-success">
                        <div className="text-muted text-sm font-medium mb-xs">Taxa de Aprovação</div>
                        <div className="text-2xl font-bold text-dark">{kpis.approvalRate}%</div>
                    </div>
                    <div className="card p-lg bg-white border-l-4 border-warning">
                        <div className="text-muted text-sm font-medium mb-xs">Total de Pedidos</div>
                        <div className="text-2xl font-bold text-dark">{kpis.totalRequests}</div>
                    </div>
                    <div className="card p-lg bg-white border-l-4 border-info">
                        <div className="text-muted text-sm font-medium mb-xs">Tempo Médio Aprov.</div>
                        <div className="text-2xl font-bold text-dark">{kpis.avgApprovalTime}</div>
                    </div>
                </div>

                <div className="grid-2 gap-lg mb-lg">
                    {/* Monthly Trend */}
                    <div className="card p-lg">
                        <h3 className="text-lg font-bold mb-md">Evolução de Gastos (6 Meses)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val / 1000}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="card p-lg">
                        <h3 className="text-lg font-bold mb-md">Status dos Pedidos</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid-2 gap-lg">
                    {/* Department Spend */}
                    <div className="card p-lg">
                        <h3 className="text-lg font-bold mb-md">Gastos por Departamento</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div className="card p-lg">
                        <h3 className="text-lg font-bold mb-md">Top 5 Fornecedores</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVendorsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .grid-4 {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                }
                .border-l-4 {
                    border-left-width: 4px;
                }
                .border-primary { border-left-color: var(--color-primary); }
                .border-success { border-left-color: var(--color-success); }
                .border-warning { border-left-color: var(--color-warning); }
                .border-info { border-left-color: #0ea5e9; }
                
                @media (max-width: 1024px) {
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .grid-4, .grid-2 { grid-template-columns: 1fr; }
                }
            `}</style>
        </Layout>
    );
};

export default Reports;
