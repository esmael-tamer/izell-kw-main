import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

interface SalesChartProps {
    type?: 'line' | 'area' | 'bar';
}

export function SalesChart({ type = 'area' }: SalesChartProps) {
    const { i18n } = useTranslation();

    // Sample data - في التطبيق الحقيقي، سيأتي من API
    const data = [
        { month: i18n.language === 'ar' ? 'يناير' : 'Jan', sales: 45, orders: 12 },
        { month: i18n.language === 'ar' ? 'فبراير' : 'Feb', sales: 52, orders: 15 },
        { month: i18n.language === 'ar' ? 'مارس' : 'Mar', sales: 48, orders: 13 },
        { month: i18n.language === 'ar' ? 'أبريل' : 'Apr', sales: 61, orders: 18 },
        { month: i18n.language === 'ar' ? 'مايو' : 'May', sales: 55, orders: 16 },
        { month: i18n.language === 'ar' ? 'يونيو' : 'Jun', sales: 67, orders: 20 },
        { month: i18n.language === 'ar' ? 'يوليو' : 'Jul', sales: 72, orders: 22 },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <p className="font-arabic text-sm font-bold text-slate-900 mb-2">{payload[0].payload.month}</p>
                    <p className="font-arabic text-xs text-emerald-600 font-semibold">
                        {i18n.language === 'ar' ? 'المبيعات' : 'Sales'}: {payload[0].value} {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                    </p>
                    <p className="font-arabic text-xs text-blue-600 font-semibold">
                        {i18n.language === 'ar' ? 'الطلبات' : 'Orders'}: {payload[1].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: 0, bottom: 0 },
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px' }} />
                        <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                );

            default: // area
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
        </ResponsiveContainer>
    );
}
